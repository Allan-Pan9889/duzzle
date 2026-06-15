import { PrismaClient } from "@prisma/client";
import { execFileSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "fs";
import { dirname, join } from "path";
import { clearNextImageCache } from "./clear-image-cache";
import {
  fetchFirstCryKidsProducts,
  FIRSTCRY_IMAGE_REFERER,
  type FirstCryScrapedProduct,
} from "./firstcry-api";
import { DEMO_TARGET_PER_CATEGORY } from "./scrape-config";

const prisma = new PrismaClient();

const PRODUCTS_TARGET = DEMO_TARGET_PER_CATEGORY;
const RATE_LIMIT_MS = 350;
const IMAGE_DIR = join(process.cwd(), "public", "demo", "products");
const HOME_IMAGE_DIR = join(process.cwd(), "public", "demo", "home");

const SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y"] as const;

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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function clearKidsDemoProducts(): Promise<void> {
  const demoProducts = await prisma.product.findMany({
    where: { isDemo: true, category: "KIDS" },
    select: {
      id: true,
      variants: { select: { id: true } },
    },
  });

  const variantIds = demoProducts.flatMap((p) => p.variants.map((v) => v.id));
  const productIds = demoProducts.map((p) => p.id);

  if (variantIds.length > 0) {
    await prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
    await prisma.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
  }

  if (productIds.length > 0) {
    await prisma.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  }
}

async function cleanupOrphanDemoImagesFromDb(): Promise<number> {
  if (!existsSync(IMAGE_DIR)) return 0;

  const products = await prisma.product.findMany({
    where: { isDemo: true },
    select: { images: true },
  });
  const referenced = new Set(
    products.flatMap((p) => p.images.map((img) => img.split("/").pop()).filter(Boolean)),
  );
  referenced.add(".gitkeep");

  let removed = 0;
  for (const file of readdirSync(IMAGE_DIR)) {
    if (!referenced.has(file)) {
      unlinkSync(join(IMAGE_DIR, file));
      removed++;
    }
  }
  return removed;
}

function downloadImage(url: string, destPath: string): boolean {
  try {
    mkdirSync(dirname(destPath), { recursive: true });
    execFileSync(
      "curl",
      [
        "-fsSL",
        "--max-time",
        "45",
        "--retry",
        "3",
        "--retry-delay",
        "1",
        "-H",
        `User-Agent: ${USER_AGENT}`,
        "-H",
        `Referer: ${FIRSTCRY_IMAGE_REFERER}`,
        "-o",
        destPath,
        url,
      ],
      { stdio: "pipe" },
    );
    return statSync(destPath).size > 2048;
  } catch {
    return false;
  }
}

async function resolveProductImages(
  slug: string,
  imageUrls: string[],
): Promise<string[]> {
  const localPaths: string[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    await sleep(RATE_LIMIT_MS);
    const filename = `${slug}-${i}.jpg`;
    const destPath = join(IMAGE_DIR, filename);
    const publicPath = `/demo/products/${filename}`;

    if (downloadImage(imageUrls[i], destPath)) {
      localPaths.push(publicPath);
    }
  }

  return localPaths;
}

function buildVariants(slug: string) {
  return SIZES.map((size) => ({
    size,
    sku: `${slug}-${size.toLowerCase()}`.replace(/[^a-z0-9-]/g, ""),
    stock: 10,
  }));
}

async function seedProduct(
  product: FirstCryScrapedProduct,
  usedSlugs: Set<string>,
): Promise<string | null> {
  let slug = slugify(product.name);
  if (!slug) slug = `firstcry-kids-${product.firstCryId}`;

  let suffix = 1;
  let uniqueSlug = slug;
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${suffix++}`;
  }
  usedSlugs.add(uniqueSlug);

  const images = await resolveProductImages(uniqueSlug, product.imageUrls);
  if (images.length === 0) {
    throw new Error(`Failed to download image for ${product.name}`);
  }

  await prisma.product.create({
    data: {
      name: product.name,
      slug: uniqueSlug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      category: "KIDS",
      subCategory: product.subCategory,
      images,
      isDemo: true,
      isActive: true,
      variants: {
        create: buildVariants(uniqueSlug),
      },
    },
  });

  console.log(`  ✓ ${product.name}`);
  return images[0] ?? null;
}

function saveCategoryTileImage(firstImagePath: string | null): void {
  if (!firstImagePath) return;
  mkdirSync(HOME_IMAGE_DIR, { recursive: true });
  const source = join(process.cwd(), "public", firstImagePath);
  const dest = join(HOME_IMAGE_DIR, "category-kids.jpg");
  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log("  Saved homepage category tile: public/demo/home/category-kids.jpg");
  }
}

async function main(): Promise<void> {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env and retry.");
    process.exit(1);
  }

  mkdirSync(IMAGE_DIR, { recursive: true });

  try {
    await prisma.$connect();
  } catch (err) {
    console.error("Could not connect to PostgreSQL.", err);
    process.exit(1);
  }

  console.log("Clearing existing KIDS demo products...");
  await clearKidsDemoProducts();

  console.log("\n=== KIDS (FirstCry) ===");
  console.log("Fetching kids clothing from FirstCry...");
  await sleep(RATE_LIMIT_MS);

  const products = await fetchFirstCryKidsProducts(PRODUCTS_TARGET);
  console.log(`  Found ${products.length} clothing items`);

  if (products.length < PRODUCTS_TARGET) {
    console.warn(
      `  Warning: only ${products.length}/${PRODUCTS_TARGET} kids products available after filtering.`,
    );
  }

  const usedSlugs = new Set<string>();
  let firstImage: string | null = null;

  for (const product of products) {
    const image = await seedProduct(product, usedSlugs);
    if (!firstImage && image) firstImage = image;
    await sleep(RATE_LIMIT_MS);
  }

  saveCategoryTileImage(firstImage);

  const removed = await cleanupOrphanDemoImagesFromDb();
  if (removed > 0) {
    console.log(`Removed ${removed} orphan demo image(s).`);
  }

  clearNextImageCache();

  const total = await prisma.product.count({ where: { isDemo: true, category: "KIDS" } });
  console.log(`\nDone. Seeded ${total} FirstCry KIDS demo products.`);
  console.log("Hard-refresh the browser (Cmd+Shift+R) to see new images.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
