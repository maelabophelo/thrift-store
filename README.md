# THE THRIFT STORE

South African online clothing & shoe store.  
**Currency:** ZAR · **Delivery:** PAXI → PEP collection points only · **No home addresses**

Built with Next.js 15, Tailwind CSS, Prisma, NextAuth, and PayFast-ready payment structure.

---

## Quick Start (Local)

```bash
cd thrift-store

# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env
# Edit .env – set NEXTAUTH_SECRET (random 32+ chars), ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Create database & seed demo data
npx prisma db push
npm run db:seed

# 4. Run development server
npm run dev
```

Open http://localhost:3000

**Admin:** http://localhost:3000/admin/login  
Default credentials come from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## What You Get

### Customer-facing
- Modern mobile-first fashion homepage
- Shop with search, category, sale/new filters & sorting
- Product detail pages (size/colour/qty, stock check, related products)
- Cart with live totals
- **PAXI / PEP collection-point checkout** (no home address)
- Order confirmation page
- Floating WhatsApp button (072 355 1014)
- Legal pages (Privacy, Terms, Returns, Delivery, PAXI)
- SEO (meta, Open Graph, JSON-LD, sitemap, robots.txt)

### Admin (`/admin`)
- Secure login (NextAuth + bcrypt)
- Dashboard (orders overview)
- Product list + **Add Product** form (name, description, images, price, sale price, sizes, colours, stock, SKU, featured/new/sale toggles)
- Settings: **change PAXI delivery fee** without code
- Orders list (extend with status updates as needed)

### Backend
- Prisma + SQLite (local) – switch to PostgreSQL for production
- Server-side price & stock validation on order create
- PayFast redirect + ITN webhook structure (marks PAID only after provider confirmation)
- Order notification formatter (logs + optional WhatsApp/SMS API)
- Environment-based secrets (never expose bank details on frontend)

---

## Important: Before Publishing

1. Log into Admin → delete demo products (or edit them).
2. Add your real products + photos (place images in `public/images/` or use image URLs).
3. Set PAXI fee under Admin → Settings.
4. Configure PayFast (or Ozow / Peach / Yoco) in `.env`.
5. Set a strong `NEXTAUTH_SECRET` and change the admin password.
6. Update `NEXT_PUBLIC_STORE_URL` to your live domain.
7. Test a full order in PayFast sandbox.
8. Connect a notification service (optional) so orders hit 0723551014.

**Your Capitec account details must NEVER appear in frontend code or public repos.**  
Use them only inside your private PayFast merchant profile / bank settlement settings.

---

## Environment Variables

See `.env.example` for the full list.

Critical ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file or Postgres connection string |
| `NEXTAUTH_SECRET` | Random secret for sessions |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin (change after first login) |
| `PAXI_DELIVERY_FEE` | Default delivery fee (also editable in Admin) |
| `PAYFAST_MERCHANT_ID` / `KEY` / `PASSPHRASE` | South African payments |
| `PAYFAST_SANDBOX` | `true` for testing |
| `WHATSAPP_API_URL` / `KEY` | Optional order notifications |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `27723551014` |

---

## Database

Local uses SQLite (`prisma/dev.db`) for zero-config setup.

**Production recommendation:** PostgreSQL (Supabase free tier, Neon, or Railway).

Change in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then:

```bash
npx prisma db push
npm run db:seed
```

---

## Payments (PayFast)

1. Register at [payfast.co.za](https://www.payfast.co.za).
2. Get Merchant ID + Key (+ Passphrase for signature).
3. Put them in `.env`.
4. Set `notify_url` (already wired to `/api/payments/payfast/notify`).
5. In production, implement the **signature check** in the notify route (see PayFast docs).
6. Order status becomes `PAYMENT_RECEIVED` only after a valid ITN.

Alternative gateways (Ozow, Peach, Yoco) follow the same pattern: create order server-side → redirect to gateway → webhook verifies payment.

---

## Order Notifications

Every successful payment triggers `sendOrderNotification()`.

- By default the message is **logged** on the server (visible in Vercel/host logs).
- To send WhatsApp/SMS to **0723551014**, set `WHATSAPP_API_URL` + `WHATSAPP_API_KEY` to your provider (Twilio, Africa’s Talking, Make.com webhook, etc.).

Message format matches the example in the brief.

---

## Deployment (cheap & recommended)

### Option A – Vercel + Supabase (recommended)

1. Push the repo to GitHub.
2. Create a free [Supabase](https://supabase.com) project → copy the Postgres connection string into `DATABASE_URL`.
3. Change Prisma provider to `postgresql`.
4. Deploy on [Vercel](https://vercel.com) – import the repo, add all env vars.
5. Run `npx prisma db push` and seed once (Vercel build or local against production DB).
6. Set `NEXT_PUBLIC_STORE_URL` to your Vercel domain (or custom domain).

### Option B – Railway / Render

Similar: connect repo, set env vars, use their Postgres addon.

---

## Folder Structure (key parts)

```
thrift-store/
├── prisma/
│   ├── schema.prisma      # Full data model
│   └── seed.ts            # Demo products + admin + legal pages
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Homepage
│   │   ├── shop/                    # Catalogue + filters
│   │   ├── product/[slug]/          # Product detail
│   │   ├── cart/
│   │   ├── checkout/                # PAXI / PEP checkout
│   │   ├── order/[orderNumber]/     # Confirmation
│   │   ├── admin/                   # Secure dashboard
│   │   ├── api/                     # Orders, payments, admin
│   │   ├── pages/[slug]/            # Legal content
│   │   └── contact/ about/
│   ├── components/                  # Header, Footer, ProductCard, etc.
│   └── lib/                         # prisma, auth, cart, settings, notifications
├── public/
├── .env.example
└── README.md
```

---

## Testing Checklist

- [ ] `npm run dev` loads homepage
- [ ] Admin login works
- [ ] Add / edit / list products
- [ ] Change PAXI fee in Settings
- [ ] Add to cart → quantity → remove
- [ ] Checkout with valid SA phone + PEP details
- [ ] Invalid phone rejected
- [ ] Out-of-stock blocked
- [ ] Order appears in admin
- [ ] PayFast sandbox (if keys set) redirects
- [ ] ITN marks order PAID (test with PayFast tools)
- [ ] Mobile layout usable
- [ ] WhatsApp button opens chat

---

## Extending

- **Product edit / delete:** Add `/admin/products/[id]` pages mirroring the create form + DELETE API.
- **Order status updates:** Admin order detail with status dropdown (statuses already defined in `lib/utils.ts`).
- **Image upload:** Integrate Cloudinary or S3; store public URLs in the product `images` JSON field.
- **Customer accounts / wishlist:** Schema already has `Customer` + `WishlistItem` – wire NextAuth credentials for customers if needed.
- **PayFast signature:** Required for production security – follow official docs.

---

## Support contact on store

WhatsApp: **072 355 1014**

Built for South African customers only. Checkout revolves around PAXI → PEP collection points.
