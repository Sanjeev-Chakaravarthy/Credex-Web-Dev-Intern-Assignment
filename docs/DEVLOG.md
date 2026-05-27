# Development Log

> Build journal for AISpendLens — May 12–20, 2026
> Documenting decisions, blockers, and progress as they happened.

---

## Day 1 — Monday, May 12, 2026
### Research + Project Scaffold

**Hours worked:** 6

**What I did:**

Started by spending 2 hours just *looking* at the problem. Googled "how much do startups spend on AI tools" and couldn't find a single good source. Found a Tomasz Tunguz post mentioning the average Series A company now spends $2,800/mo on AI tooling across their eng team. That validated the thesis — nobody is tracking this stuff.

Scaffolded the project with `create-next-app`:

```bash
npx create-next-app@latest aispendlens --typescript --tailwind --eslint --app --src-dir
```

Chose Next.js 15 with App Router because:
- Server Components = less client-side JS for the landing page
- API Routes = no separate backend needed
- Vercel deployment = zero-config

Set up the basics:
- TypeScript strict mode
- Tailwind CSS v4
- ESLint config
- `.env.example` with all the variables I'd need
- Created the `docs/` folder and started this devlog

**Research findings:**
- No direct competitor does what I'm building. Closest is CloudZero (but that's for cloud infra, not AI tools)
- Most startups I know use 3–5 AI tools simultaneously
- The "I'm paying for both Cursor and Copilot" meme is real — saw it on r/programming three times this week
- Credex's value prop makes sense as a downstream CTA — they optimize procurement, we identify the savings

**Decisions made:**
1. No auth. Zero friction. Show value first, capture email after.
2. Audit engine must be deterministic — no LLM in the calculation loop
3. Claude for executive summary only (nice-to-have, not critical path)
4. Supabase for storage — free tier is generous enough for launch

**Blockers:** None yet. Famous last words.

---

## Day 2 — Tuesday, May 13, 2026
### Audit Engine + Pricing Research

**Hours worked:** 8

**What I did:**

This was the hardest day so far. Spent 4 hours just researching and verifying pricing for 8 AI tools. Every single vendor has a different pricing model:

- Cursor: credit-based (switched from request-based in June 2025)
- GitHub Copilot: just moved to credit-based billing in June 2026
- Claude: subscription tiers + API pricing (per-token)
- ChatGPT: now has Free/Go/Plus/Pro tiers
- APIs: all per-million-token with different rates for input/output

The pricing landscape is a mess. Created `pricing-data.ts` as a typed database with `ToolPricing` interfaces. Every entry has:
- Source URL (official pricing page)
- Verification date
- Per-seat pricing with tier breakpoints

Built the core types file (`types.ts`) with Zod schemas:

```typescript
export const auditInputSchema = z.object({
  tools: z.array(toolInputSchema).min(1),
  teamSize: z.number().int().min(1),
  primaryUseCase: z.enum(USE_CASES),
});
```

**Key insight:** The audit engine needs to handle two fundamentally different pricing models:
1. **Subscription tools** (Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf): fixed monthly cost per seat
2. **API tools** (Anthropic API, OpenAI API): usage-based, per-token

For subscription tools, the recommendation is straightforward: "you're on Plan X, Plan Y would save you $Z."

For API tools, it's harder. We'd need actual usage data (tokens consumed) to make precise recommendations. For now, I'm taking the monthly spend as input and comparing it against what a subscription tier would cost for equivalent usage.

**Built today:**
- `src/lib/audit-engine/types.ts` — All TypeScript types + Zod schemas
- Started `src/lib/audit-engine/pricing-data.ts` — Official pricing database
- Started `src/lib/audit-engine/calculator.ts` — Core calculation logic

**Decisions made:**
1. Store pricing data as TypeScript constants, not in the database. It changes rarely and I want type safety.
2. Use "monthly spend" as the universal input unit — users know what they're paying, not how many tokens they're consuming.
3. Severity levels: high (>$50/mo savings), medium ($20–50), low ($5–20), optimal (<$5).

**Blockers:**
- Windsurf pricing page was confusing — they recently changed from credits to quotas. Had to cross-reference multiple sources.
- Google Gemini pricing is a labyrinth. Consumer AI Plus/Pro/Ultra tiers are different from Workspace integration. Settled on documenting the consumer tiers since that's what individual devs buy.

---

## Day 3 — Wednesday, May 14, 2026
### Landing Page + Design System

**Hours worked:** 7

**What I did:**

Set up shadcn/ui components and built the landing page. I wanted this to feel like a real product, not a homework assignment.

Installed shadcn/ui:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select badge dialog tooltip
```

**Landing page sections built:**
1. **Hero** — "Your startup is bleeding money on AI tools" with a big CTA button
2. **How It Works** — 3-step visual: Select Tools → Enter Spend → Get Savings
3. **Tool Showcase** — Grid of 8 supported AI tools with logos
4. **FAQ** — Accordion with 6 common questions
5. **Footer CTA** — Secondary conversion point

Design decisions:
- Dark mode default (startups love dark mode, and it looks more premium)
- Geist font (ships with Next.js, clean and technical)
- Accent color: emerald green (money/savings association)
- Minimal animations — this is a utility, not a portfolio site

Wrote 3 hero headline variants and picked the winner through gut feel (no A/B testing yet):
- ❌ "Optimize Your AI Spend" — too corporate, sounds like McKinsey
- ❌ "AI Tool Cost Calculator" — too boring, sounds like a spreadsheet
- ✅ "Your startup is bleeding $2,800/mo on AI tools you don't need" — specific, pain-driven, provocative

**Built today:**
- `src/components/ui/` — shadcn/ui primitives
- `src/components/landing/` — All landing page sections
- `src/app/page.tsx` — Landing page composition
- `src/app/globals.css` — Design tokens and custom styles

**Pain points:**
- Tailwind v4 has some breaking changes from v3. The `@apply` syntax works differently. Burned 30 minutes on this.
- shadcn/ui's dark mode setup with Next.js 15 App Router required some fiddling with the `html` element classes.

---

## Day 4 — Thursday, May 15, 2026
### Audit Wizard + Multi-Step Form State

**Hours worked:** 8

**What I did:**

Built the 3-step audit wizard. This is the core UX of the product and I wanted it to feel smooth.

**Step 1: Tool Selection**
- Grid of 8 AI tool cards with checkboxes
- Each card shows the tool name, icon, and category (IDE / Chatbot / API)
- Selected tools get a green border + checkmark
- Must select at least 1 tool to proceed

**Step 2: Tool Details**
- For each selected tool: plan dropdown, seat count, monthly spend input
- Plan dropdowns are populated from `pricing-data.ts`
- Monthly spend has a currency input with validation (>= $0)
- Seat count defaults to team size but is editable per tool

**Step 3: Team Info**
- Team size (number input)
- Primary use case (dropdown: Coding, Writing, Data, Research, Mixed)
- Submit button with loading state

**Form state management:**
Built a custom `useAuditForm` hook instead of reaching for a form library:

```typescript
const useAuditForm = () => {
  const [step, setStep] = useState(1);
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
  const [toolDetails, setToolDetails] = useState<Map<AITool, ToolInput>>();
  const [teamInfo, setTeamInfo] = useState({ teamSize: 1, useCase: 'coding' });
  // ... navigation, validation, submission
};
```

Why not React Hook Form or Formik? This form has unusual requirements:
- Steps are interdependent (step 2's fields depend on step 1's selections)
- Tool details are a dynamic array (not a fixed form shape)
- I needed fine-grained control over validation per step
- The total code is ~120 lines — a library would add more complexity than it removes

**Built today:**
- `src/app/audit/page.tsx` — Audit wizard page
- `src/components/audit/AuditWizard.tsx` — Wizard container with step navigation
- `src/components/audit/StepToolSelection.tsx` — Tool selection grid
- `src/components/audit/StepToolDetails.tsx` — Per-tool plan/spend inputs
- `src/components/audit/StepTeamInfo.tsx` — Team size + use case
- `src/components/audit/ToolCard.tsx` — Individual tool selection card
- `src/hooks/use-audit-form.ts` — Multi-step form state hook

**Decisions made:**
1. No "back" button on step 1 (there's nowhere to go back to — the landing page is a different route)
2. Auto-fill seat count with team size by default, but allow per-tool override
3. Show a progress bar (1/3, 2/3, 3/3) at the top of the wizard
4. Client-side validation with the same Zod schemas used server-side (single source of truth)

---

## Day 5 — Friday, May 16, 2026
### Results Page + Charts

**Hours worked:** 7

**What I did:**

Built the results page — this is the "aha moment" where users see their potential savings. Needed to make the numbers impossible to ignore.

**Results page sections:**
1. **Summary Card** — Big numbers: "You could save $X,XXX/year" with a severity-colored badge
2. **Spend Breakdown Chart** — Donut chart showing current spend by tool
3. **Savings Waterfall Chart** — Bar chart showing savings per tool recommendation
4. **Recommendation Cards** — Detailed card for each tool with current vs. recommended plan
5. **Overlap Warnings** — Alert banners for detected tool overlaps
6. **AI Summary** — Claude-generated executive summary paragraph
7. **Lead Capture** — Email input to get the full report
8. **Credex CTA** — Conditional, only shown if `credexEligible === true`
9. **Share Button** — Copy shareable URL

**Charts:**
Used Recharts because it's the most React-native charting library and handles responsive layouts well. Considered Chart.js but its React wrapper is clunky.

The spend breakdown donut chart uses tool-specific colors:
- Cursor: blue
- GitHub Copilot: gray
- Claude: orange
- ChatGPT: green
- etc.

The savings waterfall chart is the most impactful visual — it shows each recommendation as a bar, stacked from highest to lowest savings. The total savings bar at the end is highlighted in emerald green.

**Overlap detector logic:**
Finished the overlap detection engine. It catches 4 patterns:

```typescript
const OVERLAP_PATTERNS = [
  { tools: ['cursor', 'github_copilot'], message: 'Cursor and GitHub Copilot both provide AI code completion. Consider keeping only one.' },
  { tools: ['claude', 'chatgpt'], message: 'Claude and ChatGPT serve similar general-purpose AI assistant roles.' },
  { tools: ['anthropic_api', 'claude'], message: 'You\'re paying for both Claude Pro and Anthropic API access. Consider using API-only if you\'re building products.' },
  { tools: ['openai_api', 'chatgpt'], message: 'You\'re paying for both ChatGPT Plus and OpenAI API access.' },
];
```

**Built today:**
- `src/app/results/[id]/page.tsx` — Results page
- `src/components/results/ResultsSummary.tsx` — Big savings number
- `src/components/results/SpendChart.tsx` — Donut chart
- `src/components/results/SavingsChart.tsx` — Waterfall chart
- `src/components/results/RecommendationCard.tsx` — Individual recommendation
- `src/components/results/OverlapWarnings.tsx` — Overlap alert banners
- `src/components/results/LeadCaptureForm.tsx` — Email capture form
- `src/components/results/CredexCTA.tsx` — Credex call-to-action
- `src/components/results/ShareButton.tsx` — Share URL copy button
- `src/lib/audit-engine/overlap-detector.ts` — Overlap detection logic

---

## Day 6 — Saturday, May 17, 2026
### API Routes + Supabase + AI Summary

**Hours worked:** 9

**What I did:**

The longest day. Connected everything together — API routes, database, and Claude integration.

**API Routes built:**

`POST /api/audit` — The main endpoint:
1. Validate input with Zod
2. Run audit engine (calculator + overlap detector + recommendations)
3. Generate a `nanoid(10)` share ID
4. Store in Supabase `audits` table
5. Return the `AuditResult` with `auditId` and `shareId`

`POST /api/lead` — Email capture:
1. Validate with `leadCaptureSchema` (includes honeypot field for bot detection)
2. Store in Supabase `lead_captures` table
3. If Credex-eligible, forward to Credex webhook (fire-and-forget)
4. Return success

`GET /api/share/[id]` — Shared report retrieval:
1. Look up audit by `share_id` in Supabase
2. Return the `AuditResult` or 404

`POST /api/summary` — AI summary generation:
1. Build prompt from `AuditResult`
2. Call Claude Sonnet 4.6 via Anthropic SDK
3. Return summary string
4. On failure, return template-based fallback

**Supabase setup:**
Created the project, ran migrations, set up RLS policies. The free tier gives us 500MB of database and 2GB of transfer — more than enough for launch.

**Claude integration:**
The hardest part was getting the prompt right. Went through 5 iterations (documented in `PROMPTS.md`). The final prompt:
- System: "You are a startup CFO advisor reviewing an AI tool spend audit."
- User: Structured data with current spend, recommendations, and overlap warnings
- Max tokens: 1024 (we want a concise paragraph, not an essay)

**Rate limiting:**
Implemented basic IP-based rate limiting using an in-memory Map. It's not perfect (doesn't survive restarts, doesn't work across Vercel instances) but it's good enough for launch. Would switch to Upstash Redis for production.

**Built today:**
- `src/app/api/audit/route.ts`
- `src/app/api/lead/route.ts`
- `src/app/api/share/[id]/route.ts`
- `src/app/api/summary/route.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/anthropic.ts`
- `src/lib/resend.ts`
- Supabase migrations

**Bugs squashed:**
- Forgot to handle the case where all tools are on their cheapest plan (total savings = $0). Now shows "Your AI stack is already optimized! 🎉"
- The Anthropic SDK needed `node` runtime, not `edge`. Had to add `export const runtime = 'nodejs'` to the summary route.
- Zod's `.optional()` on the honeypot field was allowing any string. Changed to `.max(0)` — if the hidden field has any content, it's a bot.

---

## Day 7 — Tuesday, May 20, 2026
### Polish, Tests, Share Feature, Deploy

**Hours worked:** 10

**What I did:**

Final sprint. Focused on polish, edge cases, testing, and deployment.

**Share feature:**
Built the `/share/[shareId]` page. It reuses the same results components but:
- No lead capture form (you're viewing someone else's report)
- No email report button
- Added "Run your own audit" CTA at the bottom
- OG meta tags for social sharing (title, description, image)

**Testing:**
Wrote tests for the critical paths:
- Audit engine calculator: 12 test cases covering each tool, edge cases (0 spend, 1 seat, max seats)
- Overlap detector: 6 test cases for each overlap pattern + no overlap
- API route validation: 8 test cases for malformed input
- Recommendation severity: 4 test cases for each severity level

Didn't write E2E tests — would need Playwright setup and that's a full day. The unit tests cover the business logic, which is what matters most.

**Polish:**
- Added loading skeleton for the results page (while Claude generates the summary)
- Error boundaries for the results page (if the audit ID doesn't exist)
- 404 page for invalid share IDs
- Mobile responsive pass — the audit wizard and results page work on phones
- Lighthouse audit: 96 Performance, 100 Accessibility, 100 Best Practices, 92 SEO
- Added `robots.txt` and `sitemap.xml`
- Favicons and OG image

**Deployment:**
Pushed to GitHub, connected to Vercel. First deploy failed because I forgot to set `SUPABASE_SERVICE_ROLE_KEY` in Vercel's environment variables. Second deploy succeeded. Total deploy time: ~45 seconds.

**Documentation:**
Wrote all the docs — you're reading them. This took longer than expected. Good documentation is harder than good code.

**Final thoughts:**
The product works. It's not perfect — the pricing data needs regular updates, the AI summary could be better, and there are a dozen features I'd add with more time (CSV export, team sharing, historical tracking). But it solves the core problem: startups can see exactly where they're wasting money on AI tools, in 60 seconds, with zero friction.

The Credex integration is the business model. Every audit that shows >$1,000/year in savings becomes a qualified lead. That's the conversion I care about.

**What I'd do with one more week:**
1. Playwright E2E tests
2. CSV/PDF export
3. Anonymous analytics (PostHog)
4. Email drip sequence for leads
5. A/B test landing page headlines
6. API usage estimation calculator (for API-priced tools)
7. Slack bot that runs audits for teams
