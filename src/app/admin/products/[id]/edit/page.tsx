"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm, ProductFormValues } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<Partial<ProductFormValues> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const p = data.product;
        if (p) {
          setInitial({
            name: p.name,
            description: p.description,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            category: p.category,
            images: p.images,
            isActive: p.isActive,
            variants: p.variants,
            stock: 0,
          });
        }
      });
  }, [id]);

  async function handleUpdate(values: ProductFormValues) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        variants: values.variants,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    router.push("/admin/products");
  }

  if (!initial) {
    return (
      <AdminShell>
        <p className="text-muted">Loading...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-2xl text-primary">Edit Product</h1>
      <div className="mt-6">
        <ProductForm initial={initial} onSubmit={handleUpdate} />
      </div>
    </AdminShell>
  );
}
