import { NextRequest, NextResponse } from "next/server";
import { prisma, EmailFolder } from "@blanc/database";
import { APIError, handleAPIError } from "@/lib/api/error";
import { S3 } from "aws-sdk";
import { gunzipSync } from "zlib";

// Environment validation
function validateEnvVars() {
  const required = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"];
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
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

interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
}

interface EmailInThread {
  id: string;
  messageId: string | null;
  from: { email: string; name: string | null } | null;
  to: { email: string; name: string | null }[];
  cc?: { email: string; name: string | null }[];
  subject: string;
  timestamp: string;
  bodyText: string | null;
  bodyHtml: string | null;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new APIError(401, "Unauthorized");
    }

    const { threadId } = await params;

    // Fetch thread with all emails
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        emails: {
          where: {
            status: "STORED",
          },
          orderBy: {
            dateReceived: "asc", // Chronological order
          },
          select: {
            id: true,
            messageId: true,
            r2DatagramPath: true,
            dateReceived: true,
            isRead: true,
            isStarred: true,
            hasAttachments: true,
          },
        },
      },
    });

    if (!thread) {
      throw new APIError(404, "Thread not found");
    }

    // Verify ownership
    if (thread.userId !== userId) {
      throw new APIError(403, "Forbidden");
    }

    // Fetch R2 datagrams for all emails
    const s3 = getR2Client();
    const emailPromises = thread.emails.map(async (email) => {
      try {
        const response = await s3
          .getObject({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: email.r2DatagramPath,
          })
          .promise();

        if (!response.Body) {
          throw new Error("Empty response body");
        }

        const decompressed = gunzipSync(response.Body as Buffer);
        const datagram = JSON.parse(decompressed.toString("utf-8"));

        const emailData: EmailInThread = {
          id: email.id,
          messageId: email.messageId,
          from: datagram.headers.from,
          to: datagram.headers.to,
          cc: datagram.headers.cc,
          subject: datagram.headers.subject,
          timestamp: email.dateReceived.toISOString(),
          bodyText: datagram.body.text,
          bodyHtml: datagram.body.html,
          isRead: email.isRead,
          isStarred: email.isStarred,
          hasAttachments: email.hasAttachments,
          attachments: datagram.attachments,
        };

        return emailData;
      } catch (error) {
        console.error(`Failed to fetch email ${email.id}:`, error);
        throw error;
      }
    });

    const emails = await Promise.all(emailPromises);

    return NextResponse.json({
      thread: {
        id: thread.id,
        subject: thread.subject,
        participants: thread.participants,
        messageCount: thread.messageCount,
        unreadCount: thread.unreadCount,
        hasAttachments: thread.hasAttachments,
        isStarred: thread.isStarred,
        folder: thread.folder,
        lastMessageAt: thread.lastMessageAt.toISOString(),
        firstMessageAt: thread.firstMessageAt.toISOString(),
      },
      emails,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

// PATCH endpoint to update thread state
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new APIError(401, "Unauthorized");
    }

    const { threadId } = await params;
    const body = (await request.json()) as { folder?: string; isStarred?: boolean };

    // Verify thread ownership
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { userId: true },
    });

    if (!thread) {
      throw new APIError(404, "Thread not found");
    }

    if (thread.userId !== userId) {
      throw new APIError(403, "Forbidden");
    }

    // Update thread
    const updated = await prisma.thread.update({
      where: { id: threadId },
      data: {
        folder: body.folder as EmailFolder | undefined,
        isStarred: body.isStarred,
      },
    });

    return NextResponse.json({
      thread: {
        id: updated.id,
        folder: updated.folder,
        isStarred: updated.isStarred,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
