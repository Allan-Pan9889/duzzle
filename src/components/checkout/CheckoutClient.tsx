"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AddressForm, AddressFormData } from "@/components/checkout/AddressForm";
import { PaymentMethodOption, PaymentSelector } from "@/components/checkout/PaymentSelector";
import { Button } from "@/components/ui/Button";
import { calcShipping } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

type Address = AddressFormData & { id: string };

type CartItem = {
  id: string;
  quantity: number;
  variant: {
    product: { name: string; price: number };
  };
};

const FREE_SHIPPING_THRESHOLD = 999;
const BASE_SHIPPING_FEE = 79;

export function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>("COD");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [sabpaisaAvailable, setSabpaisaAvailable] = useState(false);

  const fetchData = useCallback(async () => {
    const [addrRes, cartRes, paymentRes] = await Promise.all([
      fetch("/api/addresses"),
      fetch("/api/cart"),
      fetch("/api/payments/config"),
    ]);

    if (addrRes.ok) {
      const addrData = await addrRes.json();
      const list = (addrData.addresses ?? []).map(
        (a: Address & { line2: string | null }) => ({
          ...a,
          line2: a.line2 ?? "",
        }),
      );
      setAddresses(list);
      const defaultAddr = list.find((a: Address) => a.isDefault) ?? list[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }

    if (cartRes.ok) {
      const cartData = await cartRes.json();
      setCartItems(cartData.items ?? []);
      setSubtotal(cartData.subtotal ?? 0);
    }

    if (paymentRes.ok) {
      const paymentData = await paymentRes.json();
      setSabpaisaAvailable(Boolean(paymentData.sabpaisaAvailable));
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const shippingFee = calcShipping(subtotal, FREE_SHIPPING_THRESHOLD, BASE_SHIPPING_FEE);
  const total = subtotal + shippingFee;

  async function handleAddAddress(data: AddressFormData) {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to save address");
    setShowAddressForm(false);
    await fetchData();
    if (result.address?.id) setSelectedAddressId(result.address.id);
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setError("Please select a delivery address");
      return;
    }

    if (paymentMethod === "SABPAISA" && !customerEmail.trim()) {
      setError("Email is required for online payment");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          customerEmail: paymentMethod === "SABPAISA" ? customerEmail.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      const { order, redirectUrl } = data;

      if (paymentMethod === "COD") {
        router.push(`/account/orders/${order.id}?placed=1`);
        return;
      }

      if (!redirectUrl) {
        throw new Error("Missing payment redirect URL");
      }

      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      setPlacing(false);
    }
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-muted">Loading checkout...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-primary">Checkout</h1>
        <p className="mt-4 text-muted">Your cart is empty</p>
        <Link href="/women" className="mt-6 inline-block text-sm text-primary underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-serif text-3xl tracking-wide text-primary">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-4 font-serif text-lg text-primary">Delivery Address</h2>
            {addresses.length === 0 && !showAddressForm ? (
              <p className="mb-4 text-sm text-muted">No saved addresses yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 border p-4 ${
                      selectedAddressId === address.id
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-primary">{address.fullName}</p>
                      <p className="text-muted">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                      </p>
                      <p className="text-muted">
                        {address.city}, {address.state} — {address.pinCode}
                      </p>
                      <p className="text-muted">{address.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!showAddressForm ? (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAddressForm(true)}
              >
                Add New Address
              </Button>
            ) : (
              <div className="mt-4 border border-gray-100 p-4">
                <AddressForm
                  initial={{ phone: user?.phone.replace("+91", "") ?? "" }}
                  onSubmit={handleAddAddress}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>
            )}
          </section>

          <section>
            <PaymentSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              sabpaisaAvailable={sabpaisaAvailable}
            />

            {paymentMethod === "SABPAISA" && (
              <div className="mt-4 border border-gray-100 p-4">
                <label className="block text-sm font-medium text-primary" htmlFor="checkout-email">
                  Email for payment receipt
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  autoComplete="email"
                />
              </div>
            )}
          </section>
        </div>

        <div className="border border-gray-100 bg-surface p-6">
          <h2 className="mb-4 font-serif text-lg text-primary">Order Summary</h2>
          <ul className="mb-4 space-y-2 text-sm">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between text-muted">
                <span className="line-clamp-1 pr-2">
                  {item.variant.product.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.variant.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button
            className="mt-6 w-full"
            disabled={placing || !selectedAddressId}
            onClick={handlePlaceOrder}
          >
            {placing ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
