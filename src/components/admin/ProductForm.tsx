"use client";

import { Category } from "@prisma/client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Variant = {
  id: string;
  size: string;
  stock: number;
};

export type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: Category;
  images: string[];
  stock: number;
  isActive: boolean;
  variants?: Variant[];
};

export function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Save Product",
}: {
  initial?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice ? String(initial.compareAtPrice) : "",
  );
  const [category, setCategory] = useState<Category>(initial?.category ?? "WOMEN");
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [stock, setStock] = useState(String(initial?.stock ?? 10));
  const [isActive, setIsActive] = useState(initial?.isActive !== false);
  const [variants, setVariants] = useState<Variant[]>(initial?.variants ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        name,
        description,
        price: parseInt(price, 10),
        compareAtPrice: compareAtPrice ? parseInt(compareAtPrice, 10) : null,
        category,
        images: imagesText.split("\n").map((l) => l.trim()).filter(Boolean),
        stock: parseInt(stock, 10),
        isActive,
        variants,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="mb-2 block text-sm text-primary">Name *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-2 block text-sm text-primary">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-primary">Price (₹) *</label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm text-primary">Compare at Price (₹)</label>
          <Input
            type="number"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-primary">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full border border-gray-200 px-4 py-3 text-sm"
          >
            <option value="WOMEN">Women</option>
            <option value="MEN">Men</option>
            <option value="KIDS">Kids</option>
          </select>
        </div>
        {!variants.length && (
          <div>
            <label className="mb-2 block text-sm text-primary">Default Stock (per variant)</label>
            <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
        )}
      </div>
      <div>
        <label className="mb-2 block text-sm text-primary">Image URLs (one per line)</label>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          placeholder="https://picsum.photos/seed/example/600/800"
          className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active (visible on storefront)
      </label>

      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-primary">Variant Stock</p>
          <div className="max-h-48 overflow-y-auto border border-gray-100">
            {variants.map((v, i) => (
              <div
                key={v.id}
                className="flex items-center justify-between border-b border-gray-50 px-3 py-2 text-sm"
              >
                <span className="text-muted">{v.size}</span>
                <Input
                  type="number"
                  className="w-20 py-1"
                  value={v.stock}
                  onChange={(e) => {
                    const next = [...variants];
                    next[i] = { ...v, stock: parseInt(e.target.value, 10) || 0 };
                    setVariants(next);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
