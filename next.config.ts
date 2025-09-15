import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ...
  images: {
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
