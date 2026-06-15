import type { Category } from "@prisma/client";
import { Suspense } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import { ProductPagination } from "./ProductPagination";
import { getPriceBounds, getProducts } from "@/lib/products";

const PAGE_SIZE = 24;

export async function ProductListingPage({
  title,
  category,
  search,
  subCategory,
  minPrice,
  maxPrice,
  page = 1,
}: {
  title: string;
  category?: Category;
  search?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}) {
  let products: Awaited<ReturnType<typeof getProducts>>["products"] = [];
  let total = 0;
  let totalPages = 1;
  let currentPage = page;

  try {
    const result = await getProducts({
      category,
      search,
      subCategory,
      minPrice,
      maxPrice,
      page,
      limit: PAGE_SIZE,
    });
    products = result.products;
    total = result.total;
    totalPages = result.totalPages;
    currentPage = result.page;
  } catch (error) {
    console.error("ProductListingPage getProducts error:", error);
    products = [];
  }

  const priceBounds = await getPriceBounds(category).catch(() => ({
    min: 100,
    max: 10000,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl tracking-wide text-primary">{title}</h1>
        {total > 0 && (
          <p className="mt-2 text-sm text-muted">
            Showing {products.length} of {total} items
            {search ? ` matching “${search}”` : ""}
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-96 animate-pulse bg-surface" />}>
          <ProductFilters fixedCategory={category} priceBounds={priceBounds} />
        </Suspense>

        <div>
          {products.length === 0 ? (
            <p className="py-16 text-center text-muted">
              No products match your filters. Try adjusting price or category.
            </p>
          ) : (
            <ProductGrid products={products} />
          )}

          <Suspense fallback={null}>
            <ProductPagination page={currentPage} totalPages={totalPages} total={total} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
