"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { proxyImageUrls } from "@/lib/email/proxy-images";
import { cn } from "@/lib/utils";

export interface SafeEmailRendererProps {
  html: string;
  plainText: string;
  className?: string;
  onLinkClick?: (url: string) => void;
  contentKey?: string;
}

export function SafeEmailRenderer({
  html,
  plainText,
  className,
  onLinkClick,
  contentKey,
}: SafeEmailRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(150);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get the proxy base URL
  const proxyBaseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/image-proxy`
      : "/api/image-proxy";

  // Process the email HTML
  const processedHtml = useCallback(() => {
    // 1. Proxy all image URLs
    const proxiedHtml = proxyImageUrls(html, proxyBaseUrl);

    // 2. Wrap with security headers and base styles
    return `
<!DOCTYPE html>
<html>
  <head>
    <base target="_blank">
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src blob: data: ${proxyBaseUrl}; style-src 'unsafe-inline'; script-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'self';">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <style>
      /* Base reset */
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #1a1a1a;
        word-wrap: break-word;
        overflow-wrap: break-word;
        -webkit-font-smoothing: antialiased;
      }

      /* Responsive images */
      img {
        max-width: 100%;
        height: auto;
      }

      /* Responsive tables */
      table {
        max-width: 100%;
      }

      /* Link styles */
      a {
        color: #0066cc;
      }

      /* Prevent horizontal scroll */
      * {
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Blockquote styles (for replies/forwards) */
      blockquote {
        margin: 0;
        padding-left: 12px;
        border-left: 3px solid #ddd;
        color: #666;
      }

      /* Preformatted text */
      pre, code {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 13px;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #1a1a1a;
          color: #e5e5e5;
        }
        a {
          color: #6bb3ff;
        }
        blockquote {
          border-left-color: #444;
          color: #aaa;
        }
      }
    </style>
  </head>
  <body>
    <div id="email-content">
      ${proxiedHtml}
    </div>
  </body>
</html>`;
  }, [html, proxyBaseUrl]);

  // Calculate iframe height based on content
  const calculateHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      if (doc?.body) {
        const newHeight = Math.max(
          doc.body.scrollHeight,
          doc.body.offsetHeight,
          doc.documentElement?.scrollHeight || 0,
          doc.documentElement?.offsetHeight || 0
        );
        setHeight(newHeight);
      }
    } catch (error) {
      // Cross-origin error - should not happen with srcdoc
      console.warn("Could not calculate iframe height:", error);
    }
  }, []);

  // Reset height when content changes
  useEffect(() => {
    if (contentKey) {
      setHeight(150);
    }
  }, [contentKey]);

  // Handle iframe load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoaded(true);
      calculateHeight();

      // Set up link click handling
      if (onLinkClick) {
        try {
          const doc = iframe.contentDocument;
          if (doc) {
            doc.addEventListener("click", (e) => {
              const target = e.target as HTMLElement;
              const link = target.closest("a");
              if (link?.href) {
                e.preventDefault();
                onLinkClick(link.href);
              }
            });
          }
        } catch (error) {
          console.warn("Could not attach link handler:", error);
        }
      }
    };

    iframe.addEventListener("load", handleLoad);

    // Recalculate height on window resize
    const handleResize = () => calculateHeight();
    window.addEventListener("resize", handleResize);

    // Watch for images loading (they can change height)
    const observer = new MutationObserver(calculateHeight);
    if (iframe.contentDocument) {
      observer.observe(iframe.contentDocument.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [calculateHeight, onLinkClick]);

  // Recalculate height when HTML changes
  useEffect(() => {
    if (isLoaded) {
      // Small delay to let content render
      const timer = setTimeout(calculateHeight, 100);
      return () => clearTimeout(timer);
    }
  }, [html, isLoaded, calculateHeight]);

  return (
    <div className={className} style={{ position: "relative" }}>
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <span className="text-sm text-muted-foreground">Loading email...</span>
        </div>
      )}

      <iframe
        ref={iframeRef}
        srcDoc={processedHtml()}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className={cn("w-full border-none rounded-md bg-background", className)}
        style={{
          height: `${height}px`,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
        title="Email content"
      />
    </div>
  );
}
