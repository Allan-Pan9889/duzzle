import { ProductListingPage } from "@/components/product/ProductListingPage";
import { parseProductFilters, type ProductFilterSearchParams } from "@/lib/parse-product-filters";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<ProductFilterSearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);

  const title = filters.search
    ? `Results for “${filters.search}”`
    : filters.category || filters.subCategory || filters.minPrice
      ? "Filtered results"
      : "Search";

  return (
    <ProductListingPage
      title={title}
      category={filters.category}
      search={filters.search}
      subCategory={filters.subCategory}
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      page={filters.page}
    />
  );
}
