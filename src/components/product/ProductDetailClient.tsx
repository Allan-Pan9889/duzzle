"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "./ProductGallery";
import { SizePicker } from "./SizePicker";

type Variant = {
  id: string;
  size: string;
  stock: number;
};

export function ProductDetailClient({
  name,
  description,
  price,
  compareAtPrice,
  images,
  variants,
}: {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  variants: Variant[];
}) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const defaultVariant = useMemo(
    () => variants.find((v) => v.stock > 0) ?? null,
    [variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    defaultVariant?.id ?? null,
  );

  const selected = variants.find((v) => v.id === selectedVariantId);

  async function addToCart(redirectToCheckout = false) {
    if (!selected) return;

    const doAdd = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: selected.id, quantity: 1 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add to cart");

        if (redirectToCheckout) {
          router.push("/checkout");
        } else {
          setMessage("Added to cart!");
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to add to cart");
      } finally {
        setLoading(false);
      }
    };

    requireAuth(doAdd);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <ProductGallery images={images} name={name} />

      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl tracking-wide text-primary">{name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xl font-medium text-primary">{formatPrice(price)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-muted line-through">{formatPrice(compareAtPrice)}</span>
            )}
          </div>
        </div>

        {description && (
          <p className="text-sm leading-relaxed text-muted">{description}</p>
        )}

        <SizePicker
          variants={variants}
          selectedVariantId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="primary"
            className="flex-1"
            disabled={!selected || selected.stock === 0 || loading}
            onClick={() => addToCart(false)}
          >
            {loading ? "Adding..." : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={!selected || selected.stock === 0 || loading}
            onClick={() => addToCart(true)}
          >
            Buy Now
          </Button>
        </div>

        {message && (
          <p className={`text-sm ${message.includes("Added") ? "text-accent" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {selected && selected.stock <= 5 && selected.stock > 0 && (
          <p className="text-sm text-accent">Only {selected.stock} left in stock</p>
        )}
      </div>
    </div>
  );
}
