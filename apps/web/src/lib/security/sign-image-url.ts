const SECRET_KEY = process.env.IMAGE_PROXY_SECRET || "change-me-in-production";

/**
 * Generates HMAC signature using Web Crypto API
 * Compatible with both Node.js and Edge runtime
 */
export async function signImageUrl(url: string): Promise<string> {
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

  console.log("[SIGN]", {
    url: url,
    urlLength: url.length,
    signature: hexSignature,
    secretKeyLength: SECRET_KEY.length,
    secretKeyPrefix: SECRET_KEY.substring(0, 8),
  });

  return hexSignature;
}

/**
 * Creates a proxied image URL with HMAC signature
 * NOTE: This function is no longer used directly from client-side code.
 * URL signing now happens server-side via /api/sign-urls to keep the secret secure.
 * This export is kept for backward compatibility and potential server-side use.
 */
export async function getProxiedImageUrl(url: string): Promise<string> {
  const signature = await signImageUrl(url);
  return `/api/image-proxy?url=${encodeURIComponent(url)}&s=${signature}`;
}
