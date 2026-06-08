"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  AddressForm,
  AddressFormData,
} from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";

type Address = AddressFormData & { id: string };

export default function AddressesPage() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const fetchAddresses = useCallback(async () => {
    const res = await fetch("/api/addresses");
    if (!res.ok) return;
    const data = await res.json();
    setAddresses(
      (data.addresses ?? []).map((a: Address & { line2: string | null }) => ({
        ...a,
        line2: a.line2 ?? "",
      })),
    );
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchAddresses().finally(() => setLoading(false));
  }, [user, authLoading, fetchAddresses]);

  async function handleCreate(data: AddressFormData) {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to save");
    setShowForm(false);
    await fetchAddresses();
  }

  async function handleUpdate(data: AddressFormData) {
    if (!editing) return;
    const res = await fetch(`/api/addresses/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to update");
    setEditing(null);
    await fetchAddresses();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    await fetchAddresses();
  }

  if (authLoading || loading) {
    return <div className="px-4 py-16 text-center text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted">Please login to manage addresses</p>
        <Button className="mt-4" onClick={openLogin}>
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/account" className="text-sm text-muted hover:text-primary">
        ← Back to Account
      </Link>
      <h1 className="mt-4 font-serif text-3xl tracking-wide text-primary">
        Saved Addresses
      </h1>

      <div className="mt-8 space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="border border-gray-100 p-4">
            {address.isDefault && (
              <span className="mb-2 inline-block bg-surface px-2 py-0.5 text-xs text-muted">
                Default
              </span>
            )}
            <p className="text-sm font-medium text-primary">{address.fullName}</p>
            <p className="mt-1 text-sm text-muted">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
            </p>
            <p className="text-sm text-muted">
              {address.city}, {address.state} — {address.pinCode}
            </p>
            <p className="text-sm text-muted">{address.phone}</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(address);
                  setShowForm(false);
                }}
                className="text-xs text-primary underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(address.id)}
                className="text-xs text-muted underline hover:text-primary"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showForm && !editing && (
        <Button className="mt-6" onClick={() => setShowForm(true)}>
          Add New Address
        </Button>
      )}

      {(showForm || editing) && (
        <div className="mt-8 border border-gray-100 p-6">
          <h2 className="mb-4 font-serif text-lg text-primary">
            {editing ? "Edit Address" : "New Address"}
          </h2>
          <AddressForm
            initial={
              editing
                ? {
                    ...editing,
                    phone: editing.phone.replace("+91", ""),
                  }
                : { phone: user.phone.replace("+91", "") }
            }
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
