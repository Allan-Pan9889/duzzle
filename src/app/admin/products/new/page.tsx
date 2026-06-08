"use client";

import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm, ProductFormValues } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreate(values: ProductFormValues) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create");
    router.push("/admin/products");
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-2xl text-primary">Add Product</h1>
      <div className="mt-6">
        <ProductForm onSubmit={handleCreate} submitLabel="Create Product" />
      </div>
    </AdminShell>
  );
}
