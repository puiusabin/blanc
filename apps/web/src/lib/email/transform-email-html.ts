import { getProxiedImageUrl } from "@/lib/security/sign-image-url";

/**
 * Decodes HTML entities in a string
 * Handles numeric entities (&#x2F; &#x3A;) and named entities (&amp; &quot;)
 * @param html - HTML string with potential entities
 * @returns Decoded HTML string
 */
function decodeHtmlEntities(html: string): string {
  // Decode hex numeric entities (&#x2F; → /)
  let decoded = html.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Decode decimal numeric entities (&#47; → /)
  decoded = decoded.replace(/&#([0-9]+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // Decode common named entities
  const namedEntities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&nbsp;": " ",
  };

  decoded = decoded.replace(/&[a-z]+;/gi, (match) => {
    return namedEntities[match.toLowerCase()] || match;
  });

  return decoded;
}

/**
 * Helper function to transform a single image URL
 * @param url - The original image URL
 * @returns Proxied URL or original if no transformation needed
 */
function transformImageUrl(url: string): string {
  // Keep data URIs unchanged
  if (url.startsWith("data:")) return url;

  // Keep already-proxied URLs unchanged
  if (url.startsWith("/api/image-proxy")) return url;

  // Proxy external HTTP/HTTPS images
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return getProxiedImageUrl(url);
  }

  return url;
}

/**
 * Transforms email HTML by proxying external images through our API route
 * with HMAC-signed URLs for security.
 *
 * This MUST run server-side because it uses Node.js crypto for HMAC signing.
 *
 * Handles multiple image URL formats:
 * - Double quotes: <img src="...">
 * - Single quotes: <img src='...'>
 * - No quotes: <img src=...>
 * - Background images: style="background-image: url(...)"
 * - HTML entities in URLs: &#x2F; &#x3A; etc.
 *
 * @param html - The original email HTML
 * @returns Transformed HTML with proxied image URLs
 */
export function transformEmailHtml(html: string): string {
  // CRITICAL: Decode HTML entities BEFORE regex matching
  // PostalMime decodes quoted-printable but NOT HTML entities
  // URLs like "https:&#x2F;&#x2F;cdn.example.com" must become "https://cdn.example.com"
  const decodedHtml = decodeHtmlEntities(html);

  let transformedHtml = decodedHtml;

  // Transform images with double quotes
  transformedHtml = transformedHtml.replace(
    /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/gi,
    (match, before, src, after) => {
      const proxyUrl = transformImageUrl(src);
      if (proxyUrl === src) return match; // No transformation needed
      const errorIcon = "/images/broken-image.svg";
      return `<img ${before}src="${proxyUrl}" onerror="this.src='${errorIcon}'; this.onerror=null;"${after}>`;
    }
  );

  // Transform images with single quotes
  transformedHtml = transformedHtml.replace(
    /<img\s+([^>]*?)src='([^']+)'([^>]*?)>/gi,
    (match, before, src, after) => {
      const proxyUrl = transformImageUrl(src);
      if (proxyUrl === src) return match;
      const errorIcon = "/images/broken-image.svg";
      return `<img ${before}src='${proxyUrl}' onerror="this.src='${errorIcon}'; this.onerror=null;"${after}>`;
    }
  );

  // Transform images with no quotes (rare but valid HTML5)
  transformedHtml = transformedHtml.replace(
    /<img\s+([^>]*?)src=([^\s>"']+)([^>]*?)>/gi,
    (match, before, src, after) => {
      const proxyUrl = transformImageUrl(src);
      if (proxyUrl === src) return match;
      const errorIcon = "/images/broken-image.svg";
      return `<img ${before}src="${proxyUrl}" onerror="this.src='${errorIcon}'; this.onerror=null;"${after}>`;
    }
  );

  // Transform background images in inline styles
  transformedHtml = transformedHtml.replace(
    /style="([^"]*?)background-image:\s*url\((['"]?)([^'")]+)\2\)([^"]*?)"/gi,
    (match, beforeBg, quote, url, afterBg) => {
      const proxyUrl = transformImageUrl(url);
      if (proxyUrl === url) return match;
      return `style="${beforeBg}background-image: url(${quote}${proxyUrl}${quote})${afterBg}"`;
    }
  );

  return transformedHtml;
}
