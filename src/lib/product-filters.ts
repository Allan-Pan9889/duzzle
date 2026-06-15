import type { Category } from "@prisma/client";

export type SubCategoryOption = {
  key: string;
  label: string;
};

export const SUB_CATEGORIES: Record<Category, SubCategoryOption[]> = {
  WOMEN: [
    { key: "dresses", label: "Dresses & Gowns" },
    { key: "ethnic", label: "Ethnic Wear" },
    { key: "tops", label: "Tops & Tees" },
    { key: "jeans", label: "Jeans" },
    { key: "trousers", label: "Trousers & Pants" },
    { key: "coords", label: "Co-ord Sets" },
    { key: "skirts", label: "Skirts" },
    { key: "jackets", label: "Jackets & Outerwear" },
    { key: "nightwear", label: "Nightwear" },
    { key: "other", label: "Other" },
  ],
  MEN: [
    { key: "shirts", label: "Shirts" },
    { key: "t-shirts", label: "T-Shirts & Polos" },
    { key: "jeans", label: "Jeans" },
    { key: "trousers", label: "Trousers & Chinos" },
    { key: "ethnic", label: "Ethnic Wear" },
    { key: "jackets", label: "Jackets & Outerwear" },
    { key: "trackpants", label: "Trackpants & Joggers" },
    { key: "shorts", label: "Shorts" },
    { key: "other", label: "Other" },
  ],
  KIDS: [
    { key: "dresses", label: "Dresses & Frocks" },
    { key: "tops", label: "Tops & Tees" },
    { key: "sets", label: "Clothing Sets" },
    { key: "nightwear", label: "Nightwear" },
    { key: "bottoms", label: "Bottoms" },
    { key: "ethnic", label: "Ethnic Wear" },
    { key: "jackets", label: "Jackets & Outerwear" },
    { key: "other", label: "Other" },
  ],
};

export const PRICE_PRESETS = [
  { label: "₹100 – ₹499", min: 100, max: 499 },
  { label: "₹500 – ₹999", min: 500, max: 999 },
  { label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { label: "₹2,000+", min: 2000, max: undefined },
] as const;

export function subCategoriesFor(category?: Category): SubCategoryOption[] {
  if (!category) {
    return Object.values(SUB_CATEGORIES).flat();
  }
  return SUB_CATEGORIES[category];
}

export function subCategoryLabel(category: Category, key: string): string {
  return SUB_CATEGORIES[category].find((s) => s.key === key)?.label ?? key;
}
