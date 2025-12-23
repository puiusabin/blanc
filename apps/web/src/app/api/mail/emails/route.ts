import { NextRequest, NextResponse } from "next/server";
import { db, emails, eq, and, gt, desc, emailFolderEnum } from "@blanc/database";
import { validateEmailQueryParams } from "@/lib/api/validation";
import { APIError, handleAPIError } from "@/lib/api/error";

type EmailFolder = (typeof emailFolderEnum.enumValues)[number];

interface EmailMetadata {
  id: string;
  messageId: string | null;
  userId: string;
  dateReceived: string;
  dateSent: string | null;
  sizeBytes: string;
  r2DatagramPath: string;
  hasHtml: boolean;
  hasPlainText: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  isRead: boolean;
  isStarred: boolean;
  folder: EmailFolder;
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new APIError(401, "Unauthorized");
    }

    const searchParams = request.nextUrl.searchParams;

    const rawParams = {
      folder: searchParams.get("folder") || undefined,
      since: searchParams.get("since") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100,
    };

    const params = validateEmailQueryParams(rawParams);

    const whereConditions = [eq(emails.userId, userId), eq(emails.status, "STORED")];

    if (params.folder) {
      whereConditions.push(eq(emails.folder, params.folder as EmailFolder));
    }

    if (params.since) {
      whereConditions.push(gt(emails.dateReceived, new Date(params.since)));
    }

    const limit = params.limit || 100;

    const emailsData = await db.query.emails.findMany({
      where: and(...whereConditions),
      orderBy: [desc(emails.dateReceived)],
      limit,
      columns: {
        id: true,
        messageId: true,
        userId: true,
        dateReceived: true,
        dateSent: true,
        sizeBytes: true,
        r2DatagramPath: true,
        hasHtml: true,
        hasPlainText: true,
        hasAttachments: true,
        attachmentCount: true,
        isRead: true,
        isStarred: true,
        folder: true,
        status: true,
      },
    });

    const metadata: EmailMetadata[] = emailsData.map((email) => ({
      ...email,
      dateReceived: email.dateReceived.toISOString(),
      dateSent: email.dateSent ? email.dateSent.toISOString() : null,
      sizeBytes: email.sizeBytes.toString(),
    }));

    return NextResponse.json({
      emails: metadata,
      hasMore: emailsData.length === limit,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
