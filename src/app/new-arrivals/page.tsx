import { ProductListingPage } from "@/components/product/ProductListingPage";
import { parseProductFilters, type ProductFilterSearchParams } from "@/lib/parse-product-filters";

export const dynamic = "force-dynamic";

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<ProductFilterSearchParams>;
}) {
  const filters = parseProductFilters(await searchParams);

  return (
    <ProductListingPage
      title="New Arrivals"
      category={filters.category}
      search={filters.search}
      subCategory={filters.subCategory}
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      page={filters.page}
    />
  );
}
