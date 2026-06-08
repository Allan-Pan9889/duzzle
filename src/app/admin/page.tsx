"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

type Stats = {
  productCount: number;
  orderCount: number;
  ordersToday: number;
  pendingOrders: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data.stats));
  }, []);

  return (
    <AdminShell>
      <h1 className="font-serif text-2xl text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Overview of your store</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Products", value: stats?.productCount ?? "—" },
          { label: "Total Orders", value: stats?.orderCount ?? "—" },
          { label: "Orders Today", value: stats?.ordersToday ?? "—" },
          { label: "Pending Orders", value: stats?.pendingOrders ?? "—" },
        ].map((card) => (
          <div key={card.label} className="border border-gray-100 bg-white p-5">
            <p className="text-xs text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-medium text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href="/admin/products/new"
          className="border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white"
        >
          Add Product
        </Link>
        <Link
          href="/admin/orders"
          className="border border-gray-200 px-4 py-2 text-sm text-primary hover:bg-surface"
        >
          View Orders
        </Link>
      </div>
    </AdminShell>
  );
}
