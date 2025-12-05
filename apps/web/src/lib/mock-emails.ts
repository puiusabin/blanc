import type { Email, EmailAddress, EmailFolder, EmailAttachment } from "@/types/email";

const mockSenders: EmailAddress[] = [
  { name: "Alice Johnson", email: "alice@example.com" },
  { name: "Bob Smith", email: "bob@company.com" },
  { name: "Carol White", email: "carol.white@startup.io" },
  { name: "David Lee", email: "david@tech.com" },
  { name: "Emma Davis", email: "emma.davis@design.co" },
  { name: "Frank Miller", email: "frank@sales.com" },
  { name: "Grace Chen", email: "grace@marketing.io" },
  { name: "Henry Wilson", email: "henry.wilson@dev.com" },
];

const mockRecipient: EmailAddress = {
  name: "You",
  email: "you@blanc.is",
};

const emailTemplates = [
  {
    subject: "Meeting Tomorrow",
    preview: "Hi, just wanted to confirm our meeting...",
    bodyText:
      "Hi,\n\nJust wanted to confirm our meeting scheduled for tomorrow at 2 PM. Please let me know if you're still available.\n\nLooking forward to discussing the project details.\n\nBest regards",
    bodyHtml:
      "<div><p>Hi,</p><p>Just wanted to confirm our meeting scheduled for <strong>tomorrow at 2 PM</strong>. Please let me know if you're still available.</p><p>Looking forward to discussing the project details.</p><p>Best regards</p></div>",
  },
  {
    subject: "Project Update",
    preview: "The latest updates on the project are...",
    bodyText:
      "Hello,\n\nThe latest updates on the project are looking good. We've completed the initial phase and are moving into testing.\n\nI'll send over the detailed report by end of day.\n\nThanks",
    bodyHtml:
      '<div><h2>Project Status Update</h2><p>The latest updates on the project are looking good. We\'ve completed the initial phase and are moving into testing.</p><ul><li>Phase 1: ✅ Complete</li><li>Phase 2: 🚧 In Progress</li><li>Phase 3: ⏳ Pending</li></ul><p>I\'ll send over the detailed report by end of day.</p><img src="https://via.placeholder.com/600x300/3b82f6/ffffff?text=Project+Dashboard" alt="Dashboard" /></div>',
  },
  {
    subject: "Re: Budget Proposal",
    preview: "I've reviewed the budget and have some...",
    bodyText:
      "Hi there,\n\nI've reviewed the budget proposal and have some suggestions for improvements. Overall it looks solid, but we might need to adjust a few line items.\n\nCan we schedule a call to discuss?\n\nRegards",
    bodyHtml:
      "<div><p>Hi there,</p><p>I've reviewed the budget proposal and have some suggestions for improvements. Overall it looks solid, but we might need to adjust a few line items.</p><p>Can we schedule a call to discuss?</p><p>Regards</p></div>",
  },
  {
    subject: "Welcome to the team!",
    preview: "We're excited to have you on board...",
    bodyText:
      "Welcome!\n\nWe're excited to have you on board. Your first day will be next Monday. HR will send over the onboarding schedule shortly.\n\nFeel free to reach out if you have any questions.\n\nBest",
    bodyHtml:
      '<div><h1>Welcome to Blanc! 🎉</h1><p>We\'re excited to have you on board. Your first day will be next Monday.</p><blockquote>"The best way to predict the future is to create it."</blockquote><p>HR will send over the onboarding schedule shortly.</p><table border="1" cellpadding="8"><thead><tr><th>Day</th><th>Activity</th></tr></thead><tbody><tr><td>Monday</td><td>Orientation</td></tr><tr><td>Tuesday</td><td>Team Introductions</td></tr><tr><td>Wednesday</td><td>Project Overview</td></tr></tbody></table></div>',
  },
  {
    subject: "Invoice #1234",
    preview: "Please find attached the invoice for...",
    bodyText:
      "Hi,\n\nPlease find attached the invoice for this month's services. Payment is due within 30 days.\n\nLet me know if you have any questions.\n\nThank you",
    bodyHtml:
      "<div><p>Hi,</p><p>Please find attached the invoice for this month's services. Payment is due within <strong>30 days</strong>.</p><p>Let me know if you have any questions.</p><p>Thank you</p></div>",
  },
  {
    subject: "Quick Question",
    preview: "Do you have a moment to discuss...",
    bodyText:
      "Hey,\n\nDo you have a moment to discuss the timeline for the upcoming release? I have a few concerns about the current schedule.\n\nLet me know when you're free.\n\nThanks",
    bodyHtml:
      "<div><p>Hey,</p><p>Do you have a moment to discuss the timeline for the <em>upcoming release</em>? I have a few concerns about the current schedule.</p><p>Let me know when you're free.</p><p>Thanks</p></div>",
  },
  {
    subject: "Weekly Report",
    preview: "Here's the summary of this week's progress...",
    bodyText:
      "Hi team,\n\nHere's the summary of this week's progress:\n\n- Completed feature A\n- Started work on feature B\n- Fixed 12 bugs\n- Updated documentation\n\nNext week's plan will be shared tomorrow.\n\nBest",
    bodyHtml:
      "<div><h3>Weekly Progress Report</h3><p>Hi team,</p><p>Here's the summary of this week's progress:</p><ul><li>Completed feature A</li><li>Started work on feature B</li><li>Fixed 12 bugs</li><li>Updated documentation</li></ul><p>Next week's plan will be shared tomorrow.</p><p>Best</p></div>",
  },
  {
    subject: "Urgent: Server Issue",
    preview: "We're experiencing some downtime...",
    bodyText:
      "URGENT\n\nWe're experiencing some downtime on the production servers. The team is investigating and we expect to have it resolved within the hour.\n\nWill keep you updated.\n\nDevOps Team",
    bodyHtml:
      "<div><p><strong>URGENT</strong></p><p>We're experiencing some downtime on the production servers. The team is investigating and we expect to have it resolved within the hour.</p><p>Will keep you updated.</p><p>DevOps Team</p></div>",
  },
];

function generateMockAttachment(): EmailAttachment {
  const filenames = ["document.pdf", "presentation.pptx", "image.png", "data.xlsx", "report.docx"];
  const filename = filenames[Math.floor(Math.random() * filenames.length)];
  const extension = filename.split(".")[1];

  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    png: "image/png",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return {
    id: `att-${Math.random().toString(36).substring(7)}`,
    filename,
    mimeType: mimeTypes[extension] || "application/octet-stream",
    size: Math.floor(Math.random() * 5000000) + 10000,
    r2Key: `attachments/${Date.now()}-${filename}`,
  };
}

export function generateMockEmail(index: number, folder: EmailFolder = "INBOX"): Email {
  const template = emailTemplates[index % emailTemplates.length];
  const sender = mockSenders[index % mockSenders.length];
  const hasAttachments = Math.random() > 0.7;
  const isRead = Math.random() > 0.4;
  const hasHtml = Math.random() > 0.3;

  return {
    id: `email-${index + 1}`,
    from: sender,
    to: [mockRecipient],
    subject: template.subject,
    preview: template.preview,
    bodyText: `${template.bodyText}\n\n${sender.name}`,
    bodyHtml: hasHtml ? template.bodyHtml : undefined,
    timestamp: new Date(Date.now() - index * 10800000).toISOString(),
    isRead: folder === "SENT" ? true : isRead,
    isStarred: Math.random() > 0.8,
    folder,
    hasAttachments,
    attachments: hasAttachments ? [generateMockAttachment()] : undefined,
  };
}

export function generateMockEmails(count: number = 20, folder: EmailFolder = "INBOX"): Email[] {
  return Array.from({ length: count }, (_, i) => generateMockEmail(i, folder));
}

// Legacy email format (for gradual migration from old format)
interface LegacyEmail {
  id?: string | number;
  from?: string;
  subject?: string;
  preview?: string;
  content?: string;
  read?: boolean;
}

// Legacy format converter (for gradual migration from old format)
export function convertLegacyEmail(legacyEmail: LegacyEmail): Email {
  return {
    id: legacyEmail.id?.toString() || `email-${Date.now()}`,
    from: {
      name: legacyEmail.from || "Unknown",
      email: `${legacyEmail.from?.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    },
    to: [mockRecipient],
    subject: legacyEmail.subject || "No Subject",
    preview: legacyEmail.preview || "",
    bodyText: legacyEmail.content || "",
    timestamp: new Date().toISOString(),
    isRead: legacyEmail.read || false,
    folder: "INBOX",
    hasAttachments: false,
  };
}

export const mockEmails = {
  inbox: generateMockEmails(20, "INBOX"),
  sent: generateMockEmails(15, "SENT"),
  drafts: generateMockEmails(5, "DRAFTS"),
  spam: generateMockEmails(10, "SPAM"),
  trash: generateMockEmails(8, "TRASH"),
  archive: generateMockEmails(30, "ARCHIVE"),
};

export function getMockEmailById(id: string): Email | undefined {
  return Object.values(mockEmails)
    .flat()
    .find((email) => email.id === id);
}

export function getMockEmailsByFolder(folder: EmailFolder): Email[] {
  const folderMap: Record<EmailFolder, keyof typeof mockEmails> = {
    INBOX: "inbox",
    SENT: "sent",
    DRAFTS: "drafts",
    SPAM: "spam",
    TRASH: "trash",
    ARCHIVE: "archive",
  };
  return mockEmails[folderMap[folder]] || [];
}
