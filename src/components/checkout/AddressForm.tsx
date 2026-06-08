"use client";

import { FormEvent, useState } from "react";
import { INDIAN_STATES } from "@/lib/indian-states";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type AddressFormData = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
};

const emptyForm: AddressFormData = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pinCode: "",
  isDefault: false,
};

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Address",
}: {
  initial?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<AddressFormData>({ ...emptyForm, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-primary">Full Name *</label>
          <Input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-primary">Phone *</label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-primary">Address Line 1 *</label>
        <Input value={form.line1} onChange={(e) => update("line1", e.target.value)} required />
      </div>

      <div>
        <label className="mb-2 block text-sm text-primary">Address Line 2</label>
        <Input value={form.line2} onChange={(e) => update("line2", e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-primary">City *</label>
          <Input value={form.city} onChange={(e) => update("city", e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm text-primary">State *</label>
          <select
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            required
            className="w-full border border-gray-200 px-4 py-3 text-sm text-primary outline-none focus:border-primary"
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-primary">Pin Code *</label>
        <Input
          value={form.pinCode}
          onChange={(e) => update("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => update("isDefault", e.target.checked)}
        />
        Set as default address
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
