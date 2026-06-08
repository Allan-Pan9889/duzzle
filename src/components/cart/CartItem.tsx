"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, isLocalDemoAsset } from "@/lib/utils";

export type CartItemData = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    size: string;
    color: string;
    product: {
      name: string;
      slug: string;
      price: number;
      images: string[];
    };
  };
};

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  updating,
}: {
  item: CartItemData;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  updating?: boolean;
}) {
  const { product } = item.variant;
  const image = product.images[0] || "/duzzle.png";

  return (
    <div className="flex gap-4 border-b border-gray-100 py-6">
      <Link
        href={`/product/${product.slug}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden bg-surface"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          unoptimized={isLocalDemoAsset(image)}
          className="object-cover"
          sizes="96px"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-muted">
            {item.variant.size} / {item.variant.color}
          </p>
          <p className="mt-2 text-sm text-primary">{formatPrice(product.price)}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border border-gray-200">
            <button
              type="button"
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              disabled={updating || item.quantity <= 1}
              className="px-3 py-1 text-sm disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={updating}
              className="px-3 py-1 text-sm disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={updating}
            className="text-xs text-muted transition-colors hover:text-primary"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
