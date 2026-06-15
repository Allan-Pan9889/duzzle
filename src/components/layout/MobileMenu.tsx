"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/kids", label: "Kids" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/search", label: "Search" },
  { href: "/account", label: "Account" },
  { href: "/cart", label: "Cart" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm text-primary"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <nav className="absolute left-0 right-0 top-16 border-b border-gray-100 bg-white px-4 py-4 shadow-sm">
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm tracking-wide text-primary"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
