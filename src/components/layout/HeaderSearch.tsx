"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <form onSubmit={onSubmit} className="hidden items-center sm:flex">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        aria-label="Search products"
        className="w-36 border border-gray-200 px-3 py-1.5 text-sm text-primary outline-none transition-colors focus:border-primary lg:w-48"
      />
    </form>
  );
}
