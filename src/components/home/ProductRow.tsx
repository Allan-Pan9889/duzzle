import Link from "next/link";
import { ProductCard, ProductCardData } from "@/components/product/ProductCard";

export function ProductRow({
  title,
  products,
  href,
}: {
  title: string;
  products: ProductCardData[];
  href?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl tracking-wide text-primary">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-muted transition-colors hover:text-primary">
            View All →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
