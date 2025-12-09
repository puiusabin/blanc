import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blanc/database";

export async function GET(request: NextRequest, { params }: { params: { threadId: string } }) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = params;

  try {
    // Verify thread belongs to user
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadId,
        userId,
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Fetch all emails in thread
    const messages = await prisma.email.findMany({
      where: {
        threadId,
        userId,
      },
      orderBy: {
        dateReceived: "asc",
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    return NextResponse.json({ error: "Failed to fetch thread messages" }, { status: 500 });
  }
}
