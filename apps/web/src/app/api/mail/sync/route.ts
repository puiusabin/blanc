import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blanc/database";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = searchParams.get("since");
  const sinceDate = since ? new Date(parseInt(since)) : new Date(0);

  try {
    // Fetch new emails since last sync
    const newEmails = await prisma.email.findMany({
      where: {
        userId,
        dateReceived: {
          gt: sinceDate,
        },
      },
      orderBy: {
        dateReceived: "asc",
      },
    });

    // Get affected thread IDs
    const affectedThreadIds = [
      ...new Set(newEmails.map((e) => e.threadId).filter(Boolean)),
    ] as string[];

    // Fetch updated thread metadata for affected threads
    const updatedThreads = await prisma.thread.findMany({
      where: {
        userId,
        id: {
          in: affectedThreadIds,
        },
      },
    });

    // Find new threads created since last sync
    const newThreads = await prisma.thread.findMany({
      where: {
        userId,
        createdAt: {
          gt: sinceDate,
        },
      },
    });

    // Calculate new cursor (latest email timestamp)
    const latestEmail = newEmails[newEmails.length - 1];
    const cursor = latestEmail ? latestEmail.dateReceived.getTime() : Date.now();

    return NextResponse.json({
      newEmails,
      newThreads,
      updatedThreads,
      cursor,
    });
  } catch (error) {
    console.error("Error syncing:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
