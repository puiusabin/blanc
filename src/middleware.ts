import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  try {
    // Check for session cookie existence (optimistic check)
    // Note: This only checks cookie existence, not validity
    // Server-side validation is still required for protected actions
    const sessionCookie = getSessionCookie(request);

    // If no session cookie exists, redirect to home/sign-in
    if (!sessionCookie) {
      const signInUrl = new URL("/", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Allow the request to continue
    // Session validation happens server-side in protected routes
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to sign-in for security
    const signInUrl = new URL("/", request.url);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  // Apply middleware to protected routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - auth (auth page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (home page where sign-in happens)
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|$).*)",
  ],
};
