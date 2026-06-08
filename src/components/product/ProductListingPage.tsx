import { Category } from "@prisma/client";
import { ProductGrid } from "./ProductGrid";
import { getProducts } from "@/lib/products";

export async function ProductListingPage({
  title,
  category,
  search,
}: {
  title: string;
  category?: Category;
  search?: string;
}) {
  let products: Awaited<ReturnType<typeof getProducts>>["products"] = [];

  try {
    const result = await getProducts({ category, search, limit: 40 });
    products = result.products;
  } catch {
    products = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl tracking-wide text-primary">{title}</h1>
      <ProductGrid products={products} />
    </div>
  );
}
