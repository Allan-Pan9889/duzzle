import { PrismaClient } from "@prisma/client";
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { clearNextImageCache } from "./clear-image-cache";
import {
  DEMO_FASHION_IMAGE_CATALOG,
  MYNT_REFERER,
} from "./demo-fashion-images";

const prisma = new PrismaClient();
const RATE_LIMIT_MS = 400;
const IMAGE_DIR = join(process.cwd(), "public", "demo", "products");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function loadEnv(): void {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadImage(url: string, destPath: string): boolean {
  try {
    execFileSync(
      "curl",
      [
        "-fsSL",
        "--max-time",
        "30",
        "--retry",
        "3",
        "--retry-delay",
        "1",
        "-H",
        `User-Agent: ${USER_AGENT}`,
        "-H",
        `Referer: ${MYNT_REFERER}`,
        "-o",
        destPath,
        url,
      ],
      { stdio: "pipe" },
    );
    const size = statSync(destPath).size;
    return size > 1024;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  mkdirSync(IMAGE_DIR, { recursive: true });

  const products = await prisma.product.findMany({
    where: { isDemo: true },
    select: { id: true, name: true, slug: true, images: true },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    console.log("No demo products found. Run: npm run seed:urbanic");
    return;
  }

  console.log(`Updating images for ${products.length} demo products...\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const imageUrl = DEMO_FASHION_IMAGE_CATALOG[product.slug];
    if (!imageUrl) {
      console.log(`  ⚠ No catalog image for slug: ${product.slug}`);
      skipped++;
      continue;
    }

    const filename = `${product.slug}-0.jpg`;
    const destPath = join(IMAGE_DIR, filename);
    const publicPath = `/demo/products/${filename}`;

    const ok = downloadImage(imageUrl, destPath);
    if (!ok) {
      console.log(`  ✗ Failed to download: ${product.name}`);
      skipped++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { images: [publicPath] },
    });

    console.log(`  ✓ ${product.name}`);
    updated++;
    await sleep(RATE_LIMIT_MS);
  }

  clearNextImageCache();
  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
  console.log("Cleared Next.js image cache — hard-refresh the browser (Cmd+Shift+R).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
