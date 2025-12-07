/**
 * Normalizes email priority values to standard levels
 * @param priority - Priority string from email header
 * @returns Normalized priority level or undefined
 */
export function normalizePriority(
  priority: string | null | undefined
): "high" | "normal" | "low" | undefined {
  if (!priority) return undefined;

  const normalized = priority.toLowerCase();
  if (normalized.includes("high") || normalized.includes("urgent") || normalized === "1") {
    return "high";
  }
  if (normalized.includes("low") || normalized === "5") {
    return "low";
  }
  return "normal";
}

/**
 * Decodes HTML entities using the browser's native HTML parser
 * Handles ALL HTML entities correctly (numeric, hex, and named)
 * @param html - HTML string with potential entities
 * @returns Decoded HTML string
 */
export function decodeHtmlEntities(html: string): string {
  if (typeof document === "undefined") {
    // Server-side fallback: use manual decoding for numeric entities only
    // Named entities will pass through unchanged (safer than corrupting them)
    let decoded = html;

    // Decode hex numeric entities (&#x2F; → /)
    decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // Decode decimal numeric entities (&#47; → /)
    decoded = decoded.replace(/&#([0-9]+);/g, (_match, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });

    // Don't attempt named entity decoding server-side
    // Let the browser handle it during rendering
    return decoded;
  }

  // Client-side: use browser's native HTML entity decoder
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

/**
 * Extracts readable text from HTML content for preview generation
 * Removes scripts, styles, comments, and HTML tags
 * Includes full HTML entity decoding
 * @param html - Raw HTML string
 * @returns First 150 characters of extracted text
 */
export function extractTextFromHtml(html: string): string {
  let text = html;

  // Remove script tags and content
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

  // Remove style tags and content
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

  // Remove HTML comments (including MSO conditionals)
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Normalize whitespace and limit to 150 characters
  return text.replace(/\s+/g, " ").trim().substring(0, 150);
}

/**
 * Basic HTML text extraction without entity decoding
 * Used by transform.ts for R2 datagrams (already decoded)
 * @param html - Raw HTML string
 * @returns Extracted text with normalized whitespace
 */
export function extractTextFromHtmlBasic(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
