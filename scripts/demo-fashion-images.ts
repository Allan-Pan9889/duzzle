/**
 * Curated Myntra (Indian e-commerce) product images for demo catalog.
 * Sources: public Myntra CDN assets (assets.myntassets.com).
 * Urbanic scraping is geo-blocked; these images match Indian fast-fashion style.
 */

import {
  DEMO_MEN_PRODUCTS,
  DEMO_WOMEN_PRODUCTS,
} from "./demo-product-catalog";

export const MYNT_REFERER = "https://www.myntra.com/";

/** slug -> primary product image URL */
export const DEMO_FASHION_IMAGE_CATALOG: Record<string, string> = {};

for (const product of [...DEMO_WOMEN_PRODUCTS, ...DEMO_MEN_PRODUCTS]) {
  DEMO_FASHION_IMAGE_CATALOG[slugify(product.name)] = product.imageUrl;
}

/** Homepage hero & category tiles (Myntra CDN) */
export const HOME_DEMO_IMAGE_SOURCES = {
  heroNewSeason:
    "http://assets.myntassets.com/assets/images/10016283/2019/8/7/1cf85cd3-a7c5-47fe-b30d-31ec3c10f4411565173618884-Bollywood-Vogue-Customised-Off-White-Anarkali-Suit-215156517-1.jpg",
  heroWomen: DEMO_FASHION_IMAGE_CATALOG["floral-print-a-line-dress"]!,
  heroMen: DEMO_FASHION_IMAGE_CATALOG["lightweight-bomber-jacket"]!,
  categoryWomen: DEMO_FASHION_IMAGE_CATALOG["high-neck-bodycon-dress"]!,
  categoryMen: DEMO_FASHION_IMAGE_CATALOG["slim-fit-cotton-shirt"]!,
} as const;

export const HOME_DEMO_IMAGE_PATHS = {
  heroNewSeason: "/demo/home/hero-new-season.jpg",
  heroWomen: "/demo/home/hero-women.jpg",
  heroMen: "/demo/home/hero-men.jpg",
  categoryWomen: "/demo/home/category-women.jpg",
  categoryMen: "/demo/home/category-men.jpg",
} as const;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function imageUrlForSlug(slug: string): string | undefined {
  return DEMO_FASHION_IMAGE_CATALOG[slug];
}

export function imageUrlForProductName(name: string): string | undefined {
  return DEMO_FASHION_IMAGE_CATALOG[slugify(name)];
}
