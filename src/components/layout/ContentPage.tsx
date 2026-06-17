import type { ReactNode } from "react";

export function ContentPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-primary">{title}</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 font-medium text-primary">{title}</h2>
      {children}
    </section>
  );
}
