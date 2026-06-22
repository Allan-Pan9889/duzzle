"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

type OrderItem = {
  productName: string;
  size: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  addressSnapshot: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pinCode: string;
  };
  items: OrderItem[];
};

const TIMELINE_STEPS = ["PENDING_PAYMENT", "PAID", "SHIPPED", "DELIVERED", "COMPLETED"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";
  const { user, loading, openLogin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }
    fetchOrder().finally(() => setFetching(false));
  }, [user, fetchOrder]);

  if (loading || fetching) {
    return <div className="px-4 py-16 text-center text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Button onClick={openLogin}>Login to view order</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted">Order not found</p>
        <Link href="/account/orders" className="mt-4 inline-block text-sm text-primary underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/account/orders" className="text-sm text-muted hover:text-primary">
        ← Back to Orders
      </Link>

      {justPlaced && (
        <div className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Order placed successfully! Thank you for shopping with Duzzlecode.
        </div>
      )}

      <div className="mt-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl text-primary">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-primary">Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {TIMELINE_STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-2 text-xs ${
                i <= currentStep ? "text-primary" : "text-muted"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                  i <= currentStep ? "bg-primary text-white" : "bg-surface"
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">
                {step.replace(/_/g, " ").toLowerCase()}
              </span>
              {i < TIMELINE_STEPS.length - 1 && (
                <span className="text-muted">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-primary">Items</h2>
        <ul className="divide-y divide-gray-100 border border-gray-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between px-4 py-3 text-sm">
              <div>
                <p className="text-primary">{item.productName}</p>
                <p className="text-xs text-muted">
                  Size {item.size} × {item.quantity}
                </p>
              </div>
              <p className="text-primary">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-medium text-primary">Delivery Address</h2>
          <div className="text-sm text-muted">
            <p className="text-primary">{order.addressSnapshot.fullName}</p>
            <p>
              {order.addressSnapshot.line1}
              {order.addressSnapshot.line2 ? `, ${order.addressSnapshot.line2}` : ""}
            </p>
            <p>
              {order.addressSnapshot.city}, {order.addressSnapshot.state} —{" "}
              {order.addressSnapshot.pinCode}
            </p>
            <p>{order.addressSnapshot.phone}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-primary">Payment</h2>
          <div className="space-y-1 text-sm text-muted">
            <p>
              Method:{" "}
              <span className="text-primary">
                {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}
              </span>
            </p>
            <p>
              Subtotal: <span className="text-primary">{formatPrice(order.subtotal)}</span>
            </p>
            <p>
              Shipping:{" "}
              <span className="text-primary">
                {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}
              </span>
            </p>
            <p className="font-medium text-primary">Total: {formatPrice(order.total)}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
