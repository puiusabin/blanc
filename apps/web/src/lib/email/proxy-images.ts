export function proxyImageUrls(html: string, proxyBaseUrl: string): string {
  // Match src attributes in img tags
  const imgSrcRegex = /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;

  // Match url() in inline styles
  const cssUrlRegex = /url\(["']?([^"')]+)["']?\)/gi;

  // Match srcset attributes
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;

  let result = html;

  // Proxy img src attributes
  result = result.replace(imgSrcRegex, (match, before, url, after) => {
    const proxiedUrl = proxyUrl(url, proxyBaseUrl);
    return `<img${before}src="${proxiedUrl}"${after}>`;
  });

  // Proxy CSS url() references
  result = result.replace(cssUrlRegex, (match, url) => {
    // Skip data: URLs and blob: URLs
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      return match;
    }
    const proxiedUrl = proxyUrl(url, proxyBaseUrl);
    return `url("${proxiedUrl}")`;
  });

  // Proxy srcset attributes
  result = result.replace(srcsetRegex, (match, srcset) => {
    const proxiedSrcset = srcset
      .split(",")
      .map((entry: string) => {
        const [url, descriptor] = entry.trim().split(/\s+/);
        const proxiedUrl = proxyUrl(url, proxyBaseUrl);
        return descriptor ? `${proxiedUrl} ${descriptor}` : proxiedUrl;
      })
      .join(", ");
    return `srcset="${proxiedSrcset}"`;
  });

  return result;
}

function proxyUrl(url: string, proxyBaseUrl: string): string {
  // Skip data: URLs, blob: URLs, and already-proxied URLs
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith(proxyBaseUrl)) {
    return url;
  }

  // Handle protocol-relative URLs
  if (url.startsWith("//")) {
    url = "https:" + url;
  }

  // Skip relative URLs (shouldn't exist in emails, but just in case)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return url;
  }

  return `${proxyBaseUrl}?url=${encodeURIComponent(url)}`;
}
