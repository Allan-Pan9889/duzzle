import { ProductListingPage } from "@/components/product/ProductListingPage";
import { parseProductFilters, type ProductFilterSearchParams } from "@/lib/parse-product-filters";

export const metadata = {
  title: "Kids | Duzzle",
};

export const dynamic = "force-dynamic";

export default async function KidsPage({
  searchParams,
}: {
  searchParams: Promise<ProductFilterSearchParams>;
}) {
  const filters = parseProductFilters(await searchParams, "KIDS");

  return (
    <ProductListingPage
      title="Kids"
      category="KIDS"
      search={filters.search}
      subCategory={filters.subCategory}
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      page={filters.page}
    />
  );
}
