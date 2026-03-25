# TourneyCrew 🏆

**Your family's tournament weekend guide.**

TourneyCrew is a free, mobile-responsive web platform where youth sports families share tips about tournament venues — parking, food, WiFi, seating, and more. Built on Next.js 15, Supabase, and Claude AI.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Database    | Supabase (PostgreSQL + Row Level Security) |
| AI          | Anthropic Claude (tip moderation & summaries) |
| Hosting     | Vercel                                  |
| Scrapers    | Cheerio + Axios (SportsEngine, AES, GotSport) |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase, Anthropic, and Google Places keys
```

### 3. Set up the database

1. Create a project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the migration — this creates all tables, RLS policies, triggers, and seed data

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
tourneycrew/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Homepage
│   ├── layout.tsx              # Root layout (Header + Footer)
│   ├── tournaments/
│   │   ├── page.tsx            # Browse tournaments
│   │   └── [id]/page.tsx       # Tournament detail + tips
│   ├── tips/submit/page.tsx    # Submit a family tip
│   ├── sponsors/page.tsx       # Sponsor info / pricing
│   └── api/
│       ├── tournaments/        # GET tournaments with filters
│       ├── tips/               # GET + POST tips
│       ├── tips/moderate/      # Admin: re-run AI moderation
│       ├── businesses/         # GET local businesses
│       └── sponsors/           # GET active sponsors
├── components/
│   ├── layout/                 # Header, Footer
│   ├── ui/                     # Badge, Card
│   ├── tournaments/            # TournamentCard
│   ├── tips/                   # TipCard, TipForm
│   └── sponsors/               # SponsorBanner
├── lib/
│   ├── supabase/               # Supabase client (browser + server)
│   ├── claude/moderate.ts      # Claude tip moderation + summaries
│   ├── scrapers/               # SportsEngine + AES scrapers
│   └── utils.ts                # cn(), date helpers, sport/category maps
├── types/index.ts              # All TypeScript types
└── supabase/migrations/        # SQL migration files
```

---

## Key Features

### AI-Powered Tip Moderation
Every submitted tip runs through Claude Haiku before going live. The model evaluates content quality, relevance, and family-friendliness and returns a score + approval decision. Tips scoring below the threshold are queued for manual review.

### Tournament Scrapers
Run `npm run scrape` to pull tournaments from SportsEngine and AES. Results are upserted to Supabase with `source_url` as the unique key to avoid duplicates.

### Sponsor System
Three-tier sponsor model (Bronze $150 · Silver $300 · Gold $500/mo) with city and sport targeting. Active sponsors are surfaced via `/api/sponsors` and displayed via `SponsorBanner`.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all env vars from `.env.example` in Vercel's dashboard
4. Deploy — Vercel auto-detects Next.js

---

## 2-Week Build Roadmap

See [`tourneycrew-build-plan.docx`](../tourneycrew-build-plan.docx) for the full day-by-day schedule. High-level milestones:

| Week | Milestone |
|------|-----------|
| Days 1–3  | Project setup, DB schema, auth |
| Days 4–6  | Tournament pages + scrapers |
| Days 7–9  | Tips system + AI moderation |
| Days 10–12 | Businesses, sponsors, premium |
| Days 13–14 | Polish, testing, launch prep |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server only) |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `GOOGLE_PLACES_API_KEY` | Optional | Local business enrichment |
| `STRIPE_SECRET_KEY` | Optional | Premium subscriptions |
| `ADMIN_SECRET` | ✅ | Protects /api/tips/moderate |

---

## Contributing Tips

Tips submitted via `/tips/submit` are automatically reviewed by Claude. Approved tips appear immediately; pending tips are visible in the Supabase dashboard under `family_tips` where `status = 'pending'`.

To manually re-moderate a tip:
```bash
curl -X POST /api/tips/moderate \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tipId": "uuid-here"}'
```

---

*Built with ❤️ for sports families everywhere.*
