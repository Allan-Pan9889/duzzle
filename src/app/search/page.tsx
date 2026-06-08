import { ProductListingPage } from "@/components/product/ProductListingPage";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <ProductListingPage
      title={q ? `Results for "${q}"` : "Search"}
      search={q}
    />
  );
}
