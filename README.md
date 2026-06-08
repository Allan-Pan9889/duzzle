# Duzzle — Indian Fashion E-commerce

Premium men's and women's fashion e-commerce built with Next.js, Prisma, and PostgreSQL.

## Features

- Responsive storefront (Women / Men / New Arrivals)
- Phone OTP login (MSG91 ready for production)
- Shopping cart & checkout
- Cash on Delivery (COD) + Razorpay online payments
- Order tracking & wishlist
- Admin panel (products, orders, shipping settings)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Local PostgreSQL (macOS Homebrew):**

```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/duzzle"
```

Create the database:

```bash
createdb duzzle
```

### 3. Set up database

```bash
npm run db:push
npm run db:seed
npm run seed:urbanic
```

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Credentials

| Role | Credentials |
|------|-------------|
| **Customer OTP** | Any valid 10-digit Indian mobile; use OTP `123456` in development |
| **Admin** | `admin@duzzle.com` / `admin123` → [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for user & admin session tokens |
| `RAZORPAY_KEY_ID` | Razorpay API key (server) |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (checkout UI) |
| `ADMIN_EMAIL` | Admin account email (seed) |
| `ADMIN_PASSWORD` | Admin account password (seed) |
| `NEXT_PUBLIC_APP_URL` | App URL for redirects |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed admin & site settings |
| `npm run seed:urbanic` | Import demo products |

## Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Use [Neon](https://neon.tech) or similar for production PostgreSQL
5. After deploy, run migrations:

```bash
npx prisma db push
npx prisma db seed
```

6. Add Razorpay **live** keys when going to production

## Contact

- Email: duzzlecode2026@gmail.com
- Phone: +91 8680014906

## License

Private — Duzzle © 2026
