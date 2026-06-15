import type { Category } from "@prisma/client";
import { MIN_CLOTHING_PRICE_INR } from "./scrape-config";
import { inferSubCategory } from "./infer-subcategory";

export type NykaaProduct = {
  id: string;
  sku?: string;
  title: string;
  subTitle: string;
  price: number;
  discountedPrice: number;
  discount?: number;
  imageUrl: string;
  actionUrl?: string;
};

export type NykaaScrapedProduct = {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrls: string[];
  nykaaId: string;
  subCategory: string;
};

const JINA_PREFIX = "https://r.jina.ai/";
const API_BASE =
  "https://www.nykaafashion.com/rest/appapi/V2/categories/products";

const NYKAA_SORTS = ["popularity", "newest", "discount"] as const;

/** Nykaa API returns prices in ₹100 units (e.g. 41 → ₹4100). */
export function nykaaPriceToInr(value: number): number {
  return Math.round(value * 100);
}

const NON_CLOTHING =
  /\b(bra\b|briefs?\b|boxer|panty|panties|underwear|lingerie|innerwear|bodysuit|shaper|shapewear|hipster|sandals?\b|heels?\b|shoes?\b|sneakers?\b|footwear|flip.?flop|sliders?\b|loafer|boots?\b|handbag|backpack|duffle|duffel|tote\b|organiser|organizer|wallet|watch|earring|necklace|bracelet|ring\b|lipstick|perfume|serum|cream|moistur|shampoo|conditioner|soap\b|scrunchie|hair clip|sunglasses|lace.?ups?\b|sling bag|bag with)\b/i;

export function isClothingProduct(product: NykaaProduct, minPrice = MIN_CLOTHING_PRICE_INR): boolean {
  const text = `${product.title} ${product.subTitle}`;
  if (NON_CLOTHING.test(text)) return false;
  const sale = nykaaPriceToInr(product.discountedPrice || product.price);
  return sale >= minPrice;
}

export function formatProductName(product: NykaaProduct): string {
  const brand = product.title?.trim();
  const detail = product.subTitle?.trim();
  if (!detail) return brand || "Fashion Item";
  if (!brand || detail.toLowerCase().startsWith(brand.toLowerCase())) {
    return detail;
  }
  return `${brand} ${detail}`;
}

function normalizeImageUrl(url: string): string {
  return url.split("?")[0] ?? url;
}

export function mapNykaaProduct(
  product: NykaaProduct,
  category: Category,
): NykaaScrapedProduct {
  const price = nykaaPriceToInr(product.discountedPrice || product.price);
  const mrp = nykaaPriceToInr(product.price);
  const imageUrl = normalizeImageUrl(product.imageUrl);
  const name = formatProductName(product);
  const description = product.subTitle?.trim() || product.title?.trim() || "";

  return {
    name,
    description,
    price,
    compareAtPrice: mrp > price ? mrp : undefined,
    imageUrls: imageUrl ? [imageUrl] : [],
    nykaaId: product.id,
    subCategory: inferSubCategory(category, name, description),
  };
}

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return "";
  return text.slice(start, end + 1);
}

function extractNykaaPayload(text: string): string {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{")) {
    try {
      const wrapper = JSON.parse(extractJsonObject(text)) as { data?: { content?: string } };
      if (typeof wrapper.data?.content === "string" && wrapper.data.content.length > 0) {
        return extractJsonObject(wrapper.data.content);
      }
    } catch {
      // fall through
    }
    return extractJsonObject(text);
  }

  const marker = "Markdown Content:\n";
  const markerIdx = text.indexOf(marker);
  if (markerIdx >= 0) {
    return extractJsonObject(text.slice(markerIdx + marker.length));
  }

  return extractJsonObject(text);
}

async function fetchNykaaJson(
  categoryId: number,
  page: number,
  pageSize: number,
  sort: string,
) {
  const target = `${API_BASE}?categoryId=${categoryId}&PageSize=${pageSize}&sort=${sort}&currentPage=${page}&filter_format=v2`;
  const res = await fetch(`${JINA_PREFIX}${target}`);

  if (!res.ok) {
    throw new Error(`Nykaa fetch failed (HTTP ${res.status}) for category ${categoryId}`);
  }

  const text = await res.text();
  const jsonText = extractNykaaPayload(text);

  if (!jsonText || jsonText.indexOf('"status"') === -1) {
    throw new Error(`Nykaa response parse error for category ${categoryId} page ${page}`);
  }

  const data = JSON.parse(jsonText) as {
    status?: string;
    response?: { products?: NykaaProduct[] };
  };

  if (data.status !== "success" || !Array.isArray(data.response?.products)) {
    throw new Error(`Nykaa API error for category ${categoryId} page ${page}`);
  }

  return data.response.products.filter((p) => p?.id && p.imageUrl);
}

export async function fetchNykaaCategoryProducts(
  categoryId: number,
  category: Category,
  limit: number,
): Promise<NykaaScrapedProduct[]> {
  const results: NykaaScrapedProduct[] = [];
  const seen = new Set<string>();

  for (const sort of NYKAA_SORTS) {
    if (results.length >= limit) break;

    for (let page = 1; page <= 60 && results.length < limit; page++) {
      let batch: NykaaProduct[];
      try {
        batch = await fetchNykaaJson(categoryId, page, 50, sort);
      } catch {
        break;
      }
      if (batch.length === 0) break;

      for (const raw of batch) {
        if (!isClothingProduct(raw)) continue;
        const mapped = mapNykaaProduct(raw, category);
        const key = mapped.nykaaId || mapped.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        results.push(mapped);
        if (results.length >= limit) break;
      }

      await sleep(280);
    }
  }

  return results.slice(0, limit);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const NYKAA_CATEGORY_URLS = {
  WOMEN: "https://www.nykaafashion.com/women/c/6557?root=topnav_1",
  MEN: "https://www.nykaafashion.com/men/c/6823?root=topnav_1",
} as const;

export const NYKAA_CATEGORY_IDS = {
  WOMEN: 6557,
  MEN: 6823,
} as const;

export const NYKAA_IMAGE_REFERER = "https://www.nykaafashion.com/";
