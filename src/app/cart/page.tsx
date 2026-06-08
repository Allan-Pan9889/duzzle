"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { CartItem, CartItemData } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { calcShipping } from "@/lib/shipping";

const FREE_SHIPPING_THRESHOLD = 999;
const BASE_SHIPPING_FEE = 79;

export default function CartPage() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    const data = await res.json();
    setItems(data.items ?? []);
    setSubtotal(data.subtotal ?? 0);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchCart().finally(() => setLoading(false));
  }, [user, authLoading, fetchCart]);

  async function updateQuantity(itemId: string, quantity: number) {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      await fetchCart();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: string) {
    setUpdatingId(itemId);
    try {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      await fetchCart();
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted">
        Loading cart...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-primary">Your Cart</h1>
        <p className="mt-4 text-muted">Please login to view your cart</p>
        <Button className="mt-6" onClick={openLogin}>
          Login with OTP
        </Button>
      </div>
    );
  }

  const shippingFee = calcShipping(subtotal, FREE_SHIPPING_THRESHOLD, BASE_SHIPPING_FEE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl tracking-wide text-primary">Your Cart</h1>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted">Your cart is empty</p>
          <Link href="/women" className="mt-4 inline-block text-sm text-primary underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                updating={updatingId === item.id}
                onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
          <div>
            <CartSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
            />
          </div>
        </div>
      )}
    </div>
  );
}
