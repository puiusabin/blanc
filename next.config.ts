import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
    turbo: {
      // Turbopack configuration
    },
  },

  // Image optimization for Cloudflare
  images: {
    // Only use custom loader in production for Cloudflare
    ...(process.env.NODE_ENV === "production" && {
      loader: "custom",
      loaderFile: "./image-loader.ts",
    }),
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 300,
    // Allow external images (GitHub avatars, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "blanc.is",
      },
    ],
  },

  // No external packages needed - using native Web Crypto API
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
