import { Category } from "@prisma/client";

export const PRODUCT_CATEGORIES = ["WOMEN", "MEN", "KIDS"] as const satisfies readonly Category[];

export function isValidProductCategory(value: string): value is Category {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}
