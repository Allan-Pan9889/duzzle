"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const { user, loading, openLogin, logout } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-muted">Loading...</div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-primary">My Account</h1>
        <p className="mt-4 text-muted">Login to manage your account</p>
        <Button className="mt-6" onClick={openLogin}>
          Login with OTP
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-serif text-3xl tracking-wide text-primary">My Account</h1>
      <p className="mt-2 text-sm text-muted">{user.phone}</p>

      <nav className="mt-8 space-y-3">
        <Link
          href="/account/orders"
          className="block border border-gray-100 px-4 py-3 text-sm text-primary transition-colors hover:bg-surface"
        >
          My Orders
        </Link>
        <Link
          href="/account/addresses"
          className="block border border-gray-100 px-4 py-3 text-sm text-primary transition-colors hover:bg-surface"
        >
          Saved Addresses
        </Link>
        <Link
          href="/account/wishlist"
          className="block border border-gray-100 px-4 py-3 text-sm text-primary transition-colors hover:bg-surface"
        >
          Wishlist
        </Link>
      </nav>

      <Button variant="outline" className="mt-8" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
