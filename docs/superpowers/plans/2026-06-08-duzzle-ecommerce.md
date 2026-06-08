# Duzzle 印度服装电商 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack responsive Indian fashion e-commerce site for Duzzle with Razorpay + COD, phone OTP auth, admin panel, and Urbanic demo seed data.

**Architecture:** Next.js 14 App Router monolith with API routes, Prisma + PostgreSQL for data, JWT session cookies for auth, separate admin auth. Frontend uses Tailwind with Urbanic-inspired layout and Duzzle black/white luxury palette.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Prisma, PostgreSQL (Neon), Razorpay, bcrypt, jose (JWT)

**Spec:** `docs/superpowers/specs/2026-06-08-duzzle-ecommerce-design.md`

---

## File Structure Overview

```
duzzle/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── duzzle.png
│   └── demo/products/          # seeded images
├── scripts/
│   └── seed-urbanic.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # homepage
│   │   ├── globals.css
│   │   ├── women/page.tsx
│   │   ├── men/page.tsx
│   │   ├── new-arrivals/page.tsx
│   │   ├── search/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── account/
│   │   │   ├── page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── addresses/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   ├── shipping-policy/page.tsx
│   │   ├── return-policy/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/edit/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/send-otp/route.ts
│   │       ├── auth/verify-otp/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── auth/me/route.ts
│   │       ├── products/route.ts
│   │       ├── products/[slug]/route.ts
│   │       ├── cart/route.ts
│   │       ├── cart/[itemId]/route.ts
│   │       ├── addresses/route.ts
│   │       ├── addresses/[id]/route.ts
│   │       ├── wishlist/route.ts
│   │       ├── orders/route.ts
│   │       ├── orders/[id]/route.ts
│   │       ├── payments/razorpay/create/route.ts
│   │       ├── payments/razorpay/verify/route.ts
│   │       ├── admin/auth/login/route.ts
│   │       ├── admin/products/route.ts
│   │       ├── admin/products/[id]/route.ts
│   │       ├── admin/orders/route.ts
│   │       ├── admin/orders/[id]/route.ts
│   │       └── admin/settings/route.ts
│   ├── components/
│   │   ├── layout/Header.tsx
│   │   ├── layout/Footer.tsx
│   │   ├── layout/MobileMenu.tsx
│   │   ├── home/HeroBanner.tsx
│   │   ├── home/CategoryGrid.tsx
│   │   ├── home/ProductRow.tsx
│   │   ├── product/ProductCard.tsx
│   │   ├── product/ProductGrid.tsx
│   │   ├── product/ProductGallery.tsx
│   │   ├── product/SizeColorPicker.tsx
│   │   ├── cart/CartItem.tsx
│   │   ├── cart/CartSummary.tsx
│   │   ├── checkout/AddressForm.tsx
│   │   ├── checkout/PaymentSelector.tsx
│   │   ├── auth/OtpLoginModal.tsx
│   │   └── ui/Button.tsx, Input.tsx, Badge.tsx, Modal.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── admin-auth.ts
│   │   ├── razorpay.ts
│   │   ├── shipping.ts
│   │   ├── otp.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Sprint 1: Foundation + Catalog (Days 1–4)

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `.env.example`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/a1/Desktop/duzzle
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

When prompted about existing files (duzzle.png), allow merge/keep existing.

- [ ] **Step 2: Install dependencies**

```bash
npm install @prisma/client bcryptjs jose razorpay zod
npm install -D prisma @types/bcryptjs tsx
```

- [ ] **Step 3: Configure Tailwind theme**

`tailwind.config.ts` — extend colors and fonts:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0A0A0A",
        surface: "#F5F5F5",
        accent: "#C9A96E",
        muted: "#6B6B6B",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Set up global styles and fonts**

`src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-white text-primary font-sans antialiased;
  }
}
```

`src/app/layout.tsx` — load Inter + Playfair Display via `next/font/google`, set metadata:

```typescript
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Duzzle — Fashion for Every Style",
  description: "Premium men's and women's fashion. Shop the latest trends at fair prices.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create `.env.example`**

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/duzzle"
JWT_SECRET="change-me-in-production"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
ADMIN_EMAIL="admin@duzzle.com"
ADMIN_PASSWORD="change-me"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: App loads at http://localhost:3000 without errors.

---

### Task 2: Database Schema

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Write Prisma schema**

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Category {
  WOMEN
  MEN
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  SHIPPED
  DELIVERED
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  RAZORPAY
  COD
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model User {
  id        String    @id @default(cuid())
  phone     String    @unique
  name      String?
  createdAt DateTime  @default(now())
  addresses Address[]
  cartItems CartItem[]
  orders    Order[]
  wishlist  WishlistItem[]
}

model OtpSession {
  id        String   @id @default(cuid())
  phone     String
  code      String
  expiresAt DateTime
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([phone])
}

model Product {
  id             String           @id @default(cuid())
  name           String
  slug           String           @unique
  description    String           @default("")
  price          Int
  compareAtPrice Int?
  category       Category
  images         String[]
  isDemo         Boolean          @default(false)
  isActive       Boolean          @default(true)
  createdAt      DateTime         @default(now())
  variants       ProductVariant[]
  wishlist       WishlistItem[]
}

model ProductVariant {
  id        String      @id @default(cuid())
  productId String
  product   Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  size      String
  color     String
  colorHex  String      @default("#000000")
  sku       String      @unique
  stock     Int         @default(10)
  cartItems CartItem[]
  orderItems OrderItem[]

  @@unique([productId, size, color])
}

model CartItem {
  id        String         @id @default(cuid())
  userId    String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  quantity  Int            @default(1)
  createdAt DateTime       @default(now())

  @@unique([userId, variantId])
}

model Address {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName  String
  phone     String
  line1     String
  line2     String?
  city      String
  state     String
  pinCode   String
  isDefault Boolean @default(false)
}

model Order {
  id                String        @id @default(cuid())
  orderNumber       String        @unique
  userId            String
  user              User          @relation(fields: [userId], references: [id])
  status            OrderStatus   @default(PENDING_PAYMENT)
  paymentMethod     PaymentMethod
  paymentStatus     PaymentStatus @default(PENDING)
  subtotal          Int
  shippingFee       Int
  total             Int
  addressSnapshot   Json
  razorpayOrderId   String?
  razorpayPaymentId String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  items             OrderItem[]
}

model OrderItem {
  id          String         @id @default(cuid())
  orderId     String
  order       Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId   String
  variant     ProductVariant @relation(fields: [variantId], references: [id])
  productName String
  size        String
  color       String
  price       Int
  quantity    Int
}

model WishlistItem {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model SiteSettings {
  id                    String @id @default("default")
  freeShippingThreshold Int    @default(999)
  baseShippingFee       Int    @default(79)
}

model Admin {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
}
```

- [ ] **Step 2: Create Prisma client singleton**

`src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Expected: Migration succeeds, `SiteSettings` and `Admin` seed-ready.

- [ ] **Step 4: Seed site settings and admin**

`prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", freeShippingThreshold: 999, baseShippingFee: 79 },
  });

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@duzzle.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@duzzle.com",
      passwordHash,
    },
  });
}

main().finally(() => prisma.$disconnect());
```

Add to `package.json`:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

```bash
npx prisma db seed
```

---

### Task 3: Urbanic Demo Seed Script

**Files:**
- Create: `scripts/seed-urbanic.ts`
- Create: `public/demo/products/.gitkeep`

- [ ] **Step 1: Write seed script**

`scripts/seed-urbanic.ts` — fetches Urbanic category pages, parses product JSON from `__NEXT_DATA__` or API responses, downloads images, inserts into DB with `isDemo: true`. Use rate limiting (500ms between requests).

Key logic:
- Target URLs: `https://in.urbanic.com/women`, `https://in.urbanic.com/men`
- Map to `Category.WOMEN` / `Category.MEN`
- Generate slug from name: `name.toLowerCase().replace(/[^a-z0-9]+/g, "-")`
- Default variants: sizes `["S","M","L","XL"]`, colors `[{name:"Black",hex:"#000"},{name:"White",hex:"#FFF"}]`
- Limit: 20 products per category for demo
- Price: parse from Urbanic data or default `999`

- [ ] **Step 2: Add npm script**

`package.json`:

```json
"scripts": {
  "seed:urbanic": "tsx scripts/seed-urbanic.ts"
}
```

- [ ] **Step 3: Run seed**

```bash
npm run seed:urbanic
```

Expected: 40 demo products in DB, images in `public/demo/products/`.

---

### Task 4: Layout Components (Header + Footer)

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/MobileMenu.tsx`
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Build Header**

White background, sticky top, border-b border-gray-100:
- Center: `<Image src="/duzzle.png" />` linked to `/` (use inverted logo variant: white text version for dark bg banners only)
- Nav links: Women, Men, New Arrivals
- Right icons: Search, Account, Cart (with item count badge)

- [ ] **Step 2: Build Footer**

Black background (`bg-primary`), white text:
- Columns: Shop (Women, Men, New Arrivals), Help (Shipping, Returns, Privacy, Contact), Contact (email + phone)
- Bottom: `© 2026 Duzzle. All rights reserved.`

- [ ] **Step 3: Build MobileMenu**

Hamburger toggle, slide-in drawer with same nav links.

---

### Task 5: Homepage

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/home/HeroBanner.tsx`
- Create: `src/components/home/CategoryGrid.tsx`
- Create: `src/components/home/ProductRow.tsx`
- Create: `src/components/product/ProductCard.tsx`

- [ ] **Step 1: HeroBanner** — 3-slide carousel, B&W fashion images (use demo product images), serif headline overlay.

- [ ] **Step 2: CategoryGrid** — Two large cards: Women / Men, linking to `/women` and `/men`.

- [ ] **Step 3: ProductRow** — "New Arrivals" horizontal scroll / grid, fetch latest 8 products from Prisma.

- [ ] **Step 4: ProductCard** — Image, name, price `₹{price}`, compare-at strikethrough if present, wishlist heart icon.

---

### Task 6: Product Listing Pages

**Files:**
- Create: `src/app/women/page.tsx`
- Create: `src/app/men/page.tsx`
- Create: `src/app/new-arrivals/page.tsx`
- Create: `src/app/search/page.tsx`
- Create: `src/components/product/ProductGrid.tsx`
- Create: `src/app/api/products/route.ts`

- [ ] **Step 1: API route** — `GET /api/products?category=WOMEN&search=dress&page=1&limit=20`

- [ ] **Step 2: Category pages** — Server component fetching products, `ProductGrid` with filter sidebar (price range, size — client component).

- [ ] **Step 3: Search page** — `?q=` query param, reads from same API.

---

### Task 7: Product Detail Page

**Files:**
- Create: `src/app/product/[slug]/page.tsx`
- Create: `src/app/api/products/[slug]/route.ts`
- Create: `src/components/product/ProductGallery.tsx`
- Create: `src/components/product/SizeColorPicker.tsx`

- [ ] **Step 1: API** — Return product with variants, filter in-stock sizes.

- [ ] **Step 2: Gallery** — Main image + thumbnail strip.

- [ ] **Step 3: SizeColorPicker** — Toggle buttons, disabled when stock=0.

- [ ] **Step 4: Actions** — "Add to Cart" and "Buy Now" buttons (wire up in Sprint 2).

---

## Sprint 2: Auth + Cart (Days 5–7)

### Task 8: Phone OTP Auth

**Files:**
- Create: `src/lib/otp.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/send-otp/route.ts`
- Create: `src/app/api/auth/verify-otp/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/components/auth/OtpLoginModal.tsx`

- [ ] **Step 1: OTP lib**

`src/lib/otp.ts`:

```typescript
const DEV_OTP = "123456";

export function generateOtp(): string {
  if (process.env.NODE_ENV === "development") return DEV_OTP;
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `+91${digits}`;
}
```

- [ ] **Step 2: JWT auth lib**

`src/lib/auth.ts` — sign/verify JWT with `jose`, set httpOnly cookie `duzzle_token`, `getCurrentUser()` helper.

- [ ] **Step 3: send-otp route**

Validate phone → create `OtpSession` (expires 10 min) → in dev, log OTP to console.

- [ ] **Step 4: verify-otp route**

Check code → upsert User → set JWT cookie.

- [ ] **Step 5: OtpLoginModal**

Two-step UI: enter phone → enter 6-digit code. Show dev hint "Use 123456 in development".

---

### Task 9: Cart

**Files:**
- Create: `src/app/api/cart/route.ts`
- Create: `src/app/api/cart/[itemId]/route.ts`
- Create: `src/app/cart/page.tsx`
- Create: `src/components/cart/CartItem.tsx`
- Create: `src/components/cart/CartSummary.tsx`
- Create: `src/lib/shipping.ts`

- [ ] **Step 1: Shipping calc**

`src/lib/shipping.ts`:

```typescript
export function calcShipping(subtotal: number, threshold: number, baseFee: number): number {
  return subtotal >= threshold ? 0 : baseFee;
}
```

- [ ] **Step 2: Cart API**

- `GET` — list cart items with product info
- `POST` — add item `{ variantId, quantity }`
- `PATCH /[itemId]` — update quantity
- `DELETE /[itemId]` — remove item

- [ ] **Step 3: Cart page**

List items, quantity stepper, subtotal, shipping note ("Free shipping on orders over ₹999"), "Proceed to Checkout" button.

- [ ] **Step 4: Wire product detail** — "Add to Cart" calls API, opens login modal if not authenticated.

---

### Task 10: Address Management

**Files:**
- Create: `src/app/api/addresses/route.ts`
- Create: `src/app/api/addresses/[id]/route.ts`
- Create: `src/app/account/addresses/page.tsx`
- Create: `src/components/checkout/AddressForm.tsx`

- [ ] **Step 1: CRUD API** — create, list, update, delete, set default.

- [ ] **Step 2: Address form fields** — fullName, phone, line1, line2, city, state (dropdown Indian states), pinCode (6 digits).

- [ ] **Step 3: Account addresses page** — list + add/edit inline.

---

## Sprint 3: Checkout + Payments (Days 8–10)

### Task 11: Checkout Flow

**Files:**
- Create: `src/app/checkout/page.tsx`
- Create: `src/components/checkout/PaymentSelector.tsx`
- Create: `src/app/api/orders/route.ts`

- [ ] **Step 1: Checkout page steps**

1. Select / add address
2. Order summary (subtotal, shipping, total)
3. Payment method: Razorpay | COD
4. Place Order button

- [ ] **Step 2: Create order API**

`POST /api/orders`:

```typescript
// body: { addressId, paymentMethod }
// 1. Validate cart not empty
// 2. Load settings for shipping calc
// 3. Create Order + OrderItems from cart
// 4. If COD: status=PENDING_PAYMENT, paymentStatus=PENDING
// 5. If RAZORPAY: create Razorpay order, return orderId + razorpayOrderId
// 6. Clear cart
```

- [ ] **Step 3: Order number format** — `DUZ-{YYYYMMDD}-{4-digit-seq}`

---

### Task 12: Razorpay Integration

**Files:**
- Create: `src/lib/razorpay.ts`
- Create: `src/app/api/payments/razorpay/create/route.ts`
- Create: `src/app/api/payments/razorpay/verify/route.ts`

- [ ] **Step 1: Razorpay lib**

```typescript
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

- [ ] **Step 2: Create route** — amount in paise, currency INR, receipt = orderNumber.

- [ ] **Step 3: Verify route** — validate signature `razorpay_order_id|razorpay_payment_id`, update Order to PAID.

- [ ] **Step 4: Frontend** — load Razorpay checkout script, on success call verify API, redirect to order confirmation.

---

### Task 13: Order Tracking (User)

**Files:**
- Create: `src/app/account/page.tsx`
- Create: `src/app/account/orders/page.tsx`
- Create: `src/app/account/orders/[id]/page.tsx`
- Create: `src/app/api/orders/[id]/route.ts`

- [ ] **Step 1: Account dashboard** — welcome, recent orders, quick links.

- [ ] **Step 2: Orders list** — order number, date, total, status badge.

- [ ] **Step 3: Order detail** — items, address, payment method, status timeline.

---

### Task 14: Wishlist

**Files:**
- Create: `src/app/api/wishlist/route.ts`
- Create: `src/app/account/wishlist/page.tsx`

- [ ] **Step 1: Toggle wishlist API** — POST `{ productId }` add/remove.

- [ ] **Step 2: Wire ProductCard heart icon.**

- [ ] **Step 3: Wishlist page** — grid of saved products.

---

## Sprint 4: Admin + Policies + Deploy (Days 11–13)

### Task 15: Admin Auth + Layout

**Files:**
- Create: `src/lib/admin-auth.ts`
- Create: `src/app/api/admin/auth/login/route.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Admin JWT** — separate cookie `duzzle_admin_token`.

- [ ] **Step 2: Login page** — email + password form.

- [ ] **Step 3: Admin layout** — sidebar: Dashboard, Products, Orders, Settings. No storefront Header/Footer (use `admin/layout.tsx` as nested layout excluding root header).

Modify root `layout.tsx` to conditionally hide Header/Footer for `/admin` routes, or use route group `(storefront)` and `(admin)`.

Recommended: route groups:

```
src/app/(storefront)/layout.tsx   # Header + Footer
src/app/(storefront)/page.tsx
src/app/(admin)/admin/...
```

- [ ] **Step 4: Admin dashboard** — counts: total products, orders today, pending orders.

---

### Task 16: Admin Products CRUD

**Files:**
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`
- Create: `src/app/api/admin/products/route.ts`
- Create: `src/app/api/admin/products/[id]/route.ts`

- [ ] **Step 1: Products table** — name, category, price, stock, status, edit/delete actions.

- [ ] **Step 2: Product form** — name, description, price, compareAtPrice, category, images (file upload to `public/uploads/`), variants (size, color, stock).

- [ ] **Step 3: API CRUD** — admin-auth guarded.

---

### Task 17: Admin Orders

**Files:**
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/orders/[id]/page.tsx`
- Create: `src/app/api/admin/orders/route.ts`
- Create: `src/app/api/admin/orders/[id]/route.ts`

- [ ] **Step 1: Orders table** — filter by status, sort by date.

- [ ] **Step 2: Order detail** — update status dropdown: PAID → SHIPPED → DELIVERED → COMPLETED.

- [ ] **Step 3: PATCH API** — `{ status: "SHIPPED" }`.

---

### Task 18: Admin Settings

**Files:**
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/app/api/admin/settings/route.ts`

- [ ] **Step 1: Settings form** — freeShippingThreshold, baseShippingFee.

- [ ] **Step 2: PATCH API** — update `SiteSettings`.

---

### Task 19: Policy & Contact Pages

**Files:**
- Create: `src/app/shipping-policy/page.tsx`
- Create: `src/app/return-policy/page.tsx`
- Create: `src/app/privacy-policy/page.tsx`
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Static content pages** per spec section 12.

- [ ] **Step 2: Contact page** — email `duzzlecode2026@gmail.com`, phone `+91 8680014906`, simple message form (optional: `mailto:` link only for v1).

---

### Task 20: Deployment

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create Neon PostgreSQL database**, copy connection string to Vercel env.

- [ ] **Step 2: Configure Vercel env vars** — all from `.env.example`.

- [ ] **Step 3: Deploy**

```bash
npx vercel --prod
```

- [ ] **Step 4: Run production migration**

```bash
npx prisma migrate deploy
npx prisma db seed
```

- [ ] **Step 5: Switch Razorpay** to live keys when ready.

- [ ] **Step 6: Write README** — setup, env vars, dev OTP hint, seed command, admin login.

---

## Spec Coverage Checklist

| Spec Requirement | Task |
|-----------------|------|
| 男女装分类 | Task 6 |
| Urbanic 演示数据 | Task 3 |
| 英文 UI | All UI tasks |
| 响应式 | Tailwind responsive classes in Task 4–7 |
| Razorpay + COD | Task 11–12 |
| 手机号 OTP | Task 8 |
| 基础后台 | Task 15–18 |
| 满 ₹999 免运费 | Task 2 (schema), Task 9 (shipping.ts), Task 18 |
| 基础运费 ₹79 | Task 2, Task 18 |
| 开发 OTP 123456 | Task 8 |
| 政策页 + 联系页 | Task 19 |
| Duzzle 视觉 | Task 1 (theme), Task 4–5 |
| 收藏夹 | Task 14 |

---

## Execution Order Summary

1. Task 1 → 2 → 3 (foundation)
2. Task 4 → 5 → 6 → 7 (storefront catalog)
3. Task 8 → 9 → 10 (auth + cart)
4. Task 11 → 12 → 13 → 14 (checkout)
5. Task 15 → 16 → 17 → 18 → 19 → 20 (admin + deploy)
