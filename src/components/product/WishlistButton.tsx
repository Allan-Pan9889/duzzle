"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export function WishlistButton({ productId }: { productId: string }) {
  const { user, requireAuth } = useAuth();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setActive(false);
      return;
    }

    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => {
        const ids = (data.products ?? []).map((p: { id: string }) => p.id);
        setActive(ids.includes(productId));
      })
      .catch(() => setActive(false));
  }, [user, productId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const doToggle = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setActive(data.added);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    requireAuth(doToggle);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center bg-white/90 text-primary transition-colors hover:bg-white disabled:opacity-50"
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
