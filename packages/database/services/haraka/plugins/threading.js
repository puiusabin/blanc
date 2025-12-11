/**
 * Email Threading Module
 * Implements strict header-based threading using RFC 5322 headers
 * (Message-ID, References, In-Reply-To)
 *
 * Based on Jamie Zawinski's threading algorithm, simplified for
 * server-side computation at ingestion time.
 */

/**
 * Compute thread ID for an incoming email
 * Uses strict header-based matching (no subject fallback)
 *
 * @param {Object} headers - Parsed email headers from MailParser
 * @param {String} headers.messageId - RFC Message-ID header
 * @param {Array<String>} headers.references - References header (array of message IDs)
 * @param {String} headers.inReplyTo - In-Reply-To header
 * @param {String} userId - Recipient user ID
 * @param {Object} prisma - Prisma client instance
 * @returns {Promise<String|null>} Thread UUID (existing or null for new thread)
 */
async function computeThreadId(headers, userId, prisma) {
  // Step 1: Check References header (most reliable)
  // References[0] contains the root message-id of the thread
  if (headers.references && headers.references.length > 0) {
    const rootMessageId = headers.references[0];

    const thread = await prisma.thread.findFirst({
      where: {
        userId,
        OR: [
          { rootMessageId },
          // Fallback: check if any email in thread has this message-id
          // (handles case where rootMessageId wasn't set correctly)
          { emails: { some: { messageId: rootMessageId } } }
        ]
      },
      select: { id: true }
    });

    if (thread) {
      return thread.id;
    }
  }

  // Step 2: Check In-Reply-To header
  // Find thread containing the parent message
  if (headers.inReplyTo) {
    const thread = await prisma.thread.findFirst({
      where: {
        userId,
        emails: { some: { messageId: headers.inReplyTo } }
      },
      select: { id: true }
    });

    if (thread) {
      return thread.id;
    }
  }

  // Step 3: No match found - caller will create new thread
  return null;
}

/**
 * Merge new participants with existing thread participants
 * Deduplicates by email address (case-insensitive)
 *
 * @param {Object} headers - Parsed email headers
 * @param {Object} headers.from - From address { email, name }
 * @param {Array<Object>} headers.to - To addresses [{ email, name }]
 * @param {Array<Object>} headers.cc - CC addresses [{ email, name }]
 * @param {Array<Object>} existingParticipants - Current thread participants
 * @returns {Array<Object>} Updated participants list [{ email, name }]
 */
function mergeParticipants(headers, existingParticipants = []) {
  const participants = new Map();

  // Add existing participants (preserve original names)
  existingParticipants.forEach(p => {
    participants.set(p.email.toLowerCase(), p);
  });

  // Collect all addresses from headers
  const addresses = [
    headers.from,
    ...(headers.to || []),
    ...(headers.cc || [])
  ].filter(Boolean);

  // Add new participants (if not already present)
  addresses.forEach(addr => {
    const key = addr.email.toLowerCase();
    if (!participants.has(key)) {
      participants.set(key, {
        email: addr.email,
        name: addr.name || null
      });
    }
  });

  return Array.from(participants.values());
}

module.exports = {
  computeThreadId,
  mergeParticipants
};
