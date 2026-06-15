"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type ProductPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
};

export function ProductPagination({ page, totalPages, total }: ProductPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-4 border-t border-gray-100 pt-8 sm:flex-row sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm text-muted">
        {total} product{total === 1 ? "" : "s"} · Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link
            href={makeHref(page - 1)}
            className="border border-gray-200 px-3 py-2 text-sm text-primary hover:border-primary"
          >
            Previous
          </Link>
        )}
        {pages.map((p) => (
          <Link
            key={p}
            href={makeHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`min-w-[2.5rem] border px-3 py-2 text-center text-sm ${
              p === page
                ? "border-primary bg-primary text-white"
                : "border-gray-200 text-primary hover:border-primary"
            }`}
          >
            {p}
          </Link>
        ))}
        {page < totalPages && (
          <Link
            href={makeHref(page + 1)}
            className="border border-gray-200 px-3 py-2 text-sm text-primary hover:border-primary"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
