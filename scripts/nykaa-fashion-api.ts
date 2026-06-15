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
};

const JINA_PREFIX = "https://r.jina.ai/";
const API_BASE =
  "https://www.nykaafashion.com/rest/appapi/V2/categories/products";

/** Nykaa API returns prices in ₹100 units (e.g. 41 → ₹4100). */
export function nykaaPriceToInr(value: number): number {
  return Math.round(value * 100);
}

const NON_CLOTHING =
  /\b(bra\b|briefs?\b|boxer|panty|panties|underwear|lingerie|innerwear|bodysuit|shaper|shapewear|hipster|sandals?\b|heels?\b|shoes?\b|sneakers?\b|footwear|flip.?flop|sliders?\b|loafer|boots?\b|handbag|backpack|duffle|duffel|tote\b|organiser|organizer|wallet|watch|earring|necklace|bracelet|ring\b|lipstick|perfume|serum|cream|moistur|shampoo|conditioner|soap\b|scrunchie|hair clip|sunglasses|lace.?ups?\b)\b/i;

export function isClothingProduct(product: NykaaProduct): boolean {
  const text = `${product.title} ${product.subTitle}`;
  if (NON_CLOTHING.test(text)) return false;
  const sale = nykaaPriceToInr(product.discountedPrice || product.price);
  return sale >= 199;
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

export function mapNykaaProduct(product: NykaaProduct): NykaaScrapedProduct {
  const price = nykaaPriceToInr(product.discountedPrice || product.price);
  const mrp = nykaaPriceToInr(product.price);
  const imageUrl = normalizeImageUrl(product.imageUrl);

  return {
    name: formatProductName(product),
    description: product.subTitle?.trim() || product.title?.trim() || "",
    price,
    compareAtPrice: mrp > price ? mrp : undefined,
    imageUrls: imageUrl ? [imageUrl] : [],
    nykaaId: product.id,
  };
}

function extractNykaaPayload(text: string): string {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{")) {
    try {
      const wrapper = JSON.parse(text) as { data?: { content?: string } };
      if (typeof wrapper.data?.content === "string" && wrapper.data.content.length > 0) {
        return wrapper.data.content;
      }
    } catch {
      // fall through to markdown extraction
    }
  }

  const marker = "Markdown Content:\n";
  const markerIdx = text.indexOf(marker);
  if (markerIdx >= 0) {
    return text.slice(markerIdx + marker.length);
  }

  const statusIdx = text.indexOf('{"status"');
  return statusIdx >= 0 ? text.slice(statusIdx) : "";
}

async function fetchNykaaJson(categoryId: number, page: number, pageSize: number) {
  const target = `${API_BASE}?categoryId=${categoryId}&PageSize=${pageSize}&sort=popularity&currentPage=${page}&filter_format=v2`;
  const res = await fetch(`${JINA_PREFIX}${target}`);

  if (!res.ok) {
    throw new Error(`Nykaa fetch failed (HTTP ${res.status}) for category ${categoryId}`);
  }

  const text = await res.text();
  const jsonText = extractNykaaPayload(text);

  if (!jsonText || jsonText.indexOf('"status"') === -1) {
    throw new Error(`Nykaa response parse error for category ${categoryId}`);
  }

  const data = JSON.parse(jsonText) as {
    status?: string;
    response?: { products?: NykaaProduct[] };
  };

  if (data.status !== "success" || !Array.isArray(data.response?.products)) {
    throw new Error(`Nykaa API error for category ${categoryId}`);
  }

  return data.response.products;
}

export async function fetchNykaaCategoryProducts(
  categoryId: number,
  limit: number,
): Promise<NykaaScrapedProduct[]> {
  const results: NykaaScrapedProduct[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= 8 && results.length < limit; page++) {
    const batch = await fetchNykaaJson(categoryId, page, 50);
    if (batch.length === 0) break;

    for (const raw of batch) {
      if (!isClothingProduct(raw)) continue;
      const mapped = mapNykaaProduct(raw);
      const key = mapped.nykaaId || mapped.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(mapped);
      if (results.length >= limit) break;
    }
  }

  return results.slice(0, limit);
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
