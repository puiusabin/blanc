import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow unauthenticated access to auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow unauthenticated access to user bootstrap endpoint
  if (pathname === "/api/mail/user") {
    return NextResponse.next();
  }

  // Protect all other /api/mail routes with authentication
  if (pathname.startsWith("/api/mail")) {
    const userId = await validateSession();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (pathname.startsWith("/api/debug")) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
