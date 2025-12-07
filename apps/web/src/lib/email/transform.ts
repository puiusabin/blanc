import type { R2EmailDatagram, R2EmailAddress } from "@/types/r2-datagram";
import type { EmailAddress, EmailFolder } from "@/types/email";
import type { DbEmail } from "@/lib/db";
import { normalizePriority, extractTextFromHtmlBasic } from "./utils";

interface EmailMetadata {
  id: string;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
}

function convertR2Address(addr: R2EmailAddress | null): EmailAddress {
  if (!addr) {
    return { name: "Unknown", email: "unknown@example.com" };
  }
  return { name: addr.name, email: addr.email };
}

function convertR2Addresses(addrs: R2EmailAddress[]): EmailAddress[] {
  return addrs.map((addr) => ({ name: addr.name, email: addr.email }));
}

export async function transformDatagramToEmail(
  datagram: R2EmailDatagram,
  metadata: EmailMetadata
): Promise<DbEmail> {
  let preview = "";
  if (datagram.body.text) {
    preview = datagram.body.text.substring(0, 150);
  } else if (datagram.body.html) {
    preview = extractTextFromHtmlBasic(datagram.body.html).substring(0, 150);
  }

  const email: DbEmail = {
    id: datagram.emailId,
    from: convertR2Address(datagram.headers.from),
    to: convertR2Addresses(datagram.headers.to),
    cc: datagram.headers.cc.length > 0 ? convertR2Addresses(datagram.headers.cc) : undefined,
    bcc: datagram.headers.bcc.length > 0 ? convertR2Addresses(datagram.headers.bcc) : undefined,
    subject: datagram.headers.subject,
    preview,
    bodyText: datagram.body.text || "",
    bodyHtml: datagram.body.html || undefined,
    timestamp: datagram.receivedAt,
    isRead: metadata.isRead,
    isStarred: metadata.isStarred,
    folder: metadata.folder as EmailFolder,
    hasAttachments: datagram.attachments.length > 0,
    attachments:
      datagram.attachments.length > 0
        ? datagram.attachments.map((att) => ({
            id: att.id,
            filename: att.filename,
            mimeType: att.mimeType,
            size: att.sizeBytes,
            r2Key: att.r2Path,
            url: undefined,
          }))
        : undefined,
    inReplyTo: datagram.headers.inReplyTo || undefined,
    replyTo: datagram.headers.replyTo ? convertR2Address(datagram.headers.replyTo) : undefined,
    references: datagram.headers.references.length > 0 ? datagram.headers.references : undefined,
    priority: normalizePriority(datagram.headers.priority),
    customHeaders: Object.keys(datagram.headers.raw).length > 0 ? datagram.headers.raw : undefined,
    syncedAt: Date.now(),
  };

  return email;
}
