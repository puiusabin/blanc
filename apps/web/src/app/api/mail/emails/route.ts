import { NextRequest, NextResponse } from "next/server";
import { prisma, EmailFolder } from "@blanc/database";

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
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const folder = searchParams.get("folder") as EmailFolder | null;
    const since = searchParams.get("since");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const where: any = {
      userId,
      status: "STORED",
    };

    if (folder) {
      where.folder = folder;
    }

    if (since) {
      where.dateReceived = { gt: new Date(since) };
    }

    const emails = await prisma.email.findMany({
      where,
      orderBy: { dateReceived: "desc" },
      take: limit,
      select: {
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

    const metadata: EmailMetadata[] = emails.map((email) => ({
      ...email,
      dateReceived: email.dateReceived.toISOString(),
      dateSent: email.dateSent ? email.dateSent.toISOString() : null,
      sizeBytes: email.sizeBytes.toString(),
    }));

    return NextResponse.json({
      emails: metadata,
      hasMore: emails.length === limit,
    });
  } catch (error) {
    console.error("Error fetching email metadata:", error);
    return NextResponse.json({ error: "Failed to fetch email metadata" }, { status: 500 });
  }
}
