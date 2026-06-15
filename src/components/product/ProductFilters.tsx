"use client";

import type { Category } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PRICE_PRESETS, SUB_CATEGORIES } from "@/lib/product-filters";

type ProductFiltersProps = {
  fixedCategory?: Category;
  priceBounds: { min: number; max: number };
};

export function ProductFilters({ fixedCategory, priceBounds }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory =
    fixedCategory ??
    ((searchParams.get("category") as Category | null) || undefined);

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<Category | "">(
    currentCategory ?? "",
  );
  const [subCategory, setSubCategory] = useState(searchParams.get("subCategory") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const subOptions = useMemo(() => {
    const cat = fixedCategory ?? category;
    if (cat) return SUB_CATEGORIES[cat];
    const seen = new Set<string>();
    return Object.values(SUB_CATEGORIES).flat().filter((opt) => {
      if (seen.has(opt.key)) return false;
      seen.add(opt.key);
      return true;
    });
  }, [category, fixedCategory]);

  const applyFilters = useCallback(
    (next?: {
      q?: string;
      category?: Category | "";
      subCategory?: string;
      minPrice?: string;
      maxPrice?: string;
    }) => {
      const params = new URLSearchParams();
      const q = next?.q ?? keyword;
      const cat = fixedCategory ?? (next?.category !== undefined ? next.category : category);
      const sub = next?.subCategory ?? subCategory;
      const min = next?.minPrice ?? minPrice;
      const max = next?.maxPrice ?? maxPrice;

      if (q.trim()) params.set("q", q.trim());
      if (cat) params.set("category", cat);
      if (sub) params.set("subCategory", sub);
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [category, fixedCategory, keyword, maxPrice, minPrice, pathname, router, subCategory],
  );

  const clearFilters = () => {
    setKeyword("");
    setCategory(fixedCategory ?? "");
    setSubCategory("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  return (
    <aside className="space-y-6 border border-gray-100 bg-surface p-5">
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted">
          Search
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="flex gap-2"
        >
          <Input
            type="search"
            placeholder="Keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="Search keyword"
          />
          <Button type="submit" className="shrink-0 px-4">
            Go
          </Button>
        </form>
      </div>

      {!fixedCategory && (
        <div>
          <label
            htmlFor="filter-category"
            className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted"
          >
            Category
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => {
              const value = e.target.value as Category | "";
              setCategory(value);
              setSubCategory("");
              applyFilters({ category: value, subCategory: "" });
            }}
            className="w-full border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary"
          >
            <option value="">All categories</option>
            <option value="WOMEN">Women</option>
            <option value="MEN">Men</option>
            <option value="KIDS">Kids</option>
          </select>
        </div>
      )}

      <div>
        <label
          htmlFor="filter-subcategory"
          className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted"
        >
          Type
        </label>
        <select
          id="filter-subcategory"
          value={subCategory}
          onChange={(e) => {
            setSubCategory(e.target.value);
            applyFilters({ subCategory: e.target.value });
          }}
          className="w-full border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-primary"
        >
          <option value="">All types</option>
          {subOptions.map((opt) => (
            <option key={`${opt.key}-${opt.label}`} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
          Price (₹)
        </p>
        <div className="mb-3 flex gap-2">
          <Input
            type="number"
            min={priceBounds.min}
            max={priceBounds.max}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
          />
          <Input
            type="number"
            min={priceBounds.min}
            max={priceBounds.max}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const min = String(preset.min);
                const max = preset.max !== undefined ? String(preset.max) : "";
                setMinPrice(min);
                setMaxPrice(max);
                applyFilters({ minPrice: min, maxPrice: max });
              }}
              className="border border-gray-200 px-2 py-1 text-xs text-primary transition-colors hover:border-primary"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full py-2 text-xs"
          onClick={() => applyFilters()}
        >
          Apply price
        </Button>
      </div>

      <Button type="button" variant="ghost" className="w-full py-2 text-xs" onClick={clearFilters}>
        Clear all filters
      </Button>
    </aside>
  );
}
