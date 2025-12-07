import { NextResponse } from "next/server";

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public internalMessage?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof APIError) {
    if (error.internalMessage) {
      console.error("Internal details:", error.internalMessage);
    }

    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: unknown };

    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    if (prismaError.code === "P2002") {
      return NextResponse.json({ error: "Resource already exists" }, { status: 409 });
    }
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
