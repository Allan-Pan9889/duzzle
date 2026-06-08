import { PrismaClient, Category } from "@prisma/client";
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { dirname, join } from "path";
import {
  imageUrlForProductName,
  imageUrlForSlug,
  MYNT_REFERER,
} from "./demo-fashion-images";

const prisma = new PrismaClient();

const RATE_LIMIT_MS = 500;
const MAX_PRODUCTS_PER_CATEGORY = 20;
const IMAGE_DIR = join(process.cwd(), "public", "demo", "products");

const URBANIC_URLS: Record<Category, string> = {
  WOMEN: "https://in.urbanic.com/women",
  MEN: "https://in.urbanic.com/men",
};

const SIZES = ["S", "M", "L", "XL"] as const;
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
] as const;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type ScrapedProduct = {
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  imageUrls: string[];
};

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

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value > 10000 ? Math.round(value / 100) : Math.round(value);
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.]/g, "");
    const num = parseFloat(cleaned);
    if (Number.isFinite(num) && num > 0) return Math.round(num);
  }
  return null;
}

function collectImageUrls(value: unknown, out: Set<string>): void {
  if (!value) return;
  if (typeof value === "string") {
    if (/^https?:\/\/.+\.(jpg|jpeg|png|webp)/i.test(value)) {
      out.add(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImageUrls(item, out);
    return;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["url", "src", "image", "imageUrl", "cover", "mainImage"]) {
      if (key in obj) collectImageUrls(obj[key], out);
    }
    for (const val of Object.values(obj)) {
      if (typeof val === "string" || Array.isArray(val) || typeof val === "object") {
        collectImageUrls(val, out);
      }
    }
  }
}

function looksLikeProduct(obj: Record<string, unknown>): boolean {
  const name =
    (obj.name as string) ||
    (obj.title as string) ||
    (obj.productName as string) ||
    (obj.goodsName as string);
  if (!name || typeof name !== "string" || name.length < 3) return false;

  const price =
    parsePrice(obj.price) ??
    parsePrice(obj.salePrice) ??
    parsePrice(obj.currentPrice) ??
    parsePrice(obj.minPrice);

  return price !== null;
}

function normalizeProduct(obj: Record<string, unknown>): ScrapedProduct | null {
  const name =
    (obj.name as string) ||
    (obj.title as string) ||
    (obj.productName as string) ||
    (obj.goodsName as string);
  if (!name) return null;

  const price =
    parsePrice(obj.price) ??
    parsePrice(obj.salePrice) ??
    parsePrice(obj.currentPrice) ??
    parsePrice(obj.minPrice);
  if (!price) return null;

  const compareAtPrice =
    parsePrice(obj.compareAtPrice) ??
    parsePrice(obj.originalPrice) ??
    parsePrice(obj.marketPrice) ??
    parsePrice(obj.listPrice) ??
    undefined;

  const imageUrls = new Set<string>();
  collectImageUrls(
    obj.images ?? obj.imageList ?? obj.imageUrl ?? obj.coverImage ?? obj.mainImage,
    imageUrls,
  );

  const description =
    (typeof obj.description === "string" && obj.description) ||
    (typeof obj.subTitle === "string" && obj.subTitle) ||
    undefined;

  return {
    name: name.trim(),
    description,
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
    imageUrls: [...imageUrls].slice(0, 4),
  };
}

function extractProductsFromJson(data: unknown, found: ScrapedProduct[]): void {
  if (!data || found.length >= MAX_PRODUCTS_PER_CATEGORY) return;

  if (Array.isArray(data)) {
    for (const item of data) extractProductsFromJson(item, found);
    return;
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (looksLikeProduct(obj)) {
      const product = normalizeProduct(obj);
      if (product && !found.some((p) => p.name === product.name)) {
        found.push(product);
      }
    }
    for (const value of Object.values(obj)) {
      if (found.length >= MAX_PRODUCTS_PER_CATEGORY) break;
      extractProductsFromJson(value, found);
    }
  }
}

function parseNextData(html: string): ScrapedProduct[] {
  const match = html.match(
    /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) return [];

  try {
    const json = JSON.parse(match[1]) as unknown;
    const products: ScrapedProduct[] = [];
    extractProductsFromJson(json, products);
    return products.slice(0, MAX_PRODUCTS_PER_CATEGORY);
  } catch {
    return [];
  }
}

function isBlockedPage(html: string): boolean {
  return (
    html.includes("page-unavailable") ||
    html.includes("not available in your country") ||
    html.includes("OOPS!")
  );
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/json",
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });
    if (!res.ok) {
      console.warn(`  HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`  Fetch failed for ${url}:`, err);
    return null;
  }
}

async function scrapeUrbanicCategory(category: Category): Promise<ScrapedProduct[]> {
  const url = URBANIC_URLS[category];
  console.log(`Fetching ${url}...`);
  await sleep(RATE_LIMIT_MS);

  const html = await fetchPage(url);
  if (!html) return [];

  if (isBlockedPage(html)) {
    console.warn(`  Urbanic geo-blocked or unavailable for ${category}`);
    return [];
  }

  const products = parseNextData(html);
  if (products.length > 0) {
    console.log(`  Parsed ${products.length} products from __NEXT_DATA__`);
    return products;
  }

  console.warn(`  No products found in page HTML for ${category}`);
  return [];
}

function getFallbackProducts(category: Category): ScrapedProduct[] {
  const women: ScrapedProduct[] = [
    {
      name: "Floral Print A-Line Dress",
      description: "Lightweight cotton blend dress with vibrant floral print.",
      price: 899,
      compareAtPrice: 1299,
      imageUrls: [],
    },
    {
      name: "High-Waist Wide Leg Trousers",
      description: "Relaxed fit trousers with elastic waistband.",
      price: 799,
      compareAtPrice: 1099,
      imageUrls: [],
    },
    {
      name: "Ribbed Knit Crop Top",
      description: "Soft ribbed fabric, perfect for layering.",
      price: 499,
      compareAtPrice: 699,
      imageUrls: [],
    },
    {
      name: "Pleated Midi Skirt",
      description: "Flowy pleated skirt with side zip closure.",
      price: 699,
      compareAtPrice: 999,
      imageUrls: [],
    },
    {
      name: "Oversized Linen Shirt",
      description: "Breathable linen blend, casual everyday wear.",
      price: 649,
      compareAtPrice: 899,
      imageUrls: [],
    },
    {
      name: "Wrap Front Blouse",
      description: "Elegant wrap design with tie closure.",
      price: 549,
      compareAtPrice: 799,
      imageUrls: [],
    },
    {
      name: "High-Neck Bodycon Dress",
      description: "Stretch fabric bodycon with high neckline.",
      price: 849,
      compareAtPrice: 1199,
      imageUrls: [],
    },
    {
      name: "Denim Jacket with Patch Pockets",
      description: "Classic denim jacket with utility pockets.",
      price: 1299,
      compareAtPrice: 1799,
      imageUrls: [],
    },
    {
      name: "Tiered Maxi Skirt",
      description: "Bohemian tiered skirt in flowing fabric.",
      price: 749,
      compareAtPrice: 1049,
      imageUrls: [],
    },
    {
      name: "Square Neck Cami Top",
      description: "Minimal square neck cami with adjustable straps.",
      price: 399,
      compareAtPrice: 599,
      imageUrls: [],
    },
  ];

  const men: ScrapedProduct[] = [
    {
      name: "Slim Fit Cotton Shirt",
      description: "Classic slim fit shirt in premium cotton.",
      price: 699,
      compareAtPrice: 999,
      imageUrls: [],
    },
    {
      name: "Tapered Chino Pants",
      description: "Smart casual chinos with stretch comfort.",
      price: 899,
      compareAtPrice: 1299,
      imageUrls: [],
    },
    {
      name: "Graphic Print Oversized Tee",
      description: "Relaxed fit tee with bold front graphic.",
      price: 449,
      compareAtPrice: 649,
      imageUrls: [],
    },
    {
      name: "Lightweight Bomber Jacket",
      description: "Zip-front bomber with ribbed cuffs.",
      price: 1499,
      compareAtPrice: 1999,
      imageUrls: [],
    },
    {
      name: "Straight Leg Denim Jeans",
      description: "Mid-rise straight leg jeans in dark wash.",
      price: 999,
      compareAtPrice: 1399,
      imageUrls: [],
    },
    {
      name: "Polo Collar Knit Polo",
      description: "Soft knit polo with contrast collar.",
      price: 599,
      compareAtPrice: 849,
      imageUrls: [],
    },
    {
      name: "Cargo Jogger Pants",
      description: "Utility cargo joggers with drawstring waist.",
      price: 849,
      compareAtPrice: 1149,
      imageUrls: [],
    },
    {
      name: "Henley Long Sleeve Tee",
      description: "Casual henley with button placket.",
      price: 499,
      compareAtPrice: 699,
      imageUrls: [],
    },
    {
      name: "Quilted Puffer Vest",
      description: "Lightweight insulated vest for layering.",
      price: 1199,
      compareAtPrice: 1599,
      imageUrls: [],
    },
    {
      name: "Relaxed Fit Linen Shorts",
      description: "Breathable linen shorts for summer.",
      price: 549,
      compareAtPrice: 799,
      imageUrls: [],
    },
  ];

  const catalog = category === "WOMEN" ? women : men;
  return catalog.map((product) => {
    const catalogUrl = imageUrlForProductName(product.name);
    return {
      ...product,
      imageUrls: catalogUrl ? [catalogUrl] : product.imageUrls,
    };
  });
}

function downloadImage(url: string, destPath: string): boolean {
  try {
    mkdirSync(dirname(destPath), { recursive: true });
    const args = [
      "-fsSL",
      "--max-time",
      "30",
      "--retry",
      "3",
      "--retry-delay",
      "1",
      "-H",
      `User-Agent: ${USER_AGENT}`,
      "-o",
      destPath,
      url,
    ];
    if (url.includes("myntassets.com")) {
      args.splice(-1, 0, "-H", `Referer: ${MYNT_REFERER}`);
    }
    execFileSync("curl", args, { stdio: "pipe" });
    return statSync(destPath).size > 1024;
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

    const ok = downloadImage(imageUrls[i], destPath);
    if (ok) {
      localPaths.push(publicPath);
    }
  }

  if (localPaths.length === 0) {
    const catalogUrl = imageUrlForSlug(slug);
    if (catalogUrl) {
      const filename = `${slug}-0.jpg`;
      const destPath = join(IMAGE_DIR, filename);
      const ok = downloadImage(catalogUrl, destPath);
      if (ok) localPaths.push(`/demo/products/${filename}`);
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
  product: ScrapedProduct,
  usedSlugs: Set<string>,
): Promise<void> {
  let slug = slugify(product.name);
  if (!slug) slug = `demo-${category.toLowerCase()}-${Date.now()}`;

  let suffix = 1;
  let uniqueSlug = slug;
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${suffix++}`;
  }
  usedSlugs.add(uniqueSlug);

  const images = await resolveProductImages(uniqueSlug, product.imageUrls);

  await prisma.product.create({
    data: {
      name: product.name,
      slug: uniqueSlug,
      description: product.description ?? "",
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

  console.log(`  ✓ ${product.name} (${uniqueSlug})`);
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
    console.error(
      "Could not connect to PostgreSQL. Ensure DATABASE_URL is correct and the database is running.",
    );
    console.error(err);
    process.exit(1);
  }

  console.log("Clearing existing demo products...");
  await prisma.product.deleteMany({ where: { isDemo: true } });

  const usedSlugs = new Set<string>();
  let usedFallback = false;

  for (const category of ["WOMEN", "MEN"] as const) {
    console.log(`\n=== ${category} ===`);

    let products = await scrapeUrbanicCategory(category);

    if (products.length === 0) {
      console.log(`  Using fallback demo catalog for ${category}`);
      products = getFallbackProducts(category);
      usedFallback = true;
    }

    products = products.slice(0, MAX_PRODUCTS_PER_CATEGORY);

    for (const product of products) {
      await seedProduct(category, product, usedSlugs);
      await sleep(RATE_LIMIT_MS);
    }
  }

  const total = await prisma.product.count({ where: { isDemo: true } });
  console.log(`\nDone. Seeded ${total} demo products.`);
  if (usedFallback) {
    console.log(
      "Note: Urbanic scraping was unavailable (geo-block); fallback catalog was used.",
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
