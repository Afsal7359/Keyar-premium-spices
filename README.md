# Keyaar Premium Spices — Luxury eCommerce Platform

A luxury e-commerce web platform for **Keyaar Premium Spices** — featuring hand-graded, single-origin whole spices (Cardamom, Tellicherry Black Pepper, Zanzibar Cloves, and Nutmeg Flower Mace) sourced from the Western Ghats of Kerala.

---

## 🌟 Key Features

- **Brand & Visuals**: Rich, dark luxury aesthetics (deep emerald `#09150e`, golden bronze `#d4af37`, ivory `#f3ecd9`) with official Keyaar Premium Spices branding.
- **Dynamic Catalog**: Filter by spice category, live keyword search, dynamic sorting, and wishlist curation.
- **Calibrated Pack Sizes**: Individual pack sizes (50g, 100g, 250g, 500g, 1kg) with dynamic price calculation and stock status.
- **Cart & Coupon Engine**: Interactive slide-over drawer + dedicated cart page with real-time free shipping threshold tracker and coupon validation (`KEYAAR10`, `PREMIUM200`, `FIRSTSPICE`).
- **Payment Gateway**: Modular payment flow supporting demo/sandbox checkout, official Razorpay SDK, and external third-party backend API proxying (`PAYMENT_BACKEND_URL`).
- **Milestone Order Tracker**: Real-time 5-stage consignment timeline (`Placed` → `Hand-Grading` → `Nitrogen Sealed` → `In Transit` → `Delivered`) via Order ID (e.g. `KYR-2026-1042`).
- **Merchant Control Portal (`/admin`)**: Real-time management of products, custom pricing tiers, coupons, and customer orders.
- **Dual Storage Engine**: Powered by **Supabase** for cloud database operations with automatic fallback to persistent browser storage.

---

## 🗄️ Supabase Setup (Database For All)

To connect Supabase as your primary database:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Open [`supabase/schema.sql`](supabase/schema.sql), copy the entire SQL script, and click **Run**.
   - This creates the `products`, `orders`, `coupons`, and `reviews` tables.
   - It sets up Row Level Security (RLS) policies.
   - It seeds the catalog with initial reserve spices and coupons.
4. Go to **Project Settings** → **API** and copy:
   - `Project URL`
   - `anon public` key
5. Add them to your `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Restart your dev server. The admin dashboard and storefront will automatically detect Supabase and switch to live cloud database mode!

---

## 💳 Payment Gateway Configuration

The checkout flow is designed to be completely modular:

- **Demo / Sandbox Mode (Default)**:
  An interactive simulated payment dialog ("Keyaar Secure Payment Gateway") allows full testing of UPI, Cards, Netbanking, and COD without requiring active gateway credentials.
- **Live Razorpay Gateway**:
  Set your key in `.env.local`:
  ```bash
  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_here
  ```
- **External 3rd-Party / Backend Payment API**:
  If you have an external backend service or custom payment gateway link:
  Set `PAYMENT_BACKEND_URL` in `.env.local`:
  ```bash
  PAYMENT_BACKEND_URL=https://your-backend-api.com/api/payment
  ```
  The Next.js API route (`/api/payment`) automatically forwards order creation and verification payloads to your external backend.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run ESLint validation
npm run lint

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified by Next.js) in your browser.

---

## 📁 Project Structure

```
├── app/
│   ├── admin/             # Merchant control portal & order management
│   ├── api/payment/       # Payment order & verification endpoint
│   ├── cart/              # Full dedicated cart page
│   ├── checkout/          # Shipping details & payment selection
│   ├── order-success/     # Order invoice, printable receipt, & confetti
│   ├── products/[slug]/   # High-resolution spice details & terroir specs
│   ├── shop/              # Catalog with category filters & search
│   ├── track-order/       # 5-stage consignment milestone tracker
│   ├── globals.css        # Core luxury design system tokens
│   ├── layout.tsx         # Root layout with metadata & cart provider
│   └── page.tsx           # Hero, Sensory Showcase, & Craft landing page
├── components/
│   ├── CartDrawer.tsx     # Slide-over cart with live shipping progress
│   ├── Footer.tsx         # Official Keyaar branding & concierge details
│   ├── Navbar.tsx         # Sticky luxury navigation with Keyaar emblem
│   ├── ProductCard.tsx    # Interactive product card with pack selector
│   ├── RazorpayModal.tsx  # Modular secure checkout payment dialog
│   ├── SensoryMarquee.tsx # Botanical terroir marquee ticker
│   └── SensoryShowcase.tsx# Interactive aroma & terroir comparison
├── context/
│   └── CartContext.tsx    # Client cart, coupons, and wishlist state
├── lib/
│   ├── db.ts              # Unified DB layer (Supabase + local fallback)
│   ├── mock-data.ts       # Seed reserve products, coupons, and orders
│   ├── payment.ts         # Payment order creation & SDK loader
│   └── supabase.ts        # Supabase client initializer
├── public/
│   ├── images/logo.png    # Official transparent Keyaar logo
│   └── favicon.png        # Keyaar brand mark icon
└── supabase/
    └── schema.sql         # Complete PostgreSQL DDL & seed script
```

---

© 2026 Keyaar Premium Spices. All Rights Reserved.
