"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  isDemo: boolean;
};

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, search, category]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-primary">Products</h1>
          <p className="text-sm text-muted">
            {total} product{total === 1 ? "" : "s"}
            {search ? ` matching “${search}”` : ""}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary px-4 py-2 text-center text-sm text-white hover:bg-primary/90"
        >
          Add Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          placeholder="Search by name or slug..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="sm:max-w-md"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="border border-gray-200 bg-white px-4 py-3 text-sm text-primary outline-none focus:border-primary sm:w-40"
        >
          <option value="">All categories</option>
          <option value="WOMEN">Women</option>
          <option value="MEN">Men</option>
          <option value="KIDS">Kids</option>
        </select>
        <button
          type="submit"
          className="border border-primary px-4 py-3 text-sm text-primary hover:bg-primary hover:text-white"
        >
          Search
        </button>
        {(search || category) && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setCategory("");
              setPage(1);
            }}
            className="px-4 py-3 text-sm text-muted hover:text-primary"
          >
            Clear
          </button>
        )}
      </form>

      <div className="mt-6 overflow-x-auto border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-surface text-xs text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary">{p.name}</p>
                    {p.isDemo && <span className="text-xs text-muted">demo</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={p.isActive ? "text-green-700" : "text-muted"}>
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="mr-3 text-primary underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-red-600 underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border border-gray-200 px-4 py-2 text-sm text-primary disabled:opacity-40 hover:border-primary"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border border-gray-200 px-4 py-2 text-sm text-primary disabled:opacity-40 hover:border-primary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
