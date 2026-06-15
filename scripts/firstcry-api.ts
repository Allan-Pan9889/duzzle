import type { Category } from "@prisma/client";
import { MIN_CLOTHING_PRICE_INR } from "./scrape-config";
import { inferSubCategory } from "./infer-subcategory";

export type FirstCryProductFields = {
  productinfoid: string;
  productname: string;
  productdesc?: string;
  discountedprice: string;
  mrp: string;
  product_types?: string;
  bname?: string;
};

export type FirstCryScrapedProduct = {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  imageUrls: string[];
  firstCryId: string;
  subCategory: string;
};

const SEARCH_API =
  "https://www.firstcry.com/svcs/search.svc/GetSearchPagingProducts_new";

/** Rotating queries to collect kids apparel from FirstCry search. */
export const FIRSTCRY_KIDS_QUERIES = [
  "girls frock",
  "boys t shirt",
  "girls dress",
  "boys jeans",
  "girls lehenga",
  "boys kurta",
  "kids jacket",
  "girls top",
  "boys trackpant",
  "girls skirt",
  "baby romper",
  "boys shirt",
  "girls night suit",
  "kids polo shirt",
  "boys shorts",
  "girls ethnic wear",
  "kids co ord set",
  "boys night suit",
  "girls jumpsuit",
  "baby onesie",
  "kids sweater",
  "boys cargo pants",
  "girls palazzo",
  "kids cotton dress",
  "boys formal shirt",
  "girls party wear",
  "kids leggings",
  "baby clothing set",
  "boys dungaree",
  "girls top cotton",
] as const;

const NON_CLOTHING =
  /\b(diaper|nappy|wipe|toy|doll|soft toy|plush|rattle|stroller|pram|car seat|feeding|bottle|nipple|pacifier|cream|lotion|shampoo|soap|gear|organiser|organizer|storage|wardrobe bag|bedsheet|blanket|maternity|school bag|backpack|sandal|shoe|sneaker|footwear|bootie|musical|puzzle|block|game|rakhi|decorative|string light|candle|christmas|door hanger|table décor|table decor|trash|garbage|liner|picture book|photoshoot props?|photography props?|paint your t-shirt|milestone hamper|daily items|daily needs|essentials combo|complete combo|gift combo|all items gift|\d+\s*in\s*\d+)\b/i;

const CLOTHING_TYPE =
  /\b(Dress|Frock|Shirt|T-Shirt|Tee|Top|Kurta|Jeans|Pants|Trouser|Shorts|Romper|Onesie|Lehenga|Choli|Sweater|Jacket|Leggings|Skirt|Jumpsuit|Blazer|Night Suit|Pyjama|Jogger|Swimsuit|Dungaree|Clothing Set|Polo|Trackpant|Cargo|Sweatshirt|Cardigan|Overall|Blouse|Kurti|Salwar|Co-?Ord|Coord Set|Nightwear|Inner Tee|Track Suit|Suit Set|Palazzo|Dhoti)\b/i;

export function firstCryPriceToInr(value: string | number): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function isKidsClothingProduct(
  fields: FirstCryProductFields,
  minPrice = MIN_CLOTHING_PRICE_INR,
): boolean {
  const types = fields.product_types ?? "";
  const name = fields.productname ?? "";
  const desc = fields.productdesc ?? "";
  const text = `${name} ${desc} ${types}`;

  if (NON_CLOTHING.test(text)) return false;
  if (!CLOTHING_TYPE.test(types)) return false;

  const sale = firstCryPriceToInr(fields.discountedprice || fields.mrp);
  return sale >= minPrice;
}

export function firstCryImageUrl(productId: string, size = "438x535"): string {
  return `https://cdn.fcglcdn.com/brainbees/images/products/${size}/${productId}a.webp`;
}

export function mapFirstCryProduct(fields: FirstCryProductFields): FirstCryScrapedProduct {
  const price = firstCryPriceToInr(fields.discountedprice || fields.mrp);
  const mrp = firstCryPriceToInr(fields.mrp);
  const id = fields.productinfoid;
  const name = fields.productname.trim();
  const description = (fields.productdesc ?? fields.product_types ?? "").trim();

  return {
    name,
    description,
    price,
    compareAtPrice: mrp > price ? mrp : undefined,
    imageUrls: [firstCryImageUrl(id)],
    firstCryId: id,
    subCategory: inferSubCategory("KIDS", name, description),
  };
}

async function fetchSearchPage(query: string, page: number, pageSize: number) {
  const params = new URLSearchParams({
    PageNo: String(page),
    PageSize: String(pageSize),
    SortExpression: "popularity",
    SubCatId: "",
    BrandId: "",
    Price: "",
    OUTOFSTOCK: "",
    DISCOUNT: "",
    Q: query,
    rating: "",
  });

  const res = await fetch(`${SEARCH_API}?${params.toString()}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`FirstCry search failed (HTTP ${res.status}) for query "${query}"`);
  }

  const outer = (await res.json()) as { ProductResponse?: string };
  if (!outer.ProductResponse) {
    throw new Error(`FirstCry search parse error for query "${query}"`);
  }

  const inner = JSON.parse(outer.ProductResponse) as {
    hits?: { hit?: Array<{ fields: FirstCryProductFields }> };
  };

  return inner.hits?.hit ?? [];
}

export async function fetchFirstCryKidsProducts(limit: number): Promise<FirstCryScrapedProduct[]> {
  const results: FirstCryScrapedProduct[] = [];
  const seen = new Set<string>();

  for (const query of FIRSTCRY_KIDS_QUERIES) {
    if (results.length >= limit) break;

    for (let page = 1; page <= 25 && results.length < limit; page++) {
      let batch: Array<{ fields: FirstCryProductFields }>;
      try {
        batch = await fetchSearchPage(query, page, 40);
      } catch {
        break;
      }
      if (batch.length === 0) break;

      for (const hit of batch) {
        const fields = hit.fields;
        if (!fields?.productinfoid || !isKidsClothingProduct(fields)) continue;

        const mapped = mapFirstCryProduct(fields);
        if (seen.has(mapped.firstCryId)) continue;
        seen.add(mapped.firstCryId);
        results.push(mapped);
        if (results.length >= limit) break;
      }

      await sleep(200);
    }
  }

  return results.slice(0, limit);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const FIRSTCRY_IMAGE_REFERER = "https://www.firstcry.com/";
export const FIRSTCRY_SITE_URL = "https://www.firstcry.com/";
