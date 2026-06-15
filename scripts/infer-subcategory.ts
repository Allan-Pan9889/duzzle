import type { Category } from "@prisma/client";

export type SubCategoryRule = {
  key: string;
  label: string;
  pattern: RegExp;
};

export const SUB_CATEGORY_RULES: Record<Category, SubCategoryRule[]> = {
  WOMEN: [
    { key: "dresses", label: "Dresses & Gowns", pattern: /\b(dress|gown|frock|anarkali|maxi|midi dress)\b/i },
    { key: "ethnic", label: "Ethnic Wear", pattern: /\b(kurta|kurti|saree|lehenga|choli|salwar|palazzo|dupatta)\b/i },
    { key: "tops", label: "Tops & Tees", pattern: /\b(top|tee|t-shirt|blouse|tank|camisole|crop)\b/i },
    { key: "jeans", label: "Jeans", pattern: /\b(jeans|denim)\b/i },
    { key: "trousers", label: "Trousers & Pants", pattern: /\b(trouser|pants|jogger|legging|tight|skort)\b/i },
    { key: "coords", label: "Co-ord Sets", pattern: /\b(co-?ord|coord set|set of)\b/i },
    { key: "skirts", label: "Skirts", pattern: /\b(skirt)\b/i },
    { key: "jackets", label: "Jackets & Outerwear", pattern: /\b(jacket|blazer|coat|shrug|cardigan|sweater)\b/i },
    { key: "nightwear", label: "Nightwear", pattern: /\b(night|pyjama|sleep|loungewear)\b/i },
  ],
  MEN: [
    { key: "shirts", label: "Shirts", pattern: /\b(shirt|oxford|formal shirt)\b/i },
    { key: "t-shirts", label: "T-Shirts & Polos", pattern: /\b(tee|t-shirt|polo)\b/i },
    { key: "jeans", label: "Jeans", pattern: /\b(jeans|denim)\b/i },
    { key: "trousers", label: "Trousers & Chinos", pattern: /\b(trouser|pants|chino|cargo)\b/i },
    { key: "ethnic", label: "Ethnic Wear", pattern: /\b(kurta|sherwani|nehru|dhoti)\b/i },
    { key: "jackets", label: "Jackets & Outerwear", pattern: /\b(jacket|blazer|hoodie|sweatshirt|bomber|vest)\b/i },
    { key: "trackpants", label: "Trackpants & Joggers", pattern: /\b(trackpant|jogger|track pant|sweatpant)\b/i },
    { key: "shorts", label: "Shorts", pattern: /\b(shorts)\b/i },
  ],
  KIDS: [
    { key: "dresses", label: "Dresses & Frocks", pattern: /\b(dress|frock|lehenga|party dress)\b/i },
    { key: "tops", label: "Tops & Tees", pattern: /\b(top|tee|t-shirt|polo|shirt)\b/i },
    { key: "sets", label: "Clothing Sets", pattern: /\b(clothing set|coord|co-ord|set of|pack of)\b/i },
    { key: "nightwear", label: "Nightwear", pattern: /\b(night suit|pyjama|nightwear|romper|onesie)\b/i },
    { key: "bottoms", label: "Bottoms", pattern: /\b(jeans|pants|shorts|trackpant|jogger|skirt)\b/i },
    { key: "ethnic", label: "Ethnic Wear", pattern: /\b(kurta|kurti|salwar|dhoti)\b/i },
    { key: "jackets", label: "Jackets & Outerwear", pattern: /\b(jacket|sweater|cardigan|blazer)\b/i },
  ],
};

export function inferSubCategory(
  category: Category,
  name: string,
  description = "",
): string {
  const text = `${name} ${description}`;
  for (const rule of SUB_CATEGORY_RULES[category]) {
    if (rule.pattern.test(text)) return rule.key;
  }
  return "other";
}
