import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { COMPANY_BRAND } from "@/lib/company";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: `${COMPANY_BRAND} — Fashion for Every Style`,
  description:
    "Premium men's and women's fashion. Shop the latest trends at fair prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-primary antialiased">
        <AuthProvider>
          <ConditionalShell>{children}</ConditionalShell>
        </AuthProvider>
      </body>
    </html>
  );
}
