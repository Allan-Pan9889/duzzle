import { PrismaClient, Category } from "@prisma/client";
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, statSync, readdirSync, unlinkSync } from "fs";
import { dirname, join } from "path";
import { clearNextImageCache } from "./clear-image-cache";
import {
  fetchNykaaCategoryProducts,
  NYKAA_CATEGORY_IDS,
  NYKAA_IMAGE_REFERER,
  type NykaaScrapedProduct,
} from "./nykaa-fashion-api";

const prisma = new PrismaClient();

const PRODUCTS_PER_CATEGORY = 50;
const RATE_LIMIT_MS = 350;
const IMAGE_DIR = join(process.cwd(), "public", "demo", "products");

const SIZES = ["S", "M", "L", "XL"] as const;
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
] as const;

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

async function clearDemoProducts(): Promise<void> {
  const demoProducts = await prisma.product.findMany({
    where: { isDemo: true },
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
        `Referer: ${NYKAA_IMAGE_REFERER}`,
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
    const ext = imageUrls[i].includes(".png") ? "png" : "jpg";
    const filename = `${slug}-${i}.${ext}`;
    const destPath = join(IMAGE_DIR, filename);
    const publicPath = `/demo/products/${filename}`;

    if (downloadImage(imageUrls[i], destPath)) {
      localPaths.push(publicPath);
    }
  }

  return localPaths;
}

function buildVariants(slug: string) {
  return SIZES.flatMap((size) =>
    COLORS.map((color) => ({
      size,
      color: color.name,
      colorHex: color.hex,
      sku: `${slug}-${size.toLowerCase()}-${color.name.toLowerCase()}`.replace(
        /[^a-z0-9-]/g,
        "",
      ),
      stock: 10,
    })),
  );
}

async function seedProduct(
  category: Category,
  product: NykaaScrapedProduct,
  usedSlugs: Set<string>,
): Promise<void> {
  let slug = slugify(product.name);
  if (!slug) slug = `nykaa-${category.toLowerCase()}-${product.nykaaId}`;

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
      category,
      images,
      isDemo: true,
      isActive: true,
      variants: {
        create: buildVariants(uniqueSlug),
      },
    },
  });

  console.log(`  ✓ ${product.name}`);
}

async function scrapeCategory(category: Category): Promise<NykaaScrapedProduct[]> {
  const categoryId = NYKAA_CATEGORY_IDS[category];
  console.log(`Fetching Nykaa Fashion ${category} (categoryId=${categoryId})...`);
  await sleep(RATE_LIMIT_MS);

  const products = await fetchNykaaCategoryProducts(
    categoryId,
    PRODUCTS_PER_CATEGORY,
  );

  console.log(`  Found ${products.length} clothing items`);
  return products;
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

  console.log("Clearing existing demo products...");
  await clearDemoProducts();

  const usedSlugs = new Set<string>();

  for (const category of ["WOMEN", "MEN"] as const) {
    console.log(`\n=== ${category} ===`);
    const products = await scrapeCategory(category);

    if (products.length < PRODUCTS_PER_CATEGORY) {
      console.warn(
        `  Warning: only ${products.length}/${PRODUCTS_PER_CATEGORY} clothing products available after filtering.`,
      );
    }

    for (const product of products) {
      await seedProduct(category, product, usedSlugs);
      await sleep(RATE_LIMIT_MS);
    }
  }

  clearNextImageCache();

  const removed = await cleanupOrphanDemoImagesFromDb();
  if (removed > 0) {
    console.log(`Removed ${removed} orphan demo image(s).`);
  }

  const total = await prisma.product.count({ where: { isDemo: true } });
  console.log(`\nDone. Seeded ${total} Nykaa Fashion demo products.`);
  console.log("Hard-refresh the browser (Cmd+Shift+R) to see new images.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
