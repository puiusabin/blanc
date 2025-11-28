import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PROTOCOLS = ["https:", "http:"];
const BLOCKED_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const CACHE_DURATION = 60 * 60 * 24 * 7; // 7 days

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    // Validate and parse URL
    const imageUrl = new URL(decodeURIComponent(url));

    // Security checks
    if (!ALLOWED_PROTOCOLS.includes(imageUrl.protocol)) {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    if (BLOCKED_DOMAINS.some((domain) => imageUrl.hostname.includes(domain))) {
      return NextResponse.json({ error: "Blocked domain" }, { status: 403 });
    }

    // Prevent SSRF - block private IP ranges
    if (isPrivateIP(imageUrl.hostname)) {
      return NextResponse.json({ error: "Private IPs not allowed" }, { status: 403 });
    }

    // Fetch the image
    const response = await fetch(imageUrl.toString(), {
      headers: {
        "User-Agent": "EmailImageProxy/1.0",
        Accept: "image/*",
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
    }

    // Validate content type
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 400 });
    }

    // Check size
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    // Stream the image back
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_DURATION}, immutable`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 });
  }
}

// Helper to detect private IP addresses (SSRF protection)
function isPrivateIP(hostname: string): boolean {
  const privatePatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^fc00:/,
    /^fe80:/,
  ];
  return privatePatterns.some((pattern) => pattern.test(hostname));
}
