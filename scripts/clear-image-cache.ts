import { rmSync } from "fs";
import { join } from "path";

const CACHE_DIRS = [
  join(process.cwd(), ".next", "dev", "cache", "images"),
  join(process.cwd(), ".next", "cache", "images"),
];

export function clearNextImageCache(): void {
  for (const dir of CACHE_DIRS) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore missing cache dirs
    }
  }
}

// Run directly: npx tsx scripts/clear-image-cache.ts
if (process.argv[1]?.endsWith("clear-image-cache.ts")) {
  clearNextImageCache();
  console.log("Cleared Next.js image optimizer cache.");
}
