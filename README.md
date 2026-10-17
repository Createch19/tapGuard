# tapGuard (TrustTap)

> Smart NFC & QR Customer Review Gate & Engagement SaaS Platform for Physical Businesses.

---

## 🌟 Overview

**tapGuard** empowers venues (restaurants, salons, retail stores, hotels, fitness centers, clinics, and sports clubs) with programmable, multi-template review gates connected to physical NFC cards and table stands.

- **Compliant "Venting" Strategy:** Protects Google Review scores by filtering 4–5★ positive feedback to Google, while providing an empathetic private "Venting Box" for 1–3★ complaints that alerts managers instantly.
- **4 Dynamic Gate Templates:**
  1. **Google Review Smart Gate:** 5★ rating with compliant private venting & Google review button.
  2. **Social Media Hub:** High-converting Instagram, Facebook, and YouTube follow channels.
  3. **Food Delivery & Dining Hub:** Direct Swiggy/Zomato ordering, takeaway discount offers, and one-tap telephone calls.
  4. **Custom URL Redirection:** Digital menu/catalog display or instant 307 forward.
- **Multi-Tenant Architecture:**
  - **Super Admin Portal (`/admin`):** Fleet inventory, hardware batch printing (`TAP-805`), business classifications, tenant onboarding, and user management.
  - **Tenant Dashboard (`/dashboard`):** Real-time tap analytics, smartphone simulator customizer, card assignment, and private feedback inbox.
  - **Self-Serve Card Claiming (`/claim`):** Venues bind pre-printed cards to tables/counters in seconds.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router & Turbopack)
- **Language:** TypeScript 5
- **Database & ORM:** PostgreSQL + Prisma ORM 7 (`@prisma/adapter-pg`)
- **Authentication:** NextAuth.js (Auth.js v5) with bcrypt salted hashing
- **Styling:** Tailwind CSS + Radix UI + Lucide Icons

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Createch19/tapGuard.git
cd tapGuard
npm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tapguard?sslmode=disable"
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Demo Data

```bash
# Push schema to database
npx prisma db push

# Seed initial business categories, plan tiers, and demo accounts
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🔑 Default Credentials

| Portal | URL | Email | Password | Role |
|---|---|---|---|---|
| **Super Admin** | `/admin` | `admin@tapgate.io` | `Admin@123456` | Platform Super Admin |

> **Note:** Demo/test accounts have been removed. Use the Super Admin portal (`/admin`) to register tenants, generate card batches, and configure plans.

---

## ☁️ Deployment

### Deploy to Vercel (Recommended 100% Free)

1. Create a free serverless PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Push your schema using `DATABASE_URL="..." npx prisma db push` and `DATABASE_URL="..." npm run seed`.
3. Import this repository into [Vercel](https://vercel.com).
4. Add the environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `AUTH_TRUST_HOST=true`
5. Deploy!
