import Image from "next/image";
import Link from "next/link";
import { calcDiscount, formatPrice, isLocalDemoAsset } from "@/lib/utils";
import { BRAND_IMAGE } from "@/lib/company";
import { WishlistButton } from "./WishlistButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const image = product.images[0] || BRAND_IMAGE;
  const discount = calcDiscount(product.price, product.compareAtPrice);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <WishlistButton productId={product.id} />
        <Image
          src={image}
          alt={product.name}
          fill
          unoptimized={isLocalDemoAsset(image)}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 bg-accent px-2 py-0.5 text-xs text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm text-primary">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
