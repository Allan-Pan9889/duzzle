import { ProductListingPage } from "@/components/product/ProductListingPage";
import { parseProductFilters, type ProductFilterSearchParams } from "@/lib/parse-product-filters";

export const dynamic = "force-dynamic";

export default async function WomenPage({
  searchParams,
}: {
  searchParams: Promise<ProductFilterSearchParams>;
}) {
  const filters = parseProductFilters(await searchParams, "WOMEN");

  return (
    <ProductListingPage
      title="Women"
      category="WOMEN"
      search={filters.search}
      subCategory={filters.subCategory}
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      page={filters.page}
    />
  );
}
