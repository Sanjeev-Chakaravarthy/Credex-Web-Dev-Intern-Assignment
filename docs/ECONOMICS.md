# Unit Economics

> Spreadsheet-style financial model for AISpendLens.
> All numbers are estimates based on current pricing as of May 2026.
> Updated monthly.

---

## Table of Contents

- [Infrastructure Costs](#infrastructure-costs)
- [Cost Per Audit](#cost-per-audit)
- [Revenue Model](#revenue-model)
- [CAC by Channel](#cac-by-channel)
- [LTV Calculation](#ltv-calculation)
- [Break-Even Analysis](#break-even-analysis)
- [Pricing Model Options](#pricing-model-options)
- [Monthly P&L Projections](#monthly-pl-projections)

---

## Infrastructure Costs

### Fixed Monthly Costs

| Service | Plan | Monthly Cost | What It Covers |
|---------|------|-------------|----------------|
| **Vercel** | Hobby → Pro | $0 → $20 | Hosting, CDN, serverless functions |
| **Supabase** | Free → Pro | $0 → $25 | PostgreSQL database, REST API, auth |
| **Domain** | — | $1 | aispendlens.com via Cloudflare/Namecheap |
| **GitHub** | Free | $0 | Source control, CI/CD |

### Variable Monthly Costs

| Service | Unit Cost | Usage at 100/day | Usage at 1K/day | Usage at 10K/day |
|---------|----------|-----------------|----------------|-----------------|
| **Anthropic API** | ~$0.003/audit | $9/mo | $90/mo | $900/mo |
| **Resend** | $0.001/email | $3/mo | $30/mo | $300/mo |
| **Vercel bandwidth** | $0.15/GB | $2/mo | $15/mo | $150/mo |
| **Supabase bandwidth** | $0.09/GB | $1/mo | $9/mo | $90/mo |

### Total Infrastructure Cost by Scale

| Scale | Fixed | Variable | **Total/mo** |
|-------|-------|----------|-------------|
| **Launch (100 audits/day)** | $1 | $15 | **$16/mo** |
| **Traction (1K audits/day)** | $46 | $144 | **$190/mo** |
| **Growth (10K audits/day)** | $46 | $1,440 | **$1,486/mo** |
| **Scale (50K audits/day)** | $46 | $7,200 | **$7,246/mo** |

---

## Cost Per Audit

### Detailed Breakdown (at 1K audits/day)

| Cost Component | Per Audit | % of Total |
|---------------|-----------|-----------|
| **Anthropic API** (Claude Sonnet 4.6, ~800 tokens) | $0.003 | 47% |
| **Vercel compute** (serverless function, ~200ms) | $0.0005 | 8% |
| **Supabase write** (2 inserts: audit + potential lead) | $0.0001 | 2% |
| **Vercel bandwidth** (~50KB response) | $0.0001 | 2% |
| **Resend email** (30% of users request email report) | $0.0003 | 5% |
| **Fixed costs amortized** ($46 / 30K audits/mo) | $0.0015 | 24% |
| **Buffer (20%)** | $0.0008 | 12% |
| **Total cost per audit** | **$0.0063** | 100% |

### Cost Per Audit at Different Scales

| Scale | Cost/Audit | Monthly Total |
|-------|-----------|--------------|
| 100/day | $0.0053 | $16 |
| 1K/day | $0.0063 | $190 |
| 10K/day | $0.0049 | $1,486 |
| 50K/day | $0.0048 | $7,246 |

Cost per audit actually *decreases* at scale because fixed costs are amortized over more audits. The variable cost floor is ~$0.003 (the Claude API call).

### Cost Optimization Levers

| Optimization | Savings | Complexity |
|-------------|---------|-----------|
| **Cache AI summaries** for similar audit profiles | 50-70% of Anthropic costs | Medium |
| **Use Claude Haiku** instead of Sonnet for summaries | 67% of Anthropic costs | Low |
| **Batch API** for email report summaries | 50% of those Anthropic costs | Medium |
| **Skip AI summary** for audits with $0 savings | 10-20% of Anthropic costs | Low |
| **Rate-limit aggressive users** | Prevents abuse | Low |

---

## Revenue Model

### Primary Revenue: Credex Referral Fees

AISpendLens generates revenue by routing high-savings users to Credex for procurement optimization.

**Funnel math:**

| Stage | Rate | Volume at 1K audits/day |
|-------|------|------------------------|
| Audits completed | 100% | 30,000/mo |
| Audits with >$1K/yr savings (Credex-eligible) | 35% | 10,500/mo |
| Users who click Credex CTA | 15% | 1,575/mo |
| Users who complete Credex intake | 30% | 473/mo |
| Users who sign Credex contract | 20% | 95/mo |
| **Revenue per converted lead** | **$100** | — |
| **Monthly revenue** | — | **$9,500/mo** |

### Revenue Sensitivity Analysis

| Credex fee/lead | 50 conversions/mo | 100 conversions/mo | 200 conversions/mo |
|----------------|-------------------|--------------------|--------------------|
| **$50** | $2,500 | $5,000 | $10,000 |
| **$100** | $5,000 | $10,000 | $20,000 |
| **$150** | $7,500 | $15,000 | $30,000 |
| **$200** | $10,000 | $20,000 | $40,000 |

### Secondary Revenue: Premium SaaS (Future)

| Plan | Monthly Price | Target Customers | Estimated Uptake |
|------|--------------|-----------------|------------------|
| **Free** | $0 | Everyone | 95% |
| **Team** | $29/org/mo | 10+ person teams wanting dashboards | 4% |
| **Enterprise** | $99/org/mo | 50+ person orgs wanting integrations | 1% |

At 1,000 active organizations:
- Free: 950 orgs → $0
- Team: 40 orgs × $29 → $1,160/mo
- Enterprise: 10 orgs × $99 → $990/mo
- **Total SaaS revenue: $2,150/mo**

---

## CAC by Channel

### Customer Acquisition Cost

"Customer" = email captured (lead). "Qualified customer" = Credex-eligible lead.

| Channel | Monthly Effort | Monthly Cost | Leads/mo | CAC (per lead) | Qualified leads/mo | CAC (per qualified lead) |
|---------|---------------|-------------|----------|---------------|-------------------|------------------------|
| **Product Hunt** | 10 hrs (one-time) | $0 | 500 (spike) | $0 | 175 | $0 |
| **X/Twitter threads** | 4 hrs/week | $0 | 200 | $0 | 70 | $0 |
| **Reddit** | 2 hrs/week | $0 | 150 | $0 | 52 | $0 |
| **IndieHackers** | 2 hrs/week | $0 | 80 | $0 | 28 | $0 |
| **SEO / Blog** | 8 hrs/week | $0 | 300 (month 3+) | $0 | 105 | $0 |
| **Paid Reddit ads** | 2 hrs/week | $500 | 250 | $2.00 | 87 | $5.75 |
| **Paid Twitter ads** | 2 hrs/week | $1,000 | 400 | $2.50 | 140 | $7.14 |
| **Google Ads** | 4 hrs/week | $2,000 | 500 | $4.00 | 175 | $11.43 |

### Time-Adjusted CAC

If we value founder time at $75/hr:

| Channel | Total Cost ($ + time) | Leads/mo | True CAC |
|---------|----------------------|----------|----------|
| **Product Hunt** | $750 (one-time) | 500 | $1.50 |
| **X/Twitter** | $1,200 | 200 | $6.00 |
| **Reddit** | $600 | 150 | $4.00 |
| **IndieHackers** | $600 | 80 | $7.50 |
| **SEO / Blog** | $2,400 | 300 | $8.00 |

---

## LTV Calculation

### LTV of a Free User (Credex Referral Only)

```
LTV = P(Credex eligible) × P(click CTA) × P(complete intake) × P(convert) × Revenue per conversion

LTV = 0.35 × 0.15 × 0.30 × 0.20 × $100
LTV = $0.315 per audit
```

At $0.0063 cost per audit, the **LTV:CAC ratio is ~50:1** for organic users.

Even if we're more conservative:

| Scenario | Credex Eligible | Click CTA | Intake | Convert | Fee | LTV |
|----------|----------------|-----------|--------|---------|-----|-----|
| **Optimistic** | 40% | 20% | 40% | 25% | $150 | $1.20 |
| **Base** | 35% | 15% | 30% | 20% | $100 | $0.315 |
| **Conservative** | 25% | 10% | 20% | 15% | $75 | $0.056 |

### LTV of a Premium User (Future)

```
LTV = Monthly revenue × Average lifetime (months)

Team plan: $29/mo × 12 months = $348
Enterprise plan: $99/mo × 18 months = $1,782
```

### Blended LTV

At 95% free / 4% Team / 1% Enterprise:
```
Blended LTV = (0.95 × $0.315) + (0.04 × $348) + (0.01 × $1,782)
Blended LTV = $0.30 + $13.92 + $17.82
Blended LTV = $32.04 per user
```

---

## Break-Even Analysis

### Scenario 1: Credex Revenue Only

| Metric | Value |
|--------|-------|
| Monthly infrastructure cost | $190 (at 1K audits/day) |
| Revenue per Credex conversion | $100 |
| Conversions needed to break even | 2/month |
| Audits needed per conversion | ~316 |
| **Audits needed to break even** | **~632/month (~21/day)** |

We break even at just 21 audits/day. That's achievable within the first week of launch.

### Scenario 2: Credex + Premium SaaS

| Monthly Costs | Amount |
|--------------|--------|
| Infrastructure | $190 |
| My time (160 hrs × $75/hr) | $12,000 |
| Marketing spend | $500 |
| **Total monthly cost** | **$12,690** |

| Monthly Revenue Needed | Amount |
|----------------------|--------|
| Credex conversions (at $100) | 100 = $10,000 |
| Team plans (at $29) | 50 = $1,450 |
| Enterprise plans (at $99) | 13 = $1,287 |
| **Total revenue** | **$12,737** |

Break-even with salary at: **100 Credex conversions + 50 Team + 13 Enterprise customers/month**

This requires ~30K audits/month (~1K/day) and is achievable at Month 3–4 with organic growth.

---

## Pricing Model Options

### Option A: Pure Referral (Current)

| Pros | Cons |
|------|------|
| Zero friction — everything is free | Revenue depends entirely on Credex |
| Maximizes audit volume | No recurring revenue |
| Simple to implement | Can't control Credex conversion rates |

### Option B: Freemium SaaS

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Single audits, no account |
| Team | $29/org/mo | Dashboard, history, team management, CSV export |
| Enterprise | $99/org/mo | SSO, API access, Slack bot, PDF reports |

| Pros | Cons |
|------|------|
| Recurring revenue | Adds friction (need auth for Team/Enterprise) |
| Higher LTV per customer | Must build more features |
| Predictable revenue | Competes with Credex CTA for attention |

### Option C: Marketplace Model (Long-Term)

AISpendLens negotiates bulk pricing with AI tool vendors and passes savings to users, taking a 10–15% cut.

| Pros | Cons |
|------|------|
| Massive revenue potential | Requires vendor partnerships |
| Aligned incentives (we save, we earn) | Complex legal/procurement infrastructure |
| Moat from vendor relationships | 6–12 month timeline to establish |

### Recommendation

Start with **Option A** (pure referral). Add **Option B** (freemium SaaS) at Month 3 when we have data on user behavior. Explore **Option C** (marketplace) at Month 9+ if traction justifies the investment.

---

## Monthly P&L Projections

### Month 1 (Launch)

| Line Item | Amount |
|-----------|--------|
| **Revenue** | |
| Credex referrals (10 conversions × $100) | $1,000 |
| **Total Revenue** | **$1,000** |
| **Costs** | |
| Infrastructure | $16 |
| Marketing (time: 40 hrs × $75) | $3,000 |
| Development (time: 80 hrs × $75) | $6,000 |
| **Total Costs** | **$9,016** |
| **Net** | **-$8,016** |

### Month 3 (Traction)

| Line Item | Amount |
|-----------|--------|
| **Revenue** | |
| Credex referrals (50 × $100) | $5,000 |
| Team plans (20 × $29) | $580 |
| **Total Revenue** | **$5,580** |
| **Costs** | |
| Infrastructure | $190 |
| Marketing (time + spend) | $2,500 |
| Development (time: 60 hrs × $75) | $4,500 |
| **Total Costs** | **$7,190** |
| **Net** | **-$1,610** |

### Month 6 (Growth)

| Line Item | Amount |
|-----------|--------|
| **Revenue** | |
| Credex referrals (150 × $100) | $15,000 |
| Team plans (80 × $29) | $2,320 |
| Enterprise plans (10 × $99) | $990 |
| **Total Revenue** | **$18,310** |
| **Costs** | |
| Infrastructure | $1,486 |
| Marketing (time + spend) | $3,000 |
| Development (hire: $8,000) | $8,000 |
| **Total Costs** | **$12,486** |
| **Net** | **+$5,824** |

### Month 12 (Scale)

| Line Item | Amount |
|-----------|--------|
| **Revenue** | |
| Credex referrals (400 × $100) | $40,000 |
| Team plans (200 × $29) | $5,800 |
| Enterprise plans (30 × $99) | $2,970 |
| **Total Revenue** | **$48,770** |
| **Costs** | |
| Infrastructure | $4,000 |
| Marketing (team + spend) | $8,000 |
| Development (2 engineers) | $20,000 |
| Operations | $2,000 |
| **Total Costs** | **$34,000** |
| **Net** | **+$14,770** |

---

> **Disclaimer:** These projections are estimates based on assumed conversion rates and growth curves. Actual results will vary. The model should be updated monthly with real data once launched.
