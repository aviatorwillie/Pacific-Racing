# 🐎 PACIFIC RACING & SPORTS BETTING LTD
## Phase 1 MVP — Full Stack Web Application

> **Next.js 14 · Tailwind CSS · Supabase · Vercel**
> A production-quality betting platform with real wallet logic, layered architecture, and investor-ready UI.

---

## 📁 PROJECT STRUCTURE

```
pacific-racing/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # / — Landing page
│   │   ├── about/page.tsx            # /about
│   │   ├── how-it-works/page.tsx     # /how-it-works
│   │   ├── contact/page.tsx          # /contact
│   │   ├── login/page.tsx            # /login
│   │   ├── signup/page.tsx           # /signup
│   │   ├── dashboard/page.tsx        # /dashboard (auth required)
│   │   ├── events/page.tsx           # /events
│   │   ├── event/[id]/page.tsx       # /event/:id — Event detail + BetSlip
│   │   ├── bets/page.tsx             # /bets — Bet history
│   │   ├── wallet/page.tsx           # /wallet — Balance + transactions
│   │   ├── admin/page.tsx            # /admin — Admin panel
│   │   └── api/
│   │       ├── auth/setup/route.ts   # POST — create profile + wallet after signup
│   │       ├── events/route.ts       # GET all events
│   │       ├── events/[id]/route.ts  # GET single event with bet counts
│   │       ├── bets/route.ts         # GET user bets | POST place bet
│   │       ├── wallet/route.ts       # GET balance + transactions
│   │       └── admin/
│   │           ├── events/route.ts   # GET/POST/PATCH events (admin only)
│   │           ├── bets/route.ts     # GET all bets | PATCH settle (admin only)
│   │           ├── users/route.ts    # GET all users (admin only)
│   │           └── wallet/route.ts   # POST credit wallet (admin only)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Top navigation
│   │   │   └── Footer.tsx            # Site footer
│   │   └── ui/
│   │       ├── EventCard.tsx         # Event listing card
│   │       ├── OddsButton.tsx        # Participant selector with odds
│   │       ├── BetSlip.tsx           # Bet placement panel
│   │       ├── WalletCard.tsx        # Balance display card
│   │       └── StatCard.tsx          # KPI stat card
│   └── lib/
│       ├── types/index.ts            # All TypeScript types
│       ├── supabase/
│       │   ├── client.ts             # Browser Supabase client
│       │   ├── server.ts             # Server Supabase client (SSR)
│       │   └── admin.ts              # Service-role client (API routes only)
│       ├── repositories/             # Database layer — NO business logic
│       │   ├── events.repository.ts
│       │   ├── bets.repository.ts
│       │   ├── wallet.repository.ts
│       │   └── users.repository.ts
│       ├── services/                 # Business logic layer
│       │   ├── betting.service.ts    # Core bet placement + settlement
│       │   ├── wallet.service.ts     # Balance management
│       │   ├── events.service.ts     # Event management
│       │   └── auth.service.ts       # Post-signup profile + wallet init
│       └── utils/index.ts            # Shared helpers
├── supabase/
│   └── schema.sql                    # Complete DB schema + RLS + seed data
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚡ QUICKSTART — LOCAL DEVELOPMENT

### Step 1 — Install Dependencies
```bash
npm install
```

### Step 2 — Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `pacific-racing`
3. Choose a strong database password (save it!)
4. Select the region closest to PNG (e.g. **Asia Pacific — Sydney**)
5. Wait ~2 minutes for provisioning

### Step 3 — Run the SQL Schema
1. In your Supabase project → **SQL Editor** → **New Query**
2. Paste the **entire contents** of `supabase/schema.sql`
3. Click **Run** (green button)
4. You should see: `Success. No rows returned.`
5. Verify with: `SELECT COUNT(*) FROM public.events;` → should return `6`

### Step 4 — Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAIL=admin@pacificracing.com.pg
```

**Where to find these values:**
| Variable | Location in Supabase |
|----------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → Project API keys → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Project API keys → `service_role` (⚠️ keep secret!) |

### Step 5 — Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Step 6 — Create Admin Account
1. Go to `/signup`
2. Register with the **exact email** you set as `NEXT_PUBLIC_ADMIN_EMAIL`
3. Navigate to `/admin` — full admin panel unlocked

---

## 🚀 DEPLOY TO VERCEL

### Option A — Vercel Dashboard (recommended)

1. Push this project to a **GitHub** repo
2. Go to [vercel.com/new](https://vercel.com/new) → Import from GitHub
3. Vercel auto-detects Next.js — no build config needed
4. Add **Environment Variables** (same as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` ← set to your Vercel URL, e.g. `https://pacific-racing.vercel.app`
   - `NEXT_PUBLIC_ADMIN_EMAIL`
5. Click **Deploy** → live in ~60 seconds

### Option B — Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts — it auto-detects everything
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_ADMIN_EMAIL
vercel --prod
```

### Update Supabase Auth Redirect URLs
After deploying, add your Vercel domain to Supabase:
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**: `https://YOUR-APP.vercel.app/**`
3. Set **Site URL**: `https://YOUR-APP.vercel.app`

---

## 🗄 DATABASE SCHEMA OVERVIEW

| Table | Purpose |
|-------|---------|
| `profiles` | User roles (user/admin) linked to Supabase auth |
| `wallets` | User balances — NEVER edited directly |
| `events` | Betting events with status management |
| `participants` | Event participants with decimal odds |
| `bets` | User bet records with settlement status |
| `transactions` | Full audit trail of every money movement |

### Critical RPC Functions
| Function | Purpose |
|----------|---------|
| `deduct_wallet_balance(user_id, amount)` | Atomic deduction with overdraft prevention |
| `add_wallet_balance(user_id, amount)` | Atomic credit for payouts/deposits |
| `get_wallet_balance(user_id)` | Returns balance, locked, available |

---

## 🔐 SECURITY MODEL

| Layer | Protection |
|-------|-----------|
| **Supabase RLS** | Users can only read/write their own bets, wallet, transactions |
| **Service-role key** | Only used in API routes — never exposed to browser |
| **API validation** | All business logic validated in service layer before DB call |
| **Admin protection** | Admin routes check `role = 'admin'` via `profiles` table |
| **Wallet RPC** | Atomic DB functions prevent race conditions on balance |

---

## 🧠 ARCHITECTURE — 4 LAYER PATTERN

```
Browser (React)
     ↓  fetch()
API Routes (/app/api/*)        ← validates auth session, calls services
     ↓
Services (/lib/services/*)     ← business logic, validations, orchestration
     ↓
Repositories (/lib/repositories/*)  ← pure DB reads/writes, no logic
     ↓
Supabase PostgreSQL            ← data + RLS + atomic RPC functions
```

This structure means:
- **UI never calls Supabase directly** (except auth state)
- **Services contain all rules** (min bet, balance checks, etc.)
- **Repositories are swappable** (easy to migrate to Prisma/AWS RDS later)
- **API routes are thin** (auth check → call service → return response)

---

## 🧠 UX PSYCHOLOGY FEATURES

| Feature | Implementation |
|---------|---------------|
| **Urgency** | Red flashing countdown when event closes < 60 min |
| **Social proof** | "MOST PICKED" badge + bet distribution bars |
| **FOMO** | Green live dot on live events, "X LIVE" counter in hero |
| **Loss aversion** | "Don't miss out" prompt in empty bet slip |
| **Trust signals** | SSL badge, licensing note, responsible gambling footer |
| **Welcome friction** | K50 free credit shown prominently on signup |
| **Color psychology** | Gold = value, Green = wins, Red = risk/urgency |

---

## 📱 PAGES REFERENCE

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with featured events |
| `/about` | Public | Company story and values |
| `/how-it-works` | Public | Betting guide with odds explainer |
| `/contact` | Public | Contact form |
| `/login` | Public | Email + password auth |
| `/signup` | Public | Registration + K50 welcome credit |
| `/dashboard` | Auth | Balance, recent events, recent bets |
| `/events` | Auth | All events with filters |
| `/event/[id]` | Auth | Odds, bet slip, social proof |
| `/bets` | Auth | Full bet history with filters |
| `/wallet` | Auth | Balance + transaction history |
| `/admin` | Admin | Full platform management |

---

## ⚠️ PHASE 1 LIMITATIONS

This is a production-quality MVP. The following are deferred to Phase 2:

| Feature | Phase |
|---------|-------|
| Payment gateway (BSP, MiCash, Visa) | Phase 2 |
| Automated bet settlement | Phase 2 |
| Email notifications | Phase 2 |
| Mobile app (React Native) | Phase 2 |
| KYC / ID verification | Phase 2 |
| Live odds feed integration | Phase 2 |
| Two-factor authentication | Phase 2 |
| Self-exclusion / deposit limits | Phase 2 |

---

## 📞 PHASE 2 ROADMAP

- [ ] BSP Mobile Banking integration
- [ ] MiCash / Digicel M-Money
- [ ] Visa/Mastercard via Stripe
- [ ] Automated event result settlement
- [ ] Push notifications (FCM)
- [ ] React Native mobile app
- [ ] Real-time odds from external provider
- [ ] KYC with document upload
- [ ] Affiliate / referral system
- [ ] Compliance dashboard (PNG Gaming Control Board)

---

*Pacific Racing & Sports Betting Ltd · Port Moresby, Papua New Guinea*
*Licensed by the PNG Gaming Control Board*
*⚠️ 18+ only. Gamble responsibly.*
