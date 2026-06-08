"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type User = {
  id: string;
  phone: string;
  name: string | null;
};

export function OtpLoginModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");
      onSuccess(data.user);
      setStep("phone");
      setPhone("");
      setCode("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep("phone");
    setCode("");
    setError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl tracking-wide text-primary">Login</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-primary">Mobile Number</label>
              <div className="flex">
                <span className="flex items-center border border-r-0 border-gray-200 bg-surface px-3 text-sm text-muted">
                  +91
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="8680014906"
                  value={phone}
                  onChange={(e) => {
                    let digits = e.target.value.replace(/\D/g, "");
                    if (digits.startsWith("91") && digits.length > 10) {
                      digits = digits.slice(2);
                    }
                    setPhone(digits.slice(0, 10));
                  }}
                  className="border-l-0"
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-muted">
              Enter the 6-digit code sent to +91{phone.slice(-10)}
            </p>
            {process.env.NODE_ENV === "development" && (
              <p className="rounded bg-surface px-3 py-2 text-xs text-muted">
                Dev mode: use OTP <strong>123456</strong>
              </p>
            )}
            <Input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-sm text-muted hover:text-primary"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
