export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-primary">Return &amp; Exchange Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-medium text-primary">Return Window</h2>
          <p>
            You may return unused items in their original packaging within 15 days of delivery.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">Eligible Items</h2>
          <p>
            Items must be unworn, unwashed, and free from damage. Tags must be intact. For
            hygiene reasons, certain categories may not be eligible for return.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">How to Return</h2>
          <p>
            Contact us at{" "}
            <a href="mailto:duzzlecode2026@gmail.com" className="text-primary underline">
              duzzlecode2026@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:+918680014906" className="text-primary underline">
              +91 8680014906
            </a>{" "}
            with your order number. We will arrange a free pickup where available.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">Refunds</h2>
          <p>
            Approved refunds are processed within 5–7 business days to your original payment
            method. COD orders are refunded via bank transfer or store credit.
          </p>
        </section>
      </div>
    </div>
  );
}
