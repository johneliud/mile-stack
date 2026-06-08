# MileStack Frontend

Next.js 16 frontend for [MileStack](../README.md) - a Soroban-powered milestone-based XLM escrow platform connecting developers in the Global South with global employers on Stellar.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)

---

## Tech Stack

| Technology               | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| Next.js 16 (App Router)  | Framework                                           |
| TypeScript               | Language                                            |
| Tailwind CSS v4          | Styling                                             |
| Plus Jakarta Sans        | Body typography                                     |
| Sora                     | Heading typography (h1/h2/h3, weights 600–800)      |
| Lucide React             | Icons                                               |
| `@stellar/stellar-sdk`   | Soroban contract interaction                        |
| `@stellar/freighter-api` | Freighter wallet connection                         |
| `@supabase/supabase-js`  | Off-chain marketplace data (listings, applications) |
| Prettier                 | Code formatting                                     |

---

## Project Structure

```text
mile-stack-frontend/
├── app/
│   ├── client/
│   │   ├── page.tsx                            # Client Dashboard - listings + escrow projects
│   │   ├── listings/
│   │   │   ├── new/
│   │   │   │   └── page.tsx                    # Post a new project listing
│   │   │   └── [id]/
│   │   │       └── applications/
│   │   │           └── page.tsx                # Review freelancer applications (address links to profile)
│   │   └── projects/
│   │       ├── new/
│   │       │   └── page.tsx                    # Direct project creation; accepts ?freelancer= query param
│   │       └── [id]/
│   │           ├── page.tsx                    # Server Component - resolves dynamic params
│   │           └── ProjectManage.tsx           # Client Component - fund / approve / dispute
│   ├── freelancer/
│   │   ├── page.tsx                            # Freelancer Dashboard - active projects
│   │   ├── profile/
│   │   │   └── page.tsx                        # Freelancer profile editor (name, bio, skills, links)
│   │   └── projects/[id]/
│   │       ├── page.tsx                        # Server Component - resolves dynamic params
│   │       └── ProjectDetail.tsx               # Client Component - milestones + mark complete + dispute
│   ├── freelancers/
│   │   ├── page.tsx                            # Talent browse - search + skill filter across all profiles
│   │   └── [address]/
│   │       ├── page.tsx                        # Server Component - resolves dynamic params
│   │       └── FreelancerProfile.tsx           # Public profile view - bio, skills, links, hire CTA
│   ├── projects/
│   │   ├── page.tsx                            # Public listings browser with search + skill filter chips
│   │   └── [id]/
│   │       ├── page.tsx                        # Server Component - resolves dynamic params
│   │       └── ListingDetail.tsx               # Client Component - listing detail + apply
│   ├── globals.css                             # Design system tokens, animations, base styles
│   ├── icon.svg                                # App favicon
│   ├── layout.tsx                              # Root layout - font, providers, metadata
│   └── page.tsx                                # Landing page (hero, features, how it works, CTA)
├── components/
│   ├── ui/
│   │   ├── Button.tsx                          # primary / accent / outline / ghost / destructive variants
│   │   └── Badge.tsx                           # Milestone status badges (Pending/Funded/Completed/Released/Disputed)
│   ├── Footer.tsx                              # Site footer
│   ├── Navbar.tsx                              # Sticky nav with role-adaptive links, role chip, and mobile menu
│   ├── Notification.tsx                        # Toast notification provider + useNotification hook
│   ├── ScrollReveal.tsx                        # IntersectionObserver scroll animation wrapper
│   ├── WalletGuard.tsx                         # Wallet connection gate - wraps pages that require Freighter
│   ├── RoleSelector.tsx                        # Role selection modal shown after wallet connect (client / freelancer)
│   ├── LandingHeroCta.tsx                      # Role-adaptive hero CTA buttons
│   └── LandingBottomCta.tsx                    # Role-adaptive bottom CTA section
├── contexts/
│   ├── WalletContext.tsx                       # Freighter wallet state - connect / disconnect / auto-restore
│   └── RoleContext.tsx                         # Role state ("client" | "freelancer") with localStorage persistence
├── lib/
│   ├── contract.ts                             # Soroban contract queries and transactions
│   ├── listings.ts                             # Supabase CRUD - listings, applications, project metadata
│   ├── profiles.ts                             # Supabase CRUD - freelancer profiles (get, upsert, list)
│   └── supabase.ts                             # Lazy Supabase client singleton
├── scripts/
│   ├── seed-demo.ts                            # Seeds 10 demo listings into Supabase (no applications)
│   └── integration-test.ts                     # Headless E2E test: funds accounts, runs full milestone lifecycle
├── public/
│   └── favicon.svg
├── .env.example
├── .prettierrc
└── next.config.ts
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

The example file ships with the deployed testnet contract ID pre-filled. Fill in the Supabase and simulation source values.

### 3. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the following to create all tables and RLS policies:

```sql
-- Listings table
create table listings (
  id uuid default gen_random_uuid() primary key,
  client_address text not null,
  title text not null,
  description text not null,
  skills text[] default '{}',
  milestones jsonb not null,
  total_xlm numeric not null,
  status text default 'open',
  on_chain_project_id bigint,
  created_at timestamptz default now()
);

-- Applications table
create table applications (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade,
  freelancer_address text not null,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Project metadata (off-chain names for on-chain projects)
create table project_metadata (
  on_chain_project_id bigint primary key,
  name text not null,
  client_address text not null,
  created_at timestamptz default now()
);

-- RLS policies (anon key access)
create policy "anon_select" on listings for select to anon using (true);
create policy "anon_insert" on listings for insert to anon with check (true);
create policy "anon_update_open_listings" on listings
  for update to anon
  using (status = 'open')
  with check (status in ('open', 'filled', 'cancelled'));

create policy "anon_select" on applications for select to anon using (true);
create policy "anon_insert" on applications for insert to anon with check (true);
create policy "anon_update_pending_applications" on applications
  for update to anon
  using (status = 'pending')
  with check (status in ('pending', 'accepted', 'rejected'));

create policy "anon_select" on project_metadata for select to anon using (true);
create policy "anon_insert" on project_metadata for insert to anon with check (true);
create policy "anon_upsert_project_metadata" on project_metadata
  for update to anon
  using (true)
  with check (length(trim(name)) > 0);

-- Constraints
alter table listings add constraint listings_status_valid
  check (status in ('open', 'filled', 'cancelled'));
alter table applications add constraint applications_status_valid
  check (status in ('pending', 'accepted', 'rejected'));
alter table project_metadata add constraint project_metadata_name_nonempty
  check (length(trim(name)) > 0);

-- Prevent duplicate applications
create unique index applications_unique_per_listing
  on applications (listing_id, freelancer_address);

-- Freelancer profiles table
create table freelancer_profiles (
  wallet_address text primary key,
  name text,
  bio text,
  skills text[] default '{}',
  github_url text,
  portfolio_url text,
  updated_at timestamptz default now()
);

alter table freelancer_profiles enable row level security;
create policy "anon_select" on freelancer_profiles for select to anon using (true);
create policy "anon_insert" on freelancer_profiles for insert to anon with check (true);
create policy "anon_upsert" on freelancer_profiles for update to anon using (true) with check (true);
```

> If you have an existing Supabase project, apply both migration files in order:
>
> 1. [`supabase/migrations/20260607000000_tighten_rls_policies.sql`](../supabase/migrations/20260607000000_tighten_rls_policies.sql) - tighter RLS policies and constraints
> 2. [`supabase/migrations/20260607000001_create_freelancer_profiles.sql`](../supabase/migrations/20260607000001_create_freelancer_profiles.sql) - freelancer profiles table

3. Copy your **Project URL** and **anon/public key** from **Project Settings > API** into `.env.local`

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User Flows

### Client

1. Connect Freighter wallet → select **I want to hire** in the role selector
2. Browse **/freelancers** to discover talent- search by name, bio, or skill; filter by skill chips
3. Click a freelancer card to view their public profile; click **Start a Project** to hire them directly
4. Or go to **Client** dashboard → **New Listing** to post a project and receive applications
5. Review applications at **Client > Listings > Applications** (each applicant name links to their profile)
6. Accept one application- Freighter signs the on-chain `create_project` transaction
7. Fund each milestone from the project management page
8. Wait for the freelancer to mark the milestone complete (`mark_complete`)
9. Approve the milestone- XLM is released to the freelancer

### Freelancer

1. Connect Freighter wallet → select **I want to work** in the role selector
2. Go to **My Profile** in the navbar and fill in your name, bio, skills, GitHub, and portfolio URL
3. Browse open projects at **/projects**- search by title/description or filter by skill chips (no wallet required to view)
4. Apply to a listing with an optional cover message
5. Once accepted, the project appears on the **Freelancer** dashboard
6. After completing work on a `Funded` milestone, click **Mark as Complete**
7. The client can now approve the milestone and release payment
8. Each approved milestone increments the on-chain reputation score, shown as a badge on the Freelancer Dashboard
9. Dispute a milestone if needed

> **Switching roles:** The navbar shows a role chip (e.g. `Freelancer ⇄`) that re-opens the role selector so you can switch without disconnecting your wallet.

---

## Design System

The design system lives in `app/globals.css` as CSS custom properties, mapped to Tailwind utilities via `@theme inline`.

### Typography

Two Google Fonts are loaded via `next/font/google` in `app/layout.tsx`:

| Font              | CSS variable     | Usage                                       |
| ----------------- | ---------------- | ------------------------------------------- |
| Plus Jakarta Sans | `--font-sans`    | Body text, UI labels, interactive elements  |
| Sora              | `--font-heading` | All h1/h2/h3 headings (weights 600/700/800) |

The global heading rule in `app/globals.css` applies Sora automatically to all `h1`, `h2`, and `h3` elements without needing per-element class names.

### Color Tokens

| Token                | Hex       | Usage                                                    |
| -------------------- | --------- | -------------------------------------------------------- |
| `--primary`          | `#1E3A5F` | Brand navy - headings, logo                              |
| `--accent`           | `#0369A1` | CTA buttons, skill chips, XLM amounts, milestone numbers |
| `--success`          | `#059669` | Released milestone state                                 |
| `--destructive`      | `#DC2626` | Disputed state, errors                                   |
| `--background`       | `#F8FAFC` | Page background                                          |
| `--card`             | `#FFFFFF` | Card surfaces                                            |
| `--foreground`       | `#0F172A` | Body text                                                |
| `--muted`            | `#F1F5F9` | Section backgrounds                                      |
| `--muted-foreground` | `#64748B` | Secondary text                                           |
| `--border`           | `#E2E8F0` | Dividers, card borders                                   |

The accent color is applied consistently across the UI using Tailwind's opacity modifier syntax (`bg-accent/10`, `border-accent/20`, `text-accent`) for skill chips, XLM values, milestone number circles, and the on-chain reputation badge.

### Milestone Status Colors

| Status    | Style                                                   |
| --------- | ------------------------------------------------------- |
| Pending   | Gray - `bg-slate-100 text-slate-600`                    |
| Funded    | Blue - `bg-blue-50 text-accent border-blue-200`         |
| Completed | Amber - `bg-amber-50 text-amber-700 border-amber-200`   |
| Released  | Green - `bg-emerald-50 text-success border-emerald-200` |
| Disputed  | Red - `bg-red-50 text-destructive border-red-200`       |

### Rules

- No gradients, no purple anywhere
- All icons from `lucide-react` - no emojis
- Light theme only
- Transitions: 150–200ms ease, flat color shifts

---

## Environment Variables

| Variable                         | Value / Description                                                               |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_STELLAR_RPC_URL`    | `https://soroban-testnet.stellar.org`                                             |
| `NEXT_PUBLIC_CONTRACT_ID`        | `CAGH37UE6W66FDEI7HPWLGMSWQD4Z7SRZVW3AJLBVL6CUN47UYRUBIFN`                        |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015`                                               |
| `NEXT_PUBLIC_XLM_TOKEN_ID`       | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`                        |
| `NEXT_PUBLIC_SIMULATION_SOURCE`  | A funded testnet account public key (for read-only simulations)                   |
| `NEXT_PUBLIC_SUPABASE_URL`       | Your Supabase project URL (Project Settings > API)                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Your Supabase anon/public key (Project Settings > API)                            |
| `DEMO_CLIENT_ADDRESS`            | Client public key used by `npm run seed` to author demo listings                  |
| `INTEGRATION_CLIENT_SECRET`      | _(optional)_ Persistent testnet secret for E2E test client; blank = Friendbot     |
| `INTEGRATION_FREELANCER_SECRET`  | _(optional)_ Persistent testnet secret for E2E test freelancer; blank = Friendbot |

---

## Available Scripts

| Script             | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `npm run dev`      | Start development server                                             |
| `npm run build`    | Production build with type checking                                  |
| `npm run start`    | Start production server                                              |
| `npm run lint`     | Run ESLint                                                           |
| `npm run format`   | Run Prettier across all files                                        |
| `npm run seed`     | Seed 10 demo listings into Supabase (requires `DEMO_CLIENT_ADDRESS`) |
| `npm run test:e2e` | Run headless E2E integration test against Stellar testnet            |
