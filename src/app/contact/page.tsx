import {
  COMPANY_ADDRESS,
  COMPANY_BRAND,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE,
  COMPANY_PHONE_TEL,
} from "@/lib/company";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-primary">Contact Us</h1>
      <p className="mt-4 text-sm text-muted">
        We&apos;re here to help with orders, returns, and any questions about {COMPANY_BRAND}.
      </p>

      <div className="mt-10 space-y-6">
        <div className="border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-primary">Email</h2>
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            className="mt-2 block text-sm text-muted hover:text-primary"
          >
            {COMPANY_EMAIL}
          </a>
        </div>

        <div className="border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-primary">Phone</h2>
          <a
            href={`tel:${COMPANY_PHONE_TEL}`}
            className="mt-2 block text-sm text-muted hover:text-primary"
          >
            {COMPANY_PHONE}
          </a>
          <p className="mt-2 text-xs text-muted">Mon–Sat, 10:00 AM – 6:00 PM IST</p>
        </div>

        <div className="border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-primary">Address</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted">{COMPANY_ADDRESS}</p>
          <p className="mt-2 text-sm text-muted">{COMPANY_LEGAL_NAME}</p>
        </div>

        <div className="border border-gray-100 p-6">
          <h2 className="text-sm font-medium text-primary">Send a Message</h2>
          <p className="mt-2 text-sm text-muted">
            Email us directly and we&apos;ll respond within 24 hours.
          </p>
          <a
            href={`mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(`${COMPANY_BRAND} Inquiry`)}`}
            className="mt-4 inline-block border border-primary px-6 py-3 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Email {COMPANY_BRAND}
          </a>
        </div>
      </div>
    </div>
  );
}
