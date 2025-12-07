import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blanc/database";
import AWS from "aws-sdk";
import { gunzipSync } from "zlib";
import type { R2EmailDatagram } from "@/types/r2-datagram";
import { validateEmailIds, validateEnvVars } from "@/lib/api/validation";
import { APIError, handleAPIError } from "@/lib/api/error";
import { safeValidateR2EmailDatagram } from "@/lib/email/r2-validation";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new APIError(401, "Unauthorized");
    }

    validateEnvVars({
      R2_ENDPOINT: process.env.R2_ENDPOINT,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    });

    const body = (await request.json()) as { emailIds: unknown };
    const emailIds = validateEmailIds(body.emailIds);

    const emails = await prisma.email.findMany({
      where: {
        id: { in: emailIds },
        userId: userId,
      },
      select: { id: true, r2DatagramPath: true },
    });

    if (emails.length !== emailIds.length) {
      throw new APIError(403, "Access denied to one or more emails");
    }

    const s3 = new AWS.S3({
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      region: "auto",
      signatureVersion: "v4",
      s3ForcePathStyle: true,
    });

    const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        console.log("[R2] Fetching:", {
          bucket: BUCKET_NAME,
          key: email.r2DatagramPath,
          emailId: email.id,
        });

        const response = await s3
          .getObject({
            Bucket: BUCKET_NAME,
            Key: email.r2DatagramPath,
          })
          .promise();

        if (!response.Body) {
          throw new Error(`No body in R2 response for ${email.id}`);
        }

        const buffer = Buffer.isBuffer(response.Body)
          ? response.Body
          : Buffer.from(response.Body as string);

        const decompressed = gunzipSync(buffer);

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(decompressed.toString("utf-8"));
        } catch (parseError) {
          throw new Error(
            `Invalid JSON in R2 object ${email.r2DatagramPath}: ${
              parseError instanceof Error ? parseError.message : String(parseError)
            }`
          );
        }

        // Validate schema
        const validation = safeValidateR2EmailDatagram(parsed);
        if (!validation.success) {
          const errorDetails = validation.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ");
          throw new Error(`Invalid R2EmailDatagram schema for ${email.id}: ${errorDetails}`);
        }

        return { id: email.id, datagram: validation.data };
      })
    );

    const datagrams: Record<string, R2EmailDatagram> = {};
    const errors: Array<{ emailId: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        datagrams[result.value.id] = result.value.datagram;
      } else {
        const email = emails[index];
        errors.push({ emailId: email.id, error: result.reason.message });
        console.error(`Error fetching datagram for email ${email.id}:`, result.reason);
      }
    });

    return NextResponse.json({
      emails: datagrams,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        total: emails.length,
        success: Object.keys(datagrams).length,
        failed: errors.length,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
