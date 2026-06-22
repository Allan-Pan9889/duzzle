"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(requireAuth);

  useEffect(() => {
    if (!requireAuth) {
      setLoading(false);
      return;
    }
    fetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.admin) {
          router.replace("/admin/login");
        } else {
          setAdmin(data.admin);
        }
      })
      .finally(() => setLoading(false));
  }, [requireAuth, router]);

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>;
  }

  if (requireAuth && !admin) return null;

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="relative flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-5">
          <Link href="/admin" className="font-serif text-lg tracking-[0.2em] text-primary">
            DUZZLECODE
          </Link>
          <p className="mt-1 text-xs text-muted">Admin</p>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 block px-3 py-2 text-sm ${
                  active ? "bg-primary text-white" : "text-primary hover:bg-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 p-4">
          {admin && <p className="mb-2 truncate text-xs text-muted">{admin.email}</p>}
          <button
            type="button"
            onClick={logout}
            className="text-xs text-primary underline"
          >
            Logout
          </button>
          <Link href="/" className="mt-2 block text-xs text-muted hover:text-primary">
            ← View Store
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
