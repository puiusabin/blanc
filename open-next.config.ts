import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Uncomment to enable R2 cache,
  // It should be imported as:
  // `import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";`
  // See https://opennext.js.org/cloudflare/caching for more details
  // incrementalCache: r2IncrementalCache,

  // Build optimization settings
  buildCommand: "npm run build",

  // Reduce build warnings
  experimental: {
    disableWarnings: false, // Keep warnings visible but optimized
  },
});
