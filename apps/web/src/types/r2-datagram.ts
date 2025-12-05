export interface R2EmailAddress {
  name: string;
  email: string;
}

export interface R2EmailDatagram {
  version: "1.0";
  emailId: string;
  messageId: string | null;
  userId: string;
  headers: {
    from: R2EmailAddress | null;
    to: R2EmailAddress[];
    cc: R2EmailAddress[];
    bcc: R2EmailAddress[];
    replyTo: R2EmailAddress | null;
    subject: string;
    date: string;
    messageId: string | null;
    inReplyTo: string | null;
    references: string[];
    priority: string | null;
    raw: Record<string, string>;
  };
  body: {
    html: string | null;
    text: string | null;
    textAsHtml: string | null;
  };
  attachments: Array<{
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    contentId: string | null;
    isInline: boolean;
    r2Path: string;
    emailId: string;
  }>;
  sizeBytes: number;
  receivedAt: string;
  encrypted: boolean;
  parsed: {
    parserVersion: string;
    parsedAt: string;
    warnings: string[];
  };
}
