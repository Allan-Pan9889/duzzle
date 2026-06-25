"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { getPaymentMethodLabel } from "@/lib/payment-labels";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
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
  user: { phone: string };
  items: {
    productName: string;
    size: string;
    price: number;
    quantity: number;
  }[];
};

const STATUSES = ["PENDING_PAYMENT", "PAID", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setStatus(data.order.status);
        }
      });
  }

  useEffect(() => {
    load();
  }, [id]);

  async function updateStatus() {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) load();
    } finally {
      setSaving(false);
    }
  }

  if (!order) {
    return (
      <AdminShell>
        <p className="text-muted">Loading...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Link href="/admin/orders" className="text-sm text-muted hover:text-primary">
        ← Back to Orders
      </Link>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl text-primary">{order.orderNumber}</h1>
          <p className="text-sm text-muted">{order.user.phone}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-6 flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={updateStatus} disabled={saving || status === order.status}>
          {saving ? "Saving..." : "Update"}
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-gray-100 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-primary">Items</h2>
          <ul className="space-y-2 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {item.productName} ({item.size}) × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-gray-100 pt-3 text-sm">
            <p>Subtotal: {formatPrice(order.subtotal)}</p>
            <p>Shipping: {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</p>
            <p className="font-medium">Total: {formatPrice(order.total)}</p>
          </div>
        </section>

        <section className="border border-gray-100 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-primary">Delivery Address</h2>
          <div className="text-sm text-muted">
            <p className="text-primary">{order.addressSnapshot.fullName}</p>
            <p>{order.addressSnapshot.line1}</p>
            {order.addressSnapshot.line2 && <p>{order.addressSnapshot.line2}</p>}
            <p>
              {order.addressSnapshot.city}, {order.addressSnapshot.state} —{" "}
              {order.addressSnapshot.pinCode}
            </p>
            <p>{order.addressSnapshot.phone}</p>
          </div>
          <p className="mt-4 text-sm text-muted">
            Payment: {getPaymentMethodLabel(order.paymentMethod)}
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
