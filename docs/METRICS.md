# Metrics & KPIs

> What we measure, why, and how. If we can't measure it, we can't improve it.

---

## Table of Contents

- [Core Funnel Metrics](#core-funnel-metrics)
- [Engagement Metrics](#engagement-metrics)
- [Revenue Metrics](#revenue-metrics)
- [Technical Metrics](#technical-metrics)
- [Analytics Implementation Plan](#analytics-implementation-plan)
- [Dashboard Design](#dashboard-design)
- [Alerting](#alerting)

---

## Core Funnel Metrics

This is the primary funnel. Every stage should be tracked and optimized.

```
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 1: VISIT                                                      │
│ Unique visitors to aispendlens.com                                  │
│ Target: 10,000/mo (Month 3)                                        │
├────────────────────────────────────────────────────────────────────┤
│                          ↓ 40% conversion                           │
├─────────────────────────────────────────────────────────────────────┤
│ STAGE 2: START AUDIT                                                │
│ Users who click "Audit My AI Spend" and reach the wizard            │
│ Target: 4,000/mo                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                          ↓ 70% completion                           │
├─────────────────────────────────────────────────────────────────────┤
│ STAGE 3: COMPLETE AUDIT                                             │
│ Users who submit the wizard and see results                         │
│ Target: 2,800/mo                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                          ↓ 30% capture                              │
├─────────────────────────────────────────────────────────────────────┤
│ STAGE 4: EMAIL CAPTURE                                              │
│ Users who enter email on results page                               │
│ Target: 840/mo                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                          ↓ 35% eligible                             │
├─────────────────────────────────────────────────────────────────────┤
│ STAGE 5: CREDEX ELIGIBLE                                            │
│ Users with >$1,000/year in identified savings                       │
│ Target: 294/mo                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                          ↓ 15% click                                │
├─────────────────────────────────────────────────────────────────────┤
│ STAGE 6: CREDEX CLICK                                               │
│ Users who click the Credex CTA                                      │
│ Target: 44/mo                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                          ↓ 30% convert                              │
├─────────────────────────────────────────────────────────────────────┤
│ STAGE 7: CREDEX CONVERSION                                         │
│ Users who sign a Credex contract                                    │
│ Target: 13/mo                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Funnel Metric Definitions

| Metric | Definition | How Measured | Target |
|--------|-----------|-------------|--------|
| **Visit → Start Rate** | % of visitors who click "Audit My AI Spend" | Event: `audit_started` | >40% |
| **Wizard Completion Rate** | % of audit starts that reach results | Event: `audit_completed` | >70% |
| **Email Capture Rate** | % of completed audits that capture email | Event: `email_captured` | >30% |
| **Credex Eligibility Rate** | % of audits with >$1K/yr savings | Calculated from `AuditResult.credexEligible` | >35% |
| **Credex CTR** | % of eligible users who click CTA | Event: `credex_cta_clicked` | >15% |
| **Credex Conversion Rate** | % of CTA clicks that become Credex customers | Webhook from Credex | >30% |

### Wizard Step Drop-Off

| Step | Expected Completion | Warning Threshold |
|------|-------------------|-------------------|
| Step 1 → Step 2 (Tool Selection → Details) | 90% | <80% |
| Step 2 → Step 3 (Details → Team Info) | 85% | <75% |
| Step 3 → Submit (Team Info → Results) | 92% | <85% |

If any step drops below its warning threshold, investigate UX issues at that step.

---

## Engagement Metrics

### User Engagement

| Metric | Definition | Target | Why It Matters |
|--------|-----------|--------|---------------|
| **Time on Results Page** | Avg. seconds spent viewing results | >45s | Longer = more engagement with recommendations |
| **Recommendations Expanded** | % of recommendation cards clicked/expanded | >60% | Shows users are reading details, not just the summary |
| **Summary Read Rate** | % of users who scroll past the AI summary | >80% | Validates the AI summary feature |
| **Share Rate** | % of completed audits that generate a share link | >10% | Key viral mechanic |
| **Return Visit Rate** | % of users who return within 30 days | >5% | Signal for future SaaS subscription |
| **Tools Per Audit** | Avg. number of tools selected per audit | 2.5–4.0 | Below 2 suggests users don't understand the value |
| **Avg. Monthly Spend Input** | Avg. total monthly spend entered | $200–$2,000 | Too low = not our target persona |

### Content Engagement (Post-Launch)

| Metric | Definition | Target |
|--------|-----------|--------|
| **Blog post views** | Unique views per post | 500+/post |
| **Blog → Audit conversion** | % of blog readers who start an audit | >5% |
| **X/Twitter thread impressions** | Impressions per thread | 10K+ |
| **X/Twitter thread → site visits** | Click-through rate | >2% |

---

## Revenue Metrics

| Metric | Definition | Target (Month 3) | Target (Month 6) |
|--------|-----------|-----------------|-----------------|
| **Monthly Credex Referrals** | Leads sent to Credex | 50 | 150 |
| **Credex Conversion Rate** | % of referrals that convert | 20% | 25% |
| **Revenue Per Referral** | $ earned per Credex conversion | $100 | $120 |
| **Monthly Referral Revenue** | Total from Credex | $1,000 | $4,500 |
| **MRR (SaaS)** | Recurring revenue from premium plans | $0 | $2,000 |
| **Total Monthly Revenue** | Referral + SaaS | $1,000 | $6,500 |
| **ARPU** | Revenue per audit | $0.33 | $0.33 |
| **Revenue per Lead** | Revenue per email captured | $1.19 | $1.08 |

### Revenue Unit Economics

| Metric | Calculation | Value |
|--------|-----------|-------|
| **Cost Per Audit** | Infrastructure / Audits | $0.006 |
| **Revenue Per Audit** | Total Revenue / Audits | $0.33 |
| **Gross Margin Per Audit** | (Revenue - Cost) / Revenue | 98.2% |
| **LTV (free user)** | See [ECONOMICS.md](ECONOMICS.md) | $0.315 |
| **LTV:CAC (organic)** | $0.315 / $0.006 | 52.5:1 |

---

## Technical Metrics

### Performance (Lighthouse)

| Metric | Target | Current | Alert Threshold |
|--------|--------|---------|----------------|
| **Performance Score** | >90 | 96 | <85 |
| **LCP** (Largest Contentful Paint) | <2.5s | 1.2s | >3.0s |
| **INP** (Interaction to Next Paint) | <200ms | 80ms | >300ms |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.02 | >0.15 |
| **Accessibility Score** | 100 | 100 | <95 |
| **Best Practices Score** | 100 | 100 | <90 |
| **SEO Score** | >90 | 92 | <85 |

### API Performance

| Endpoint | P50 Latency | P99 Latency | Error Rate Target |
|----------|------------|------------|-------------------|
| `POST /api/audit` | <200ms | <500ms | <0.1% |
| `POST /api/lead` | <100ms | <300ms | <0.1% |
| `GET /api/share/[id]` | <150ms | <400ms | <0.5% |
| `POST /api/summary` | <3s | <8s | <2% (Claude can be slow) |

### Uptime

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Overall uptime** | 99.9% | Vercel status + custom health check |
| **API uptime** | 99.9% | Custom health endpoint |
| **Claude API availability** | 99.5% | Track summary fallback rate |
| **Summary fallback rate** | <5% | % of summaries using template vs. Claude |

### Error Tracking

| Error Category | Alert Threshold | Action |
|---------------|----------------|--------|
| **Zod validation errors** | >5% of requests | Review input patterns, update validation |
| **Supabase write failures** | Any | Check connection, RLS policies |
| **Anthropic API errors** | >10% of summary requests | Check rate limits, API key, fallback working |
| **Resend email failures** | >5% of email sends | Check Resend status, domain verification |
| **Client-side JS errors** | >1% of sessions | Sentry or equivalent |

---

## Analytics Implementation Plan

### Phase 1: Launch (Week 1)

**Tool:** Custom event tracking via Supabase or lightweight analytics

| Event | Properties | Where Tracked |
|-------|-----------|---------------|
| `page_view` | `path`, `referrer`, `utm_source` | All pages |
| `audit_started` | `source` (landing page CTA, nav, etc.) | Audit wizard mount |
| `tool_selected` | `tool_name`, `step_number` | Step 1 |
| `audit_step_completed` | `step_number`, `duration_ms` | Each step |
| `audit_completed` | `total_spend`, `total_savings`, `tool_count`, `credex_eligible` | Results page load |
| `email_captured` | `has_company`, `has_role`, `audit_id` | Lead form submit |
| `credex_cta_clicked` | `annual_savings`, `audit_id` | Credex CTA click |
| `share_link_created` | `share_id`, `audit_id` | Share button click |
| `share_link_viewed` | `share_id` | Share page load |

### Phase 2: Growth (Month 2)

**Tool:** PostHog (self-hosted or cloud)

**Additional tracking:**
- Session recordings (10% sample)
- Heatmaps on landing page and results page
- Funnel analysis with automatic drop-off detection
- Cohort analysis (by referral source)
- Feature flags for A/B testing

### Phase 3: Scale (Month 4+)

**Additional tools:**
- **Plausible or Fathom** for privacy-friendly public analytics
- **Sentry** for error tracking and performance monitoring
- **Vercel Analytics** for Core Web Vitals monitoring
- **Custom Supabase dashboard** for business metrics

### Implementation Code

```typescript
// lib/analytics.ts
type AnalyticsEvent =
  | { name: 'page_view'; properties: { path: string; referrer?: string } }
  | { name: 'audit_started'; properties: { source: string } }
  | { name: 'tool_selected'; properties: { tool: string } }
  | { name: 'audit_step_completed'; properties: { step: number; duration_ms: number } }
  | { name: 'audit_completed'; properties: { total_spend: number; total_savings: number; tool_count: number; credex_eligible: boolean } }
  | { name: 'email_captured'; properties: { audit_id: string } }
  | { name: 'credex_cta_clicked'; properties: { annual_savings: number } }
  | { name: 'share_link_created'; properties: { share_id: string } };

export function track(event: AnalyticsEvent): void {
  // Phase 1: Store in Supabase
  if (typeof window !== 'undefined') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {}); // Fire and forget — analytics should never block UX
  }
}
```

---

## Dashboard Design

### Executive Dashboard (Weekly Review)

```
┌─────────────────────────────────────────────────────────┐
│                    AISPENDLENS DASHBOARD                 │
│                    Week of May 19, 2026                  │
├──────────────┬──────────────┬──────────────┬────────────┤
│   AUDITS     │    LEADS     │   REVENUE    │   HEALTH   │
│   2,450      │     735      │   $1,200     │   99.9%    │
│   +12% WoW   │   +8% WoW   │  +15% WoW   │   uptime   │
├──────────────┴──────────────┴──────────────┴────────────┤
│                                                          │
│  FUNNEL THIS WEEK                                        │
│  ┌──────────────────────────────────┐ 10,000 visitors    │
│  └──────────────────────────────┐    4,000 audit starts  │
│  └──────────────────────────┐        2,450 completed     │
│  └──────────────────────┐            735 emails          │
│  └──────────────────┐                257 Credex eligible  │
│  └──────────────┐                    39 Credex clicks     │
│  └──────────┐                        12 conversions       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  TOP REFERRAL SOURCES                                    │
│  1. Direct / X.com       — 3,200 visits (32%)           │
│  2. Reddit               — 2,500 visits (25%)           │
│  3. Google Search        — 1,800 visits (18%)           │
│  4. Product Hunt         — 1,200 visits (12%)           │
│  5. IndieHackers         — 800 visits (8%)              │
├──────────────────────────────────────────────────────────┤
│  AVERAGE AUDIT PROFILE                                   │
│  • Tools per audit: 3.2                                  │
│  • Avg monthly spend: $1,450                            │
│  • Avg savings found: $340/mo                           │
│  • Most common overlap: Cursor + Copilot (28%)          │
│  • Most common tool: GitHub Copilot (72% of audits)     │
└──────────────────────────────────────────────────────────┘
```

### Operational Dashboard (Daily Check)

| Metric | Yesterday | 7-Day Avg | Trend |
|--------|----------|-----------|-------|
| Audits completed | 350 | 320 | ↑ |
| Wizard completion rate | 72% | 71% | → |
| Email capture rate | 31% | 30% | → |
| Claude API success rate | 97% | 96% | → |
| P50 audit latency | 180ms | 195ms | ↑ |
| Error rate | 0.02% | 0.05% | ↑ |

---

## Alerting

### Critical Alerts (Page immediately)

| Condition | Alert | Channel |
|-----------|-------|---------|
| API error rate > 5% for 5 min | 🔴 API Error Spike | SMS + Slack |
| Supabase write failures > 0 | 🔴 Database Down | SMS + Slack |
| Site down (health check fails 3×) | 🔴 Site Outage | SMS + Slack |
| Claude fallback rate > 50% | 🔴 Anthropic API Down | Slack |

### Warning Alerts (Check within 4 hours)

| Condition | Alert | Channel |
|-----------|-------|---------|
| Wizard completion rate < 60% for 24hr | 🟡 UX Drop-off | Slack |
| Email capture rate < 20% for 24hr | 🟡 Lead Gen Drop | Slack |
| P99 audit latency > 1s for 1hr | 🟡 Latency Spike | Slack |
| Claude fallback rate > 20% for 1hr | 🟡 Summary Degradation | Slack |

### Informational (Weekly review)

| Condition | Alert | Channel |
|-----------|-------|---------|
| Traffic up/down > 30% WoW | ℹ️ Traffic Change | Email |
| New referral source > 100 visits | ℹ️ New Channel | Email |
| Credex conversion rate change > 10% | ℹ️ Revenue Signal | Email |

---

## North Star Metric

**Qualified Credex Leads Per Month**

This is the single metric that captures everything:
- It requires visitors (marketing is working)
- It requires audit completions (product is working)
- It requires significant savings (audit engine is accurate)
- It generates revenue (business model is working)

Everything else is a supporting metric that ladders up to this one.

| Timeline | Target |
|----------|--------|
| Month 1 | 50 |
| Month 3 | 200 |
| Month 6 | 500 |
| Month 12 | 1,500 |
