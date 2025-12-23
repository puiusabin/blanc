import { NextRequest, NextResponse } from "next/server";
import { db, threads, emails, eq, and, asc } from "@blanc/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;

  try {
    // Verify thread belongs to user
    const thread = await db.query.threads.findFirst({
      where: and(eq(threads.id, threadId), eq(threads.userId, userId)),
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Fetch all emails in thread
    const messages = await db.query.emails.findMany({
      where: and(eq(emails.threadId, threadId), eq(emails.userId, userId)),
      orderBy: [asc(emails.dateReceived)],
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    return NextResponse.json({ error: "Failed to fetch thread messages" }, { status: 500 });
  }
}
