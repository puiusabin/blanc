import type { Email, EmailAddress, EmailFolder, EmailAttachment } from "@/types/email"

const mockSenders: EmailAddress[] = [
  { name: "Alice Johnson", email: "alice@example.com" },
  { name: "Bob Smith", email: "bob@company.com" },
  { name: "Carol White", email: "carol.white@startup.io" },
  { name: "David Lee", email: "david@tech.com" },
  { name: "Emma Davis", email: "emma.davis@design.co" },
  { name: "Frank Miller", email: "frank@sales.com" },
  { name: "Grace Chen", email: "grace@marketing.io" },
  { name: "Henry Wilson", email: "henry.wilson@dev.com" },
]

const mockRecipient: EmailAddress = {
  name: "You",
  email: "you@blanc.is",
}

const emailTemplates = [
  {
    subject: "Meeting Tomorrow",
    preview: "Hi, just wanted to confirm our meeting...",
    bodyText: "Hi,\n\nJust wanted to confirm our meeting scheduled for tomorrow at 2 PM. Please let me know if you're still available.\n\nLooking forward to discussing the project details.\n\nBest regards",
  },
  {
    subject: "Project Update",
    preview: "The latest updates on the project are...",
    bodyText: "Hello,\n\nThe latest updates on the project are looking good. We've completed the initial phase and are moving into testing.\n\nI'll send over the detailed report by end of day.\n\nThanks",
  },
  {
    subject: "Re: Budget Proposal",
    preview: "I've reviewed the budget and have some...",
    bodyText: "Hi there,\n\nI've reviewed the budget proposal and have some suggestions for improvements. Overall it looks solid, but we might need to adjust a few line items.\n\nCan we schedule a call to discuss?\n\nRegards",
  },
  {
    subject: "Welcome to the team!",
    preview: "We're excited to have you on board...",
    bodyText: "Welcome!\n\nWe're excited to have you on board. Your first day will be next Monday. HR will send over the onboarding schedule shortly.\n\nFeel free to reach out if you have any questions.\n\nBest",
  },
  {
    subject: "Invoice #1234",
    preview: "Please find attached the invoice for...",
    bodyText: "Hi,\n\nPlease find attached the invoice for this month's services. Payment is due within 30 days.\n\nLet me know if you have any questions.\n\nThank you",
  },
  {
    subject: "Quick Question",
    preview: "Do you have a moment to discuss...",
    bodyText: "Hey,\n\nDo you have a moment to discuss the timeline for the upcoming release? I have a few concerns about the current schedule.\n\nLet me know when you're free.\n\nThanks",
  },
  {
    subject: "Weekly Report",
    preview: "Here's the summary of this week's progress...",
    bodyText: "Hi team,\n\nHere's the summary of this week's progress:\n\n- Completed feature A\n- Started work on feature B\n- Fixed 12 bugs\n- Updated documentation\n\nNext week's plan will be shared tomorrow.\n\nBest",
  },
  {
    subject: "Urgent: Server Issue",
    preview: "We're experiencing some downtime...",
    bodyText: "URGENT\n\nWe're experiencing some downtime on the production servers. The team is investigating and we expect to have it resolved within the hour.\n\nWill keep you updated.\n\nDevOps Team",
  },
]

const timeOptions = [
  "Just now",
  "5 minutes ago",
  "10:30 AM",
  "9:15 AM",
  "Yesterday",
  "2 days ago",
  "Last week",
  "2 weeks ago",
]

function generateMockAttachment(): EmailAttachment {
  const filenames = ["document.pdf", "presentation.pptx", "image.png", "data.xlsx", "report.docx"]
  const filename = filenames[Math.floor(Math.random() * filenames.length)]
  const extension = filename.split(".")[1]

  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    png: "image/png",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  }

  return {
    id: `att-${Math.random().toString(36).substring(7)}`,
    filename,
    mimeType: mimeTypes[extension] || "application/octet-stream",
    size: Math.floor(Math.random() * 5000000) + 10000,
    r2Key: `attachments/${Date.now()}-${filename}`,
  }
}

export function generateMockEmail(index: number, folder: EmailFolder = "inbox"): Email {
  const template = emailTemplates[index % emailTemplates.length]
  const sender = mockSenders[index % mockSenders.length]
  const hasAttachments = Math.random() > 0.7
  const isRead = Math.random() > 0.4

  return {
    id: `email-${index + 1}`,
    from: sender,
    to: [mockRecipient],
    subject: template.subject,
    preview: template.preview,
    bodyText: `${template.bodyText}\n\n${sender.name}`,
    timestamp: new Date(Date.now() - index * 3600000).toISOString(),
    isRead: folder === "sent" ? true : isRead,
    isStarred: Math.random() > 0.8,
    folder,
    hasAttachments,
    attachments: hasAttachments ? [generateMockAttachment()] : undefined,
  }
}

export function generateMockEmails(count: number = 20, folder: EmailFolder = "inbox"): Email[] {
  return Array.from({ length: count }, (_, i) => generateMockEmail(i, folder))
}

// Legacy format converter (for gradual migration from old format)
export function convertLegacyEmail(legacyEmail: any): Email {
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
    folder: "inbox",
    hasAttachments: false,
  }
}

export const mockEmails = {
  inbox: generateMockEmails(20, "inbox"),
  sent: generateMockEmails(15, "sent"),
  drafts: generateMockEmails(5, "drafts"),
  spam: generateMockEmails(10, "spam"),
  trash: generateMockEmails(8, "trash"),
  archive: generateMockEmails(30, "archive"),
}

export function getMockEmailById(id: string): Email | undefined {
  return Object.values(mockEmails)
    .flat()
    .find((email) => email.id === id)
}

export function getMockEmailsByFolder(folder: EmailFolder): Email[] {
  return mockEmails[folder] || []
}
