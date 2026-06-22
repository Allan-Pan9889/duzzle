export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-primary">Contact Us</h1>
      <p className="mt-4 text-sm text-muted">
        We&apos;re here to help with orders, returns, and any questions about Duzzlecode.
      </p>

      <div className="mt-10 space-y-6">
        <div className="border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-primary">Email</h2>
          <a
            href="mailto:duzzlecode2026@gmail.com"
            className="mt-2 block text-sm text-muted hover:text-primary"
          >
            duzzlecode2026@gmail.com
          </a>
        </div>

        <div className="border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-primary">Phone</h2>
          <a
            href="tel:+918680014906"
            className="mt-2 block text-sm text-muted hover:text-primary"
          >
            +91 8680014906
          </a>
          <p className="mt-2 text-xs text-muted">Mon–Sat, 10:00 AM – 6:00 PM IST</p>
        </div>

        <div className="border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-primary">Send a Message</h2>
          <p className="mt-2 text-sm text-muted">
            Email us directly and we&apos;ll respond within 24 hours.
          </p>
          <a
            href="mailto:duzzlecode2026@gmail.com?subject=Duzzlecode%20Inquiry"
            className="mt-4 inline-block border border-primary px-6 py-3 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Email Duzzlecode
          </a>
        </div>
      </div>
    </div>
  );
}
