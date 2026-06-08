"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  const { user, loading, openLogin } = useAuth();

  if (loading) {
    return <div className="px-4 py-16 text-center text-muted">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-primary">Checkout</h1>
        <p className="mt-4 text-muted">Please login to continue</p>
        <Button className="mt-6" onClick={openLogin}>
          Login with OTP
        </Button>
      </div>
    );
  }

  return <CheckoutClient />;
}
