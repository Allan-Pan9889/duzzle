import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductRow } from "@/components/home/ProductRow";
import { getLatestProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  let products: Awaited<ReturnType<typeof getLatestProducts>> = [];

  try {
    products = await getLatestProducts(8);
  } catch {
    products = [];
  }

  return (
    <>
      <HeroBanner />
      <CategoryGrid />
      <ProductRow
        title="New Arrivals"
        products={products}
        href="/new-arrivals"
      />
      <section className="bg-surface py-12 text-center">
        <p className="text-sm text-muted">
          Free shipping on orders over ₹999
        </p>
      </section>
    </>
  );
}
