import crypto from "crypto";

const SECRET_KEY = process.env.IMAGE_PROXY_SECRET || "change-me-in-production";

/**
 * Generates HMAC signature for image proxy URL
 * Server-side only (uses Node.js crypto)
 */
export function signImageUrl(url: string): string {
  return crypto.createHmac("sha256", SECRET_KEY).update(url).digest("hex");
}

/**
 * Creates a proxied image URL with signature
 */
export function getProxiedImageUrl(url: string): string {
  const signature = signImageUrl(url);
  return `/api/image-proxy?url=${encodeURIComponent(url)}&s=${signature}`;
}
