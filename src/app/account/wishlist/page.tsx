"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProductCard, ProductCardData } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const { user, loading, openLogin } = useAuth();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchWishlist = useCallback(async () => {
    const res = await fetch("/api/wishlist");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products ?? []);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }
    fetchWishlist().finally(() => setFetching(false));
  }, [user, fetchWishlist]);

  if (loading || fetching) {
    return <div className="px-4 py-16 text-center text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Button onClick={openLogin}>Login to view wishlist</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/account" className="text-sm text-muted hover:text-primary">
        ← Back to Account
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-primary">Wishlist</h1>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          No saved items yet. Tap ♡ on any product to save it.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
