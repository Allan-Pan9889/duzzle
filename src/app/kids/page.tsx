import { ProductListingPage } from "@/components/product/ProductListingPage";
import { parseProductFilters, type ProductFilterSearchParams } from "@/lib/parse-product-filters";
import { COMPANY_BRAND } from "@/lib/company";

export const metadata = {
  title: `Kids | ${COMPANY_BRAND}`,
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
