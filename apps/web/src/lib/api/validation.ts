import { z } from "zod";
import type { EmailQueryParams } from "@/types/email";

const uuidSchema = z.string().uuid();
const emailIdsSchema = z.array(z.string().uuid()).min(1).max(100);
const folderSchema = z.enum(["INBOX", "SENT", "DRAFTS", "SPAM", "TRASH", "ARCHIVE"]);
const queryParamsSchema = z.object({
  folder: folderSchema.optional(),
  since: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

export function validateEmailIds(input: unknown): string[] {
  const result = emailIdsSchema.safeParse(input);
  if (!result.success) {
    throw new Error("Invalid emailIds: must be array of UUIDs, max 100 items");
  }
  return result.data;
}

export function validateFolder(folder: unknown): string {
  const result = folderSchema.safeParse(folder);
  if (!result.success) {
    throw new Error(`Invalid folder: must be one of ${folderSchema.options.join(", ")}`);
  }
  return result.data;
}

export function validateEnvVars(vars: Record<string, string | undefined>): void {
  const missing = Object.entries(vars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

export function validateEmailQueryParams(input: unknown): EmailQueryParams {
  const result = queryParamsSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid query params: ${result.error.message}`);
  }
  return result.data;
}
