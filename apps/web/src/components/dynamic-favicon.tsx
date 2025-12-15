"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function DynamicFavicon() {
  const { theme } = useTheme();

  useEffect(() => {
    if (!theme) return;

    const timeoutId = setTimeout(() => {
      const tempDiv = document.createElement("div");
      tempDiv.style.color = "var(--primary)";
      tempDiv.style.display = "none";
      document.body.appendChild(tempDiv);

      const computedColor = getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);

      const svg = `
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="0.625" fill="${computedColor}"/>
        </svg>
      `;

      const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;

      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      link.href = dataUri;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [theme]);

  return null;
}
