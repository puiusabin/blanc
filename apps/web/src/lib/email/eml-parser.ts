import PostalMime from "postal-mime";
import type { Email, EmailAddress, EmailAttachment } from "@/types/email";
import { nanoid } from "nanoid";

/**
 * Decodes HTML entities using the browser's native HTML parser
 * Handles ALL HTML entities correctly (numeric, hex, and named)
 * @param html - HTML string with potential entities
 * @returns Decoded HTML string
 */
function decodeHtmlEntities(html: string): string {
  if (typeof document === "undefined") {
    // Server-side fallback: use manual decoding for numeric entities only
    // Named entities will pass through unchanged (safer than corrupting them)
    let decoded = html;

    // Decode hex numeric entities (&#x2F; → /)
    decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // Decode decimal numeric entities (&#47; → /)
    decoded = decoded.replace(/&#([0-9]+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });

    // Don't attempt named entity decoding server-side
    // Let the browser handle it during rendering
    return decoded;
  }

  // Client-side: use browser's native HTML entity decoder
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

/**
 * Extracts readable text from HTML content for preview generation
 * Removes scripts, styles, comments, and HTML tags
 * @param html - Raw HTML string
 * @returns First 150 characters of extracted text
 */
function extractTextFromHtml(html: string): string {
  let text = html;

  // Remove script tags and content
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

  // Remove style tags and content
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

  // Remove HTML comments (including MSO conditionals)
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Normalize whitespace and limit to 150 characters
  return text.replace(/\s+/g, " ").trim().substring(0, 150);
}

export async function parseEml(emlContent: string): Promise<Email> {
  const parser = new PostalMime();
  const parsed = await parser.parse(emlContent);

  // Extract From address
  const from: EmailAddress = parsed.from
    ? {
        name: parsed.from.name || parsed.from.address || "Unknown",
        email: parsed.from.address || "unknown@example.com",
      }
    : { name: "Unknown", email: "unknown@example.com" };

  // Extract To addresses
  const to: EmailAddress[] =
    parsed.to?.map((addr) => ({
      name: addr.name || addr.address || "Unknown",
      email: addr.address || "unknown@example.com",
    })) || [];

  // Extract CC addresses
  const cc: EmailAddress[] | undefined =
    parsed.cc?.map((addr) => ({
      name: addr.name || addr.address || "Unknown",
      email: addr.address || "unknown@example.com",
    })) || undefined;

  // Extract BCC addresses (usually not present in .eml files)
  const bcc: EmailAddress[] | undefined =
    parsed.bcc?.map((addr) => ({
      name: addr.name || addr.address || "Unknown",
      email: addr.address || "unknown@example.com",
    })) || undefined;

  // Extract subject
  const subject = parsed.subject || "(No Subject)";

  // Extract body text and HTML
  const bodyText = parsed.text || "";
  const bodyHtml = parsed.html || undefined;

  // Create preview: prefer plain text, fallback to HTML extraction
  let preview = "";
  if (bodyText) {
    preview = bodyText.replace(/\s+/g, " ").trim().substring(0, 150);
  } else if (bodyHtml) {
    preview = extractTextFromHtml(bodyHtml);
  }

  // Extract timestamp
  const timestamp = parsed.date || new Date().toISOString();

  // Extract attachments
  const attachments: EmailAttachment[] = parsed.attachments
    ? parsed.attachments.map((att) => {
        const size = att.content
          ? att.content instanceof ArrayBuffer
            ? att.content.byteLength
            : att.content.length
          : 0;
        let base64 = "";
        if (att.content) {
          if (att.content instanceof ArrayBuffer) {
            base64 = Buffer.from(new Uint8Array(att.content)).toString("base64");
          } else if (typeof att.content === "string") {
            base64 = Buffer.from(att.content).toString("base64");
          } else {
            base64 = Buffer.from(att.content).toString("base64");
          }
        }
        return {
          id: nanoid(),
          filename: att.filename || "untitled",
          mimeType: att.mimeType || "application/octet-stream",
          size,
          r2Key: `mock/${nanoid()}/${att.filename}`, // Mock R2 key
          url: att.content ? `data:${att.mimeType};base64,${base64}` : undefined,
        };
      })
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
    folder: "INBOX", // Default to inbox
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
