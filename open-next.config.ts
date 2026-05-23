import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config is the right starting point for a Next.js App Router app.
// No incremental cache or queue bindings — Present has no SSR caching needs.
export default defineCloudflareConfig();
