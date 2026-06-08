import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) notFound();

  return (
    <ProductDetailClient
      name={product.name}
      description={product.description}
      price={product.price}
      compareAtPrice={product.compareAtPrice}
      images={product.images}
      variants={product.variants}
    />
  );
}
