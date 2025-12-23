import { NextRequest, NextResponse } from "next/server";
import { db, threads, emails, EmailFolder, eq, and, desc, count } from "@blanc/database";
import { APIError, handleAPIError } from "@/lib/api/error";
import { S3 } from "aws-sdk";
import { gunzipSync } from "zlib";

// Environment validation
function validateEnvVars() {
  const required = {
    R2_ENDPOINT: "Cloudflare R2 endpoint URL",
    R2_ACCESS_KEY_ID: "R2 access key ID",
    R2_SECRET_ACCESS_KEY: "R2 secret access key",
    R2_BUCKET_NAME: "R2 bucket name",
  };

  const missing = Object.entries(required)
    .filter(([key]) => !process.env[key])
    .map(([key, description]) => `${key} (${description})`);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join("\n")}\n\n` +
        `Get credentials from: https://dash.cloudflare.com → R2 → Manage R2 API Tokens`
    );
  }
}

// Initialize S3 client for R2
function getR2Client() {
  validateEnvVars();
  return new S3({
    endpoint: process.env.R2_ENDPOINT!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    s3ForcePathStyle: true,
    signatureVersion: "v4",
  });
}

interface ThreadResponse {
  id: string;
  userId: string;
  subject: string;
  participants: { email: string; name: string | null }[];
  messageCount: number;
  unreadCount: number;
  hasAttachments: boolean;
  isStarred: boolean;
  folder: (typeof EmailFolder.enumValues)[number];
  lastMessageAt: string;
  firstMessageAt: string;
  preview?: {
    from: { email: string; name: string | null } | null;
    snippet: string;
    timestamp: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new APIError(401, "Unauthorized");
    }

    const searchParams = request.nextUrl.searchParams;
    const folder = (searchParams.get("folder") ||
      "INBOX") as (typeof EmailFolder.enumValues)[number];
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Query threads with latest email for preview
    const threadsData = await db.query.threads.findMany({
      where: and(eq(threads.userId, userId), eq(threads.folder, folder)),
      orderBy: [desc(threads.lastMessageAt)],
      limit,
      offset,
      with: {
        emails: {
          where: eq(emails.status, "STORED"),
          orderBy: [desc(emails.dateReceived)],
          limit: 1,
          columns: {
            id: true,
            r2DatagramPath: true,
            dateReceived: true,
          },
        },
      },
    });

    // Fetch R2 datagrams for previews
    const s3 = getR2Client();
    const previewPromises = threadsData.map(async (thread) => {
      if (!thread.emails[0]) {
        return null;
      }

      try {
        const response = await s3
          .getObject({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: thread.emails[0].r2DatagramPath,
          })
          .promise();

        if (!response.Body) {
          return null;
        }

        const decompressed = gunzipSync(response.Body as Buffer);
        const datagram = JSON.parse(decompressed.toString("utf-8"));

        return {
          threadId: thread.id,
          from: datagram.headers.from,
          snippet: (datagram.body.text || datagram.body.html || "").substring(0, 150),
          timestamp: thread.emails[0].dateReceived.toISOString(),
        };
      } catch (error) {
        console.error(`Failed to fetch preview for thread ${thread.id}:`, error);
        return null;
      }
    });

    const previews = await Promise.all(previewPromises);
    const previewMap = new Map(previews.filter((p) => p !== null).map((p) => [p!.threadId, p!]));

    // Build response
    const threadsResponse: ThreadResponse[] = threadsData.map((thread) => {
      const preview = previewMap.get(thread.id);
      return {
        id: thread.id,
        userId: thread.userId,
        subject: thread.subject,
        participants: thread.participants as { email: string; name: string | null }[],
        messageCount: thread.messageCount,
        unreadCount: thread.unreadCount,
        hasAttachments: thread.hasAttachments,
        isStarred: thread.isStarred,
        folder: thread.folder,
        lastMessageAt: thread.lastMessageAt.toISOString(),
        firstMessageAt: thread.firstMessageAt.toISOString(),
        preview: preview
          ? {
              from: preview.from,
              snippet: preview.snippet,
              timestamp: preview.timestamp,
            }
          : undefined,
      };
    });

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(threads)
      .where(and(eq(threads.userId, userId), eq(threads.folder, folder)));

    return NextResponse.json({
      threads: threadsResponse,
      hasMore: offset + limit < total,
      total,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
