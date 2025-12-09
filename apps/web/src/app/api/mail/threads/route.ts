import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@blanc/database";
import type { EmailFolder } from "@blanc/database/generated/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folder = (searchParams.get("folder") || "INBOX") as EmailFolder;
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    // Fetch threads with their messages
    const threads = await prisma.thread.findMany({
      where: {
        userId,
        folder,
      },
      include: {
        emails: {
          orderBy: {
            dateReceived: "asc",
          },
        },
      },
      orderBy: {
        lastMessageDate: "desc",
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
  }
}
