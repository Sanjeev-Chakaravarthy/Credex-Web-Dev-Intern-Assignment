# Reflection

> Honest retrospective on building AISpendLens — what worked, what didn't, and what I'd do differently.

---

## Why This Architecture?

### The Core Bet: Zero-Friction Value Delivery

The entire architecture is designed around one principle: **show value before asking for anything.**

Most SaaS products gate their core value behind signup. That makes sense when you're selling ongoing access. But AISpendLens is a one-shot tool — you run an audit, you get results. If I force signup before the audit, I lose 80%+ of visitors. Instead:

1. Landing page → no signup required
2. Audit wizard → no signup required
3. Results page → full results shown immediately
4. Email capture → *after* the user has seen their savings number

This is the same pattern that made Grammarly's browser extension successful: show the value, then convert. And it informs every architectural choice.

### Why Next.js 15 with App Router?

I considered four options:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Next.js (App Router)** | SSR, API routes, Vercel deploy, React Server Components | Learning curve for RSC patterns | ✅ Chose this |
| **Remix** | Better data loading patterns, progressive enhancement | Smaller ecosystem, fewer deployment options | ❌ |
| **Astro + API** | Great for static landing page | Poor for the interactive audit wizard | ❌ |
| **SPA + Express** | Full control, familiar | Two repos, CORS, separate deployment | ❌ |

Next.js won because it lets me ship a static-feeling landing page (Server Components, zero client JS) alongside a highly interactive audit wizard (Client Components) in the same codebase. One repo, one deploy, one mental model.

### Why Deterministic Audit Engine + AI Summary?

This was the most important architectural decision. I split the audit into two pipelines:

**Pipeline 1: Deterministic Calculator (TypeScript)**
- Pure functions, no side effects
- Unit testable with known inputs → expected outputs
- Runs in <100ms
- Works offline, no API dependency

**Pipeline 2: AI Summary (Claude)**
- Natural language generation only
- Graceful degradation to templates
- Non-blocking (renders after results)
- Costs ~$0.003 per call

If I'd used AI for the calculations, I'd have:
- Non-reproducible results (same input → different output)
- Untestable business logic
- $0.01+ per audit in API costs
- A hard dependency on Anthropic's uptime

The deterministic engine is the foundation. The AI summary is the cherry on top.

### Why Supabase Over Raw PostgreSQL?

Speed of development. Supabase gives me:
- Hosted PostgreSQL with connection pooling
- Auto-generated REST API (PostgREST)
- Row Level Security for the share feature
- Real-time subscriptions (not used yet, but useful for future team features)
- Free tier that covers launch easily

The alternative was provisioning a PostgreSQL instance on Railway or Neon, writing my own connection logic, and managing migrations manually. Supabase wraps all of that.

**Trade-off I accepted:** Supabase's RLS policies are powerful but complex. For this project, I only have two tables and simple access patterns, so the complexity is manageable. At scale, I might move to a more traditional ORM + migration approach.

---

## What Would I Change With More Time?

### Week 2: Product Depth

1. **API Usage Estimation Calculator**
   Right now, API-priced tools (Anthropic API, OpenAI API) just take a monthly spend number. With more time, I'd build a calculator: "How many requests do you make? What's the average token count?" → estimated monthly cost. This would make recommendations much more precise.

2. **Historical Tracking**
   Let users re-run audits monthly and see their spend trending over time. Requires auth, which I'd add via Supabase Auth (magic link, no passwords).

3. **CSV/PDF Export**
   CTOs need to share audit results in board decks and budget meetings. A downloadable PDF with charts would increase the product's utility massively.

4. **Team Audit Dashboard**
   Instead of individual audits, let a CTO input their entire org's AI stack at once. Show per-team breakdowns and org-wide recommendations.

### Week 3: Growth Infrastructure

5. **PostHog Analytics**
   I'd instrument the full funnel: page views, audit starts, audit completions, email captures, Credex clicks. Can't optimize what you can't measure.

6. **A/B Testing Framework**
   Test headline variants, CTA copy, and the Credex threshold. I'd use Vercel's Edge Config for feature flags.

7. **Email Drip Sequence**
   After email capture: Day 1 → full report PDF, Day 3 → "did you act on the recommendations?", Day 7 → Credex offer for high-savings users.

8. **Slack Bot**
   `/audit-ai` command that runs the audit inline. Startups live in Slack. Meet them there.

### Week 4: Monetization

9. **Credex Deep Integration**
   Instead of just a CTA link, build a proper handoff: pre-fill the Credex form with the user's tool stack, send enriched lead data via webhook, track conversion through to contract signing.

10. **Premium Tier**
    Free audits stay free forever. Premium ($29/mo per org) adds: historical tracking, team dashboards, Slack integration, PDF exports, and priority Credex routing.

---

## Hardest Technical Decision

### How to handle the pricing data.

This sounds simple until you actually sit down and do it. Every AI tool has a different pricing model:

- **Cursor:** Credit-based pools, auto mode vs. manual model selection, separate Bugbot pricing
- **GitHub Copilot:** Just switched to credit-based (June 2026), different tiers with different credit allotments
- **Claude:** Subscription tiers for consumers, per-token for API, plus Batch API discounts
- **ChatGPT:** Five tiers (Free/Go/Plus/Pro $100/Pro $200), plus Team and Enterprise
- **Windsurf:** Recently changed from credits to quotas with daily/weekly refresh cycles
- **Gemini:** Consumer AI tiers are different from Workspace integration, which is different from API pricing

The question was: **how do I normalize this into a schema that enables apples-to-apples comparison?**

My solution was the `PlanPricing` interface:

```typescript
interface PlanPricing {
  plan: string;           // "pro", "business", "enterprise"
  pricePerSeat: number;   // Monthly cost per seat
  isPerSeat: boolean;     // Is it per-seat or flat?
  minSeats?: number;      // Minimum seats required
  features: string[];     // What you get
  isApiPlan?: boolean;    // Usage-based pricing?
}
```

This works for subscription tools. For API tools, `monthlySpend` is the user's input — I don't try to decompose it into token counts. That's a deliberate simplification.

**What I'd do differently:** Build a more sophisticated pricing model that handles:
- Credit pools and rollover
- Annual vs. monthly billing discounts
- Volume discounts on API usage
- Free tier limits (tokens/messages per day)

But that's a rabbit hole. For an MVP, "how much do you spend per month?" is the right level of abstraction.

---

## How Would I Scale This?

### 100 audits/day (Launch)
Current architecture handles this easily. Vercel free tier, Supabase free tier, ~$0.30/day in Anthropic API costs.

### 1,000 audits/day (Traction)
- Upgrade to Vercel Pro ($20/mo)
- Upgrade to Supabase Pro ($25/mo)
- Anthropic costs: ~$3/day ($90/mo)
- Add Upstash Redis for rate limiting ($10/mo)
- Total: ~$145/mo

### 10,000 audits/day (Growth)
- Vercel Pro is still fine (mostly static + serverless)
- Supabase Pro with larger instance ($75/mo)
- Anthropic costs: ~$30/day ($900/mo) — this is where it gets real
- Optimization: Cache AI summaries for similar audit profiles. If 500 users have "Cursor Pro + ChatGPT Plus + 5 person team," the summary is nearly identical. Cache it.
- Add CDN for the share pages (they're read-heavy, rarely change)
- Total: ~$1,100/mo

### 100,000 audits/day (Scale)
At this point, I'd rethink the AI summary approach:
- Pre-generate summary templates for common tool combinations
- Only call Claude for unusual or complex stacks
- Move to Haiku 4.5 instead of Sonnet 4.6 (5x cheaper)
- Batch API for non-real-time summaries
- Estimated Anthropic costs: ~$50/day ($1,500/mo) with these optimizations

The audit engine itself scales linearly because it's pure computation — no external calls, no I/O. It's the AI summary that's the bottleneck, and it's also the most optional part.

---

## What Metrics Matter Most?

In order of importance:

### 1. Audit Completion Rate
`(completed audits) / (audit wizard starts)`

This is the product metric. If people start the wizard but don't finish, the UX is broken. Target: >70%.

### 2. Credex Conversion Rate
`(Credex CTA clicks) / (audits with credexEligible=true)`

This is the business metric. It's the only way we make money. Target: >15%.

### 3. Average Savings Identified
`mean(totalAnnualSavings) across all audits`

This is the value metric. Higher savings = more compelling product = more Credex-eligible users. If average savings drop below $500/year, the product isn't useful enough.

### 4. Email Capture Rate
`(emails captured) / (completed audits)`

This is the growth metric. Emails enable follow-up, drip sequences, and re-engagement. Target: >30%.

### 5. Share Rate
`(shared reports) / (completed audits)`

This is the viral metric. Every shared report is free distribution. Target: >10%.

---

## How Would I Monetize?

### Current Model: Credex Referral Fees
- We send qualified leads (>$1,000/year in potential savings) to Credex
- Credex pays a referral fee per converted lead
- Estimated: $50–200 per lead that signs a Credex contract
- At 100 qualified leads/month with 20% Credex conversion: $1,000–4,000/mo

### Future Model 1: Premium SaaS ($29/org/mo)
- Free tier: unlimited single audits (current product)
- Premium: historical tracking, team dashboards, PDF exports, Slack bot, API access
- Target: 200 paying orgs = $5,800/mo ARR

### Future Model 2: White-Label for VCs/Accelerators
- VCs want to audit their portfolio companies' AI spend
- Accelerators want to include this in their startup programs
- Enterprise pricing: $500–2,000/mo per VC/accelerator
- Target: 10 partners = $5,000–20,000/mo

### Future Model 3: Procurement Marketplace
- Instead of referring to Credex, become the procurement layer
- Negotiate bulk AI tool pricing on behalf of startups
- Take a 10–15% cut of the savings we facilitate
- This is the long-term play. It requires deep vendor relationships and legal infrastructure.

---

## What Did I Learn?

### 1. Pricing research is product research
Spending 4 hours mapping AI tool pricing taught me more about the market than any amount of Googling. The fact that every vendor's pricing page is structured differently, changes frequently, and is often misleading — that *is* the problem we're solving. If this data were easy to compare, our product wouldn't need to exist.

### 2. Deterministic > AI for core logic
It's tempting to use AI for everything when you have access to Claude. But for calculations that need to be reproducible, testable, and explainable, deterministic code wins. AI is perfect for the soft stuff — summarization, natural language, personalization. Bad for the hard stuff — math, comparisons, recommendations.

### 3. Value-first conversion works
Building the entire product without auth means I can't track individual users across sessions. But it also means every visitor gets instant value. In a world where every SaaS tool asks for your email before showing you anything, being generous with your product creates trust. Email capture after the "aha moment" converts better than a gate before it.

### 4. The boring parts take the longest
API routes, Zod validation, error handling, loading states, 404 pages, mobile responsive, meta tags, favicons, documentation. None of this is intellectually challenging. All of it is necessary. I spent more time on these "boring" details than on the audit engine itself.

### 5. Ship the simplest thing that delivers value
My initial plan included team dashboards, historical tracking, Slack bots, and PDF exports. I shipped none of those. What I shipped is: input your tools, see your savings, share the report. That's enough to validate the concept and start getting Credex leads. Everything else is iteration.

### 6. Documentation is a forcing function
Writing this devlog, the architecture doc, and the reflection forced me to articulate decisions I'd made intuitively. "Why didn't I use auth?" I had a gut feeling, but writing the answer made me realize the reasoning was sound. Documentation isn't just for future developers — it's for current you.
