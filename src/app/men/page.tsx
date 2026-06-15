import { ProductListingPage } from "@/components/product/ProductListingPage";
import { parseProductFilters, type ProductFilterSearchParams } from "@/lib/parse-product-filters";

export const dynamic = "force-dynamic";

export default async function MenPage({
  searchParams,
}: {
  searchParams: Promise<ProductFilterSearchParams>;
}) {
  const filters = parseProductFilters(await searchParams, "MEN");

  return (
    <ProductListingPage
      title="Men"
      category="MEN"
      search={filters.search}
      subCategory={filters.subCategory}
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      page={filters.page}
    />
  );
}
