"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { COMPANY_BRAND_MARK } from "@/lib/company";
import { HeaderSearch } from "./HeaderSearch";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/kids", label: "Kids" },
  { href: "/new-arrivals", label: "New Arrivals" },
];

export function Header() {
  const { user, openLogin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <MobileMenu />
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-primary transition-colors hover:text-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-xl tracking-[0.25em] text-primary"
        >
          {COMPANY_BRAND_MARK}
        </Link>

        <div className="flex items-center gap-4">
          <HeaderSearch />
          <Link
            href="/search"
            className="text-sm text-primary transition-colors hover:text-muted sm:hidden"
            aria-label="Search"
          >
            Search
          </Link>
          {user ? (
            <>
              <Link
                href="/account"
                className="text-sm text-primary transition-colors hover:text-muted"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden text-sm text-muted hover:text-primary sm:block"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="text-sm text-primary transition-colors hover:text-muted"
            >
              Login
            </button>
          )}
          <Link
            href="/cart"
            className="text-sm text-primary transition-colors hover:text-muted"
          >
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}
