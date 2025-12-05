import { NextRequest, NextResponse } from "next/server";

// Force Edge runtime (required for OpenNext/Cloudflare Workers)
export const runtime = "edge";

const SECRET_KEY = process.env.IMAGE_PROXY_SECRET || "change-me-in-production";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const signature = searchParams.get("s");

  // 1. Validate required parameters
  if (!url || !signature) {
    return new NextResponse("Missing url or signature", { status: 400 });
  }

  // 2. Validate HMAC signature using Web Crypto API (Edge runtime compatible)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(url));
  const hexSignature = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  console.log("[VALIDATE]", {
    url: url,
    urlLength: url.length,
    receivedSignature: signature,
    computedSignature: hexSignature,
    match: signature === hexSignature,
    secretKeyLength: SECRET_KEY.length,
    secretKeyPrefix: SECRET_KEY.substring(0, 8),
  });

  if (signature !== hexSignature) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  try {
    // Extract origin domain for Referer header
    const imageUrl = new URL(url);

    // 3. Fetch image from Cloudflare Edge with browser-like headers
    const imageResponse = await fetch(url, {
      headers: {
        // Browser-like User-Agent (bypasses bot detection)
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",

        // Accept all image types
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",

        // Set Referer to image's origin (satisfies hotlink protection)
        Referer: `${imageUrl.protocol}//${imageUrl.hostname}/`,

        // Accept encoding for compressed responses
        "Accept-Encoding": "gzip, deflate, br",

        // Accept language
        "Accept-Language": "en-US,en;q=0.9",

        // Cache control
        "Cache-Control": "no-cache",
        Pragma: "no-cache",

        // Chromium security headers
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      cf: {
        cacheTtl: 60 * 60 * 24 * 7, // 7 days edge cache
        cacheEverything: true,
      },
    });

    if (!imageResponse.ok) {
      console.error("[Image Proxy] Fetch failed:", {
        url: url.substring(0, 100),
        status: imageResponse.status,
        statusText: imageResponse.statusText,
      });

      return new NextResponse("Failed to fetch image", {
        status: imageResponse.status,
      });
    }

    // 4. Validate content type
    const contentType = imageResponse.headers.get("content-type") || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 400 });
    }

    // 5. Check size limit (if available)
    const contentLength = imageResponse.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      return new NextResponse("Image too large", { status: 413 });
    }

    // 6. Stream response with aggressive caching
    return new NextResponse(imageResponse.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[Image Proxy] Fetch error:", {
      url: url.substring(0, 100),
      error: error instanceof Error ? error.message : String(error),
    });

    return new NextResponse("Image fetch failed", { status: 502 });
  }
}
