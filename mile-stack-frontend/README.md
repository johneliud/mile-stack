# MileStack Frontend

Next.js 16 frontend for [MileStack](../README.md) — a Soroban-powered milestone-based XLM escrow platform connecting developers in the Global South with global employers on Stellar.

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

| Technology               | Purpose                      |
| ------------------------ | ---------------------------- |
| Next.js 16 (App Router)  | Framework                    |
| TypeScript               | Language                     |
| Tailwind CSS v4          | Styling                      |
| Plus Jakarta Sans        | Typography                   |
| Lucide React             | Icons                        |
| `@stellar/stellar-sdk`   | Soroban contract interaction |
| `@stellar/freighter-api` | Freighter wallet connection  |
| Prettier                 | Code formatting              |

---

## Project Structure

```text
mile-stack-frontend/
├── app/
│   ├── freelancer/
│   │   ├── page.tsx                        # Freelancer Dashboard — all active projects
│   │   └── projects/[id]/
│   │       ├── page.tsx                    # Server Component — resolves dynamic params
│   │       └── ProjectDetail.tsx           # Client Component — milestones + dispute flow
│   ├── globals.css                         # Design system tokens, animations, base styles
│   ├── icon.svg                            # App favicon (navy "M" on transparent)
│   ├── layout.tsx                          # Root layout — font, providers, metadata
│   └── page.tsx                            # Landing page (hero, features, how it works, CTA)
├── components/
│   ├── ui/
│   │   ├── Button.tsx                      # Primary / accent / outline / ghost / destructive variants
│   │   └── Badge.tsx                       # Milestone status badges (pending / funded / released / disputed)
│   ├── Footer.tsx                          # Site footer with link columns
│   ├── Navbar.tsx                          # Sticky nav with 75vw mobile slide-in menu
│   ├── Notification.tsx                    # Toast notification provider + useNotification hook
│   └── ScrollReveal.tsx                    # IntersectionObserver scroll animation wrapper
├── contexts/
│   └── WalletContext.tsx                   # Freighter wallet state — connect / disconnect / auto-restore
├── lib/
│   ├── contract.ts                         # Soroban contract queries and dispute transaction
│   ├── freighter.ts                        # Wallet connect / sign transaction helpers
│   └── stellar.ts                          # RPC server and contract instance helpers
├── design-system/
│   └── milestack/
│       └── MASTER.md                       # Generated design system reference
├── public/
│   └── favicon.svg
├── .env.local.example
├── .prettierrc
└── next.config.ts
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

Prettier runs automatically after install via the `postinstall` hook.

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

The example file ships with the deployed testnet contract ID pre-filled. Set `NEXT_PUBLIC_SIMULATION_SOURCE` to any funded testnet account public key.

### 2a. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL editor, run:

```sql
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

create table applications (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade,
  freelancer_address text not null,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);
```

3. Copy your project URL and anon key from **Project Settings > API** into `.env.local`

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Design System

The design system lives in `app/globals.css` as CSS custom properties, mapped to Tailwind utilities via `@theme inline`.

### Color Tokens

| Token                | Hex       | Usage                       |
| -------------------- | --------- | --------------------------- |
| `--primary`          | `#1E3A5F` | Brand navy — headings, logo |
| `--accent`           | `#0369A1` | CTA buttons, links          |
| `--success`          | `#059669` | Released milestone state    |
| `--destructive`      | `#DC2626` | Disputed state, errors      |
| `--background`       | `#F8FAFC` | Page background             |
| `--card`             | `#FFFFFF` | Card surfaces               |
| `--foreground`       | `#0F172A` | Body text                   |
| `--muted`            | `#F1F5F9` | Section backgrounds         |
| `--muted-foreground` | `#64748B` | Secondary text              |
| `--border`           | `#E2E8F0` | Dividers, card borders      |

### Milestone Status Colors

| Status   | Style                                                   |
| -------- | ------------------------------------------------------- |
| Pending  | Gray — `bg-slate-100 text-slate-600`                    |
| Funded   | Blue — `bg-blue-50 text-accent border-blue-200`         |
| Released | Green — `bg-emerald-50 text-success border-emerald-200` |
| Disputed | Red — `bg-red-50 text-destructive border-red-200`       |

### Rules

- No gradients, no purple anywhere
- All icons from `lucide-react` — no emojis
- Light theme only
- Transitions: 150–200ms ease, flat color shifts

---

## Environment Variables

| Variable                         | Value / Description                                             |
| -------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_STELLAR_RPC_URL`    | `https://soroban-testnet.stellar.org`                           |
| `NEXT_PUBLIC_CONTRACT_ID`        | `CAHK5YTBEY7RGHYHIC4TJBWD7755IEMJVMYAKB7FJZWQJOLGMZ4W2EP7`      |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015`                             |
| `NEXT_PUBLIC_XLM_TOKEN_ID`       | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`      |
| `NEXT_PUBLIC_SIMULATION_SOURCE`  | A funded testnet account public key (for read-only simulations) |
| `NEXT_PUBLIC_SUPABASE_URL`       | Your Supabase project URL (Project Settings > API)              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Your Supabase anon/public key (Project Settings > API)          |

---

## Available Scripts

| Script           | Description                         |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Start development server            |
| `npm run build`  | Production build with type checking |
| `npm run start`  | Start production server             |
| `npm run lint`   | Run ESLint                          |
| `npm run format` | Run Prettier across all files       |
