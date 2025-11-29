"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface SafeEmailRendererProps {
  html: string;
  className?: string;
  onLinkClick?: (url: string) => void;
}

export function SafeEmailRenderer({ html, className, onLinkClick }: SafeEmailRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(150);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get parent origin for CSP (srcdoc iframes have null origin, need explicit parent origin)
  const parentOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  // Generate iframe HTML with CSP and styles
  const processedHtml = useCallback(() => {
    // HTML is already transformed server-side with HMAC-signed image URLs
    // Just wrap it in the iframe structure with CSP
    return `
<!DOCTYPE html>
<html>
  <head>
    <base target="_blank">
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${parentOrigin} blob: data:; style-src 'unsafe-inline' https:; font-src 'self' https: data:; script-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none';">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <style>
      html, body {
        overflow: hidden;
        margin: 0;
        padding: 0;
      }

      body {
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #1a1a1a;
        word-wrap: break-word;
        overflow-wrap: break-word;
        -webkit-font-smoothing: antialiased;
      }

      table {
        max-width: 100%;
      }

      a {
        color: #0066cc;
      }

      * {
        box-sizing: border-box;
      }

      blockquote {
        margin: 0;
        padding-left: 12px;
        border-left: 3px solid #ddd;
        color: #666;
      }

      pre, code {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 13px;
      }

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
      ${html}
    </div>
  </body>
</html>`;
  }, [html, parentOrigin]);

  // Setup ResizeObserver (Notion Mail approach)
  const setupResizeObserver = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc?.documentElement) return;

      // Disconnect any existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Create ResizeObserver in PARENT window context
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Use borderBoxSize if available (more accurate)
          let newHeight: number;

          if (entry.borderBoxSize && entry.borderBoxSize[0]) {
            newHeight = entry.borderBoxSize[0].blockSize;
          } else {
            // Fallback to scrollHeight
            newHeight = iframeDoc.documentElement.scrollHeight;
          }

          setHeight(Math.max(newHeight, 100));
        }
      });

      // Observe iframe's documentElement for most accurate sizing
      resizeObserverRef.current.observe(iframeDoc.documentElement);

      // Also observe body as fallback
      if (iframeDoc.body) {
        resizeObserverRef.current.observe(iframeDoc.body);
      }
    } catch (error) {
      console.warn("Could not set up ResizeObserver:", error);
      // Fallback
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        setHeight(iframeDoc.documentElement.scrollHeight || 500);
      }
    }
  }, []);

  // Handle iframe load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setupResizeObserver();

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

    return () => {
      iframe.removeEventListener("load", handleLoad);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [setupResizeObserver, onLinkClick]);

  // Re-setup observer when HTML changes
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(setupResizeObserver, 50);
      return () => clearTimeout(timer);
    }
  }, [html, isLoaded, setupResizeObserver]);

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
            minHeight: "150px",
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
