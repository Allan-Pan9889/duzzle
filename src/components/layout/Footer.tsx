import Link from "next/link";
import {
  COMPANY_ADDRESS,
  COMPANY_BRAND,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE,
  COMPANY_PHONE_TEL,
} from "@/lib/company";

const shopLinks = [
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/kids", label: "Kids" },
  { href: "/new-arrivals", label: "New Arrivals" },
];

const helpLinks = [
  { href: "/about", label: "About Us" },
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/return-policy", label: "Return & Refund Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-4 font-serif text-lg tracking-wide">Shop</h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg tracking-wide">Help</h3>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg tracking-wide">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="transition-colors hover:text-white"
                >
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${COMPANY_PHONE_TEL}`}
                  className="transition-colors hover:text-white"
                >
                  {COMPANY_PHONE}
                </a>
              </li>
              <li className="whitespace-pre-line">{COMPANY_ADDRESS}</li>
              <li>{COMPANY_LEGAL_NAME}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {COMPANY_BRAND}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
