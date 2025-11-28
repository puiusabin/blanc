import PostalMime from "postal-mime";
import type { Email, EmailAddress, EmailAttachment } from "@/types/email";
import { nanoid } from "nanoid";

export async function parseEml(emlContent: string): Promise<Email> {
  const parser = new PostalMime();
  const parsed = await parser.parse(emlContent);

  // Extract From address
  const from: EmailAddress = parsed.from
    ? {
        name: parsed.from.name || parsed.from.address,
        email: parsed.from.address,
      }
    : { name: "Unknown", email: "unknown@example.com" };

  // Extract To addresses
  const to: EmailAddress[] =
    parsed.to?.map((addr) => ({
      name: addr.name || addr.address,
      email: addr.address,
    })) || [];

  // Extract CC addresses
  const cc: EmailAddress[] | undefined =
    parsed.cc?.map((addr) => ({
      name: addr.name || addr.address,
      email: addr.address,
    })) || undefined;

  // Extract BCC addresses (usually not present in .eml files)
  const bcc: EmailAddress[] | undefined =
    parsed.bcc?.map((addr) => ({
      name: addr.name || addr.address,
      email: addr.address,
    })) || undefined;

  // Extract subject
  const subject = parsed.subject || "(No Subject)";

  // Extract body text and HTML
  const bodyText = parsed.text || "";
  const bodyHtml = parsed.html || undefined;

  // Create preview from text (first 150 chars)
  const preview = bodyText.replace(/\s+/g, " ").trim().substring(0, 150);

  // Extract timestamp
  const timestamp = parsed.date || new Date().toISOString();

  // Extract attachments
  const attachments: EmailAttachment[] = parsed.attachments
    ? parsed.attachments.map((att) => ({
        id: nanoid(),
        filename: att.filename || "untitled",
        mimeType: att.mimeType || "application/octet-stream",
        size: att.content?.length || 0,
        r2Key: `mock/${nanoid()}/${att.filename}`, // Mock R2 key
        url: att.content
          ? `data:${att.mimeType};base64,${Buffer.from(att.content).toString("base64")}`
          : undefined,
      }))
    : [];

  // Create Email object
  const email: Email = {
    id: nanoid(),
    from,
    to,
    cc,
    bcc,
    subject,
    preview,
    bodyText,
    bodyHtml,
    timestamp,
    isRead: false, // Default to unread
    isStarred: false,
    folder: "inbox", // Default to inbox
    hasAttachments: attachments.length > 0,
    attachments: attachments.length > 0 ? attachments : undefined,
    inReplyTo: parsed.inReplyTo || undefined,
    threadId: parsed.messageId || undefined,
  };

  return email;
}

export function parseEmailAddress(addressString: string): EmailAddress {
  // Simple email address parser for edge cases
  const match = addressString.match(/^(.+?)\s*<(.+)>$/);
  if (match) {
    return {
      name: match[1].trim(),
      email: match[2].trim(),
    };
  }
  return {
    name: addressString,
    email: addressString,
  };
}
