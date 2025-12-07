import { z } from "zod";

/**
 * Zod schema for R2EmailAddress
 */
const r2EmailAddressSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

/**
 * Zod schema for R2 email attachment metadata
 */
const r2AttachmentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  contentId: z.string().nullable(),
  isInline: z.boolean(),
  r2Path: z.string(),
  emailId: z.string().uuid(),
});

/**
 * Zod schema for R2EmailDatagram
 * Validates complete structure of email datagrams stored in R2
 */
export const r2EmailDatagramSchema = z.object({
  version: z.literal("1.0"),
  emailId: z.string().uuid(),
  messageId: z.string().nullable(),
  userId: z.string().uuid(),
  headers: z.object({
    from: r2EmailAddressSchema.nullable(),
    to: z.array(r2EmailAddressSchema),
    cc: z.array(r2EmailAddressSchema),
    bcc: z.array(r2EmailAddressSchema),
    replyTo: r2EmailAddressSchema.nullable(),
    subject: z.string(),
    date: z.string().datetime(),
    messageId: z.string().nullable(),
    inReplyTo: z.string().nullable(),
    references: z.array(z.string()),
    priority: z.string().nullable(),
    raw: z.record(z.string(), z.string()),
  }),
  body: z.object({
    html: z.string().nullable(),
    text: z.string().nullable(),
    textAsHtml: z.string().nullable(),
  }),
  attachments: z.array(r2AttachmentSchema),
  sizeBytes: z.number().int().nonnegative(),
  receivedAt: z.string().datetime(),
  encrypted: z.boolean(),
  parsed: z.object({
    parserVersion: z.string(),
    parsedAt: z.string().datetime(),
    warnings: z.array(z.string()),
  }),
});

/**
 * Type guard for R2EmailDatagram
 * Validates and returns typed datagram, or throws descriptive error
 */
export function validateR2EmailDatagram(data: unknown): z.infer<typeof r2EmailDatagramSchema> {
  return r2EmailDatagramSchema.parse(data);
}

/**
 * Safe variant that returns validation result without throwing
 */
export function safeValidateR2EmailDatagram(
  data: unknown
):
  | { success: true; data: z.infer<typeof r2EmailDatagramSchema> }
  | { success: false; error: z.ZodError } {
  const result = r2EmailDatagramSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
