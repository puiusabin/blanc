// No longer import getProxiedImageUrl - URL signing now happens server-side via /api/sign-urls

/**
 * Decodes HTML entities in a string
 * Handles numeric entities (&#x2F; &#x3A;) and named entities (&amp; &quot;)
 * @param html - HTML string with potential entities
 * @returns Decoded HTML string
 */
export function decodeHtmlEntities(html: string): string {
  // Decode hex numeric entities (&#x2F; → /)
  let decoded = html.replace(/&#x([0-9A-Fa-f]+);/g, (_match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Decode decimal numeric entities (&#47; → /)
  decoded = decoded.replace(/&#([0-9]+);/g, (_match, dec) => {
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
 * Transforms email HTML by proxying external images through our API route
 * with HMAC-signed URLs for security.
 *
 * This uses Web Crypto API for HMAC signing (compatible with both Node.js and Edge runtime).
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
export async function transformEmailHtml(html: string): Promise<string> {
  // CRITICAL: Decode HTML entities BEFORE regex matching
  // PostalMime decodes quoted-printable but NOT HTML entities
  // URLs like "https:&#x2F;&#x2F;cdn.example.com" must become "https://cdn.example.com"
  const decodedHtml = decodeHtmlEntities(html);

  // Collect all unique image URLs
  const urlsToTransform = new Set<string>();

  // Extract from double-quoted img src
  decodedHtml.replace(/<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/gi, (match, _before, src) => {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      urlsToTransform.add(src);
    }
    return match;
  });

  // Extract from single-quoted img src
  decodedHtml.replace(/<img\s+([^>]*?)src='([^']+)'([^>]*?)>/gi, (match, _before, src) => {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      urlsToTransform.add(src);
    }
    return match;
  });

  // Extract from unquoted img src
  decodedHtml.replace(/<img\s+([^>]*?)src=([^\s>"']+)([^>]*?)>/gi, (match, _before, src) => {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      urlsToTransform.add(src);
    }
    return match;
  });

  // Extract from background-image styles
  decodedHtml.replace(
    /style="([^"]*?)background-image:\s*url\((['"]?)([^'")]+)\2\)([^"]*?)"/gi,
    (match, _beforeBg, _quote, url) => {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        urlsToTransform.add(url);
      }
      return match;
    }
  );

  // Sign all URLs server-side via API (to keep IMAGE_PROXY_SECRET secure)
  const urlMap = new Map<string, string>();

  if (urlsToTransform.size > 0) {
    const response = await fetch("/api/sign-urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: Array.from(urlsToTransform) }),
    });

    if (!response.ok) {
      console.error("[transformEmailHtml] Failed to sign URLs:", response.statusText);
      // Fallback: return original HTML without transformation
      return html;
    }

    const { signatures } = (await response.json()) as {
      signatures: Array<{ url: string; proxiedUrl: string }>;
    };

    for (const { url, proxiedUrl } of signatures) {
      urlMap.set(url, proxiedUrl);
    }
  }

  let transformedHtml = decodedHtml;

  // Transform images with double quotes
  transformedHtml = transformedHtml.replace(
    /<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/gi,
    (match, before, src, after) => {
      const proxyUrl = urlMap.get(src);
      if (!proxyUrl) return match;
      const errorIcon = "/images/broken-image.svg";
      return `<img ${before}src="${proxyUrl}" onerror="this.src='${errorIcon}'; this.onerror=null;"${after}>`;
    }
  );

  // Transform images with single quotes
  transformedHtml = transformedHtml.replace(
    /<img\s+([^>]*?)src='([^']+)'([^>]*?)>/gi,
    (match, before, src, after) => {
      const proxyUrl = urlMap.get(src);
      if (!proxyUrl) return match;
      const errorIcon = "/images/broken-image.svg";
      return `<img ${before}src='${proxyUrl}' onerror="this.src='${errorIcon}'; this.onerror=null;"${after}>`;
    }
  );

  // Transform images with no quotes
  transformedHtml = transformedHtml.replace(
    /<img\s+([^>]*?)src=([^\s>"']+)([^>]*?)>/gi,
    (match, before, src, after) => {
      const proxyUrl = urlMap.get(src);
      if (!proxyUrl) return match;
      const errorIcon = "/images/broken-image.svg";
      return `<img ${before}src="${proxyUrl}" onerror="this.src='${errorIcon}'; this.onerror=null;"${after}>`;
    }
  );

  // Transform background images
  transformedHtml = transformedHtml.replace(
    /style="([^"]*?)background-image:\s*url\((['"]?)([^'")]+)\2\)([^"]*?)"/gi,
    (match, beforeBg, quote, url, afterBg) => {
      const proxyUrl = urlMap.get(url);
      if (!proxyUrl) return match;
      return `style="${beforeBg}background-image: url(${quote}${proxyUrl}${quote})${afterBg}"`;
    }
  );

  return transformedHtml;
}
