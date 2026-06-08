"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminSettingsPage() {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("999");
  const [baseShippingFee, setBaseShippingFee] = useState("79");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setFreeShippingThreshold(String(data.settings.freeShippingThreshold));
          setBaseShippingFee(String(data.settings.baseShippingFee));
        }
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeShippingThreshold: parseInt(freeShippingThreshold, 10),
          baseShippingFee: parseInt(baseShippingFee, 10),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Settings saved successfully");
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <h1 className="font-serif text-2xl text-primary">Settings</h1>
      <p className="mt-1 text-sm text-muted">Shipping and store configuration</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4">
        <div>
          <label className="mb-2 block text-sm text-primary">
            Free Shipping Threshold (₹)
          </label>
          <Input
            type="number"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-muted">
            Orders above this amount get free shipping
          </p>
        </div>
        <div>
          <label className="mb-2 block text-sm text-primary">Base Shipping Fee (₹)</label>
          <Input
            type="number"
            value={baseShippingFee}
            onChange={(e) => setBaseShippingFee(e.target.value)}
            required
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes("success") ? "text-green-700" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </AdminShell>
  );
}
