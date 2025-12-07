import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { APIError, handleAPIError } from "@/lib/api/error";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userId?: unknown };
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      throw new APIError(400, "userId is required");
    }

    await createSession(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
