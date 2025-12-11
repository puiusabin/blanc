/**
 * Threading Algorithm Tests
 * Tests for strict header-based threading logic
 */

const { computeThreadId, mergeParticipants } = require('../plugins/threading');

describe('Threading Algorithm', () => {
  let mockPrisma;

  beforeEach(() => {
    // Mock Prisma client
    mockPrisma = {
      thread: {
        findFirst: jest.fn()
      }
    };
  });

  describe('computeThreadId', () => {
    test('References header matches existing thread by rootMessageId', async () => {
      const headers = {
        references: ['<root@example.com>', '<parent@example.com>'],
        subject: 'Re: Test thread'
      };

      mockPrisma.thread.findFirst.mockResolvedValue({
        id: 'thread-uuid-123'
      });

      const threadId = await computeThreadId(headers, 'user-123', mockPrisma);

      expect(threadId).toBe('thread-uuid-123');
      expect(mockPrisma.thread.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          OR: [
            { rootMessageId: '<root@example.com>' },
            { emails: { some: { messageId: '<root@example.com>' } } }
          ]
        },
        select: { id: true }
      });
    });

    test('In-Reply-To header matches parent email', async () => {
      const headers = {
        inReplyTo: '<parent@example.com>',
        subject: 'Re: Test'
      };

      // First call (References check) returns null
      mockPrisma.thread.findFirst.mockResolvedValueOnce(null);
      // Second call (In-Reply-To check) returns thread
      mockPrisma.thread.findFirst.mockResolvedValueOnce({
        id: 'thread-uuid-456'
      });

      const threadId = await computeThreadId(headers, 'user-123', mockPrisma);

      expect(threadId).toBe('thread-uuid-456');
      expect(mockPrisma.thread.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrisma.thread.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          emails: { some: { messageId: '<parent@example.com>' } }
        },
        select: { id: true }
      });
    });

    test('No headers returns null (new thread)', async () => {
      const headers = {
        subject: 'New conversation'
      };

      const threadId = await computeThreadId(headers, 'user-123', mockPrisma);

      expect(threadId).toBeNull();
      expect(mockPrisma.thread.findFirst).not.toHaveBeenCalled();
    });

    test('No match found returns null', async () => {
      const headers = {
        references: ['<unknown@example.com>'],
        inReplyTo: '<also-unknown@example.com>'
      };

      mockPrisma.thread.findFirst.mockResolvedValue(null);

      const threadId = await computeThreadId(headers, 'user-123', mockPrisma);

      expect(threadId).toBeNull();
    });

    test('Empty references array is ignored', async () => {
      const headers = {
        references: [],
        inReplyTo: '<parent@example.com>'
      };

      mockPrisma.thread.findFirst.mockResolvedValue({
        id: 'thread-uuid-789'
      });

      const threadId = await computeThreadId(headers, 'user-123', mockPrisma);

      expect(threadId).toBe('thread-uuid-789');
      // Should only check In-Reply-To, not References
      expect(mockPrisma.thread.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('mergeParticipants', () => {
    test('Merges new participants with existing', () => {
      const existing = [
        { email: 'alice@example.com', name: 'Alice' }
      ];

      const headers = {
        from: { email: 'bob@example.com', name: 'Bob' },
        to: [
          { email: 'charlie@example.com', name: 'Charlie' }
        ]
      };

      const merged = mergeParticipants(headers, existing);

      expect(merged).toHaveLength(3);
      expect(merged).toContainEqual({ email: 'alice@example.com', name: 'Alice' });
      expect(merged).toContainEqual({ email: 'bob@example.com', name: 'Bob' });
      expect(merged).toContainEqual({ email: 'charlie@example.com', name: 'Charlie' });
    });

    test('Deduplicates by email (case-insensitive)', () => {
      const existing = [
        { email: 'alice@example.com', name: 'Alice' }
      ];

      const headers = {
        from: { email: 'bob@example.com', name: 'Bob' },
        to: [
          { email: 'ALICE@EXAMPLE.COM', name: 'Alice Smith' }, // Duplicate, different case
          { email: 'alice@example.com', name: 'Alice Johnson' } // Exact duplicate
        ]
      };

      const merged = mergeParticipants(headers, existing);

      expect(merged).toHaveLength(2);
      // Should keep original name from existing participants
      expect(merged.find(p => p.email === 'alice@example.com').name).toBe('Alice');
      expect(merged).toContainEqual({ email: 'bob@example.com', name: 'Bob' });
    });

    test('Handles null names', () => {
      const headers = {
        from: { email: 'alice@example.com', name: null },
        to: [
          { email: 'bob@example.com' } // No name property
        ]
      };

      const merged = mergeParticipants(headers, []);

      expect(merged).toHaveLength(2);
      expect(merged).toContainEqual({ email: 'alice@example.com', name: null });
      expect(merged).toContainEqual({ email: 'bob@example.com', name: null });
    });

    test('Handles CC addresses', () => {
      const headers = {
        from: { email: 'alice@example.com', name: 'Alice' },
        to: [{ email: 'bob@example.com', name: 'Bob' }],
        cc: [{ email: 'charlie@example.com', name: 'Charlie' }]
      };

      const merged = mergeParticipants(headers, []);

      expect(merged).toHaveLength(3);
      expect(merged).toContainEqual({ email: 'charlie@example.com', name: 'Charlie' });
    });

    test('Filters out null/undefined addresses', () => {
      const headers = {
        from: { email: 'alice@example.com', name: 'Alice' },
        to: null, // Could happen if no recipients
        cc: undefined
      };

      const merged = mergeParticipants(headers, []);

      expect(merged).toHaveLength(1);
      expect(merged).toContainEqual({ email: 'alice@example.com', name: 'Alice' });
    });

    test('Preserves original participant names when merging', () => {
      const existing = [
        { email: 'alice@example.com', name: 'Alice Original' },
        { email: 'bob@example.com', name: 'Bob Original' }
      ];

      const headers = {
        from: { email: 'alice@example.com', name: 'Alice New' },
        to: [
          { email: 'bob@example.com', name: 'Bob New' },
          { email: 'charlie@example.com', name: 'Charlie' }
        ]
      };

      const merged = mergeParticipants(headers, existing);

      expect(merged).toHaveLength(3);
      // Should preserve original names
      expect(merged.find(p => p.email === 'alice@example.com').name).toBe('Alice Original');
      expect(merged.find(p => p.email === 'bob@example.com').name).toBe('Bob Original');
      // New participant gets new name
      expect(merged).toContainEqual({ email: 'charlie@example.com', name: 'Charlie' });
    });
  });
});
