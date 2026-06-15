import type { Category } from "@prisma/client";
import { isValidProductCategory } from "@/lib/categories";

export type ProductFilterSearchParams = {
  q?: string;
  category?: string;
  subCategory?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

export type ParsedProductFilters = {
  search?: string;
  category?: Category;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
};

export function parseProductFilters(
  sp: ProductFilterSearchParams,
  fixedCategory?: Category,
): ParsedProductFilters {
  const minPrice = sp.minPrice ? parseInt(sp.minPrice, 10) : undefined;
  const maxPrice = sp.maxPrice ? parseInt(sp.maxPrice, 10) : undefined;
  const pageRaw = sp.page ? parseInt(sp.page, 10) : 1;

  let category: Category | undefined = fixedCategory;
  if (!category && sp.category && isValidProductCategory(sp.category)) {
    category = sp.category;
  }

  return {
    search: sp.q?.trim() || undefined,
    category,
    subCategory: sp.subCategory?.trim() || undefined,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

export function buildProductFilterQuery(
  filters: ParsedProductFilters,
  overrides: Partial<ParsedProductFilters> = {},
): Record<string, string> {
  const merged = { ...filters, ...overrides };
  const params: Record<string, string> = {};

  if (merged.search) params.q = merged.search;
  if (merged.category) params.category = merged.category;
  if (merged.subCategory) params.subCategory = merged.subCategory;
  if (merged.minPrice !== undefined) params.minPrice = String(merged.minPrice);
  if (merged.maxPrice !== undefined) params.maxPrice = String(merged.maxPrice);
  if (merged.page && merged.page > 1) params.page = String(merged.page);

  return params;
}
