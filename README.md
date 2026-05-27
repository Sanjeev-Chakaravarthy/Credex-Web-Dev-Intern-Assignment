# AISpendLens

**Audit your startup's AI tool spending in 60 seconds. Get instant savings recommendations.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/aispendlens)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is this?

AISpendLens is a free AI spend audit tool for startups. You input your AI stack — Cursor, GitHub Copilot, Claude, ChatGPT, API usage, etc. — and get an instant audit report with specific savings recommendations.

**No login required.** Email capture happens *after* value is delivered.

High-savings users are routed to [Credex](https://credex.com) for procurement optimization — that's how we monetize.

### Who is this for?

- **Startup CTOs** managing 5–50 person engineering teams who suspect they're overspending on AI tools
- **Founders** who approved a dozen AI subscriptions and have no idea what the total bill looks like
- **Engineering Managers** who need to justify or cut AI tool budgets for the next quarter

---

## Features

- 🔍 **Instant Audit** — Input your AI stack, get results in under 10 seconds
- 💰 **Savings Recommendations** — Plan downgrades, tool consolidation, overlap detection
- 🤖 **AI-Powered Summary** — Claude generates a personalized executive summary
- 📊 **Visual Breakdown** — Charts showing spend distribution and savings potential
- 🔗 **Shareable Reports** — Unique URL for each audit to share with your team
- 📧 **Email Report** — Get your full audit delivered to your inbox
- 🎯 **Credex Routing** — High-savings users get connected to procurement optimization

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Anthropic Claude API (Sonnet 4.6) |
| **Email** | Resend |
| **Deployment** | Vercel |
| **Validation** | Zod |
| **Charts** | Recharts |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm / pnpm / yarn
- Supabase account (free tier works)
- Anthropic API key
- Resend API key (optional, for email reports)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/aispendlens.git
cd aispendlens
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in your keys (see [Environment Variables](#environment-variables) below).

### 3. Database Setup

Run the Supabase migrations:

```bash
npx supabase db push
```

Or manually create the tables using the SQL in `supabase/migrations/`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API key for Claude |
| `RESEND_API_KEY` | ⬜ | Resend API key for email delivery |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL (e.g., `https://aispendlens.com`) |
| `CREDEX_PARTNER_ID` | ⬜ | Credex partner tracking ID |
| `CREDEX_WEBHOOK_URL` | ⬜ | Credex webhook for lead forwarding |

See [`.env.example`](.env.example) for the full template.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + Inter font
│   ├── globals.css               # Design system (dark luxury SaaS)
│   ├── audit/
│   │   ├── page.tsx              # Multi-step audit wizard
│   │   └── results/
│   │       └── page.tsx          # Results dashboard + share modal
│   ├── report/
│   │   └── [id]/
│   │       ├── page.tsx          # Public report (server component)
│   │       └── ReportClient.tsx  # Public report (client renderer)
│   └── api/
│       ├── audit/route.ts        # POST: run audit calculation
│       ├── lead/route.ts         # POST: capture email lead
│       ├── email/route.ts        # POST: send email via Resend
│       ├── share/route.ts        # POST: generate share URL
│       └── summary/route.ts     # POST: generate AI summary
├── lib/
│   ├── audit-engine/
│   │   ├── types.ts              # Zod schemas + TypeScript types
│   │   ├── pricing.ts            # Official pricing database
│   │   ├── calculator.ts         # Core audit calculation logic
│   │   ├── overlap.ts            # Tool overlap detection
│   │   └── recommendations.ts   # Savings recommendation engine
│   ├── ai/
│   │   └── summary.ts            # Anthropic Claude API + fallback
│   ├── email/
│   │   └── templates.ts          # Resend email HTML + sender
│   ├── supabase.ts               # Supabase client + DB operations
│   └── utils.ts                  # formatCurrency, generateShareId
└── store/
    └── audit-store.ts            # Zustand state (persisted to localStorage)
```

---

## Architecture Overview

```
Landing Page → Audit Wizard → API Route → Audit Engine → Results Page
                                              ↓
                                        Supabase (store)
                                              ↓
                                    Claude API (summary)
                                              ↓
                                    Lead Capture → Credex CTA
                                              ↓
                                    Resend (email report)
```

The audit engine is entirely deterministic — no AI is used for the actual calculations. Claude is only used for generating the executive summary paragraph. This means audits work even if the Anthropic API is down (summary falls back to a template).

For full architecture details with Mermaid diagrams, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Data Model

### `audits` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `stack` | `jsonb` | Raw audit input (tools, team size, use case) |
| `results` | `jsonb` | Calculated audit result |
| `summary` | `text` | AI-generated summary |
| `share_id` | `varchar(16)` | Unique shareable slug |
| `created_at` | `timestamptz` | Audit timestamp |

### `lead_captures` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `email` | `text` | User email |
| `company` | `text` | Company name (optional) |
| `role` | `text` | User role (optional) |
| `audit_id` | `uuid` | FK → audits.id |
| `created_at` | `timestamptz` | Capture timestamp |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import into Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

The `vercel.json` is not required — Next.js defaults work out of the box.

### Manual

```bash
npm run build
npm run start
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture with Mermaid diagrams |
| [`docs/DEVLOG.md`](docs/DEVLOG.md) | Development journal (May 12–20, 2026) |
| [`docs/REFLECTION.md`](docs/REFLECTION.md) | Technical decisions and lessons learned |
| [`docs/TESTS.md`](docs/TESTS.md) | Testing strategy and coverage |
| [`docs/PRICING_DATA.md`](docs/PRICING_DATA.md) | Official AI tool pricing with sources |
| [`docs/PROMPTS.md`](docs/PROMPTS.md) | AI prompts used and iteration history |
| [`docs/GTM.md`](docs/GTM.md) | Go-to-market strategy |
| [`docs/ECONOMICS.md`](docs/ECONOMICS.md) | Unit economics and projections |
| [`docs/USER_INTERVIEWS.md`](docs/USER_INTERVIEWS.md) | Interview templates for user research |
| [`docs/LANDING_COPY.md`](docs/LANDING_COPY.md) | All landing page copy variants |
| [`docs/METRICS.md`](docs/METRICS.md) | KPIs and analytics plan |

---

## Contributing

This is currently a solo project built for the Credex assignment. If you'd like to contribute:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built with ☕ and too many AI subscriptions by [@sanjeevms](https://github.com/sanjeevms)
