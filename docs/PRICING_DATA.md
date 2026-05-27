# AI Tool Pricing Data

> Official pricing for all AI tools supported by AISpendLens.
> **Last verified: May 20, 2026**
>
> ⚠️ AI tool pricing changes frequently. This document should be re-verified monthly.
> All prices are in USD. Monthly billing unless noted otherwise.

---

## Table of Contents

- [Cursor](#cursor)
- [GitHub Copilot](#github-copilot)
- [Claude (Consumer)](#claude-consumer)
- [ChatGPT](#chatgpt)
- [Anthropic API](#anthropic-api)
- [OpenAI API](#openai-api)
- [Google Gemini](#google-gemini)
- [Windsurf](#windsurf)
- [Pricing Comparison Matrix](#pricing-comparison-matrix)
- [Changelog](#changelog)

---

## Cursor

**Category:** AI-powered IDE
**Source:** [cursor.com/pricing](https://cursor.com/pricing)
**Verified:** May 20, 2026

Cursor switched to a credit-based billing system in June 2025. All paid plans include a monthly credit pool equal to the dollar value of the subscription. "Auto" mode provides unlimited usage by auto-selecting cost-efficient models; manually selecting premium frontier models draws from your credit pool.

| Plan | Monthly Price | Per-Seat? | Key Features |
|------|--------------|-----------|-------------|
| **Hobby** | Free | No | Limited AI usage, 2-week trial of Pro features |
| **Pro** | $20/mo | No | $20 credit pool, unlimited Auto mode, all frontier models |
| **Pro+** | $60/mo | No | ~$70 credit pool (3× Pro), unlimited Auto mode |
| **Ultra** | $200/mo | No | 20× Pro credits, unlimited Auto mode |
| **Teams** | $40/user/mo | Yes | Everything in Pro + shared rules, centralized billing, usage analytics, SSO (SAML/OIDC) |
| **Enterprise** | Custom | Yes | Everything in Teams + advanced admin controls, pooled usage, audit logs, priority support |

**Notes:**
- Annual billing saves ~20% on all paid tiers
- Pay-as-you-go overages available when credit pool is exhausted
- Bugbot is priced separately ($40/user/mo for Bugbot Pro)

---

## GitHub Copilot

**Category:** AI code completion (IDE extension)
**Source:** [github.com/features/copilot#pricing](https://github.com/features/copilot#pricing) · [GitHub Blog: Usage-based billing](https://github.blog/changelog/2026-05-14-usage-based-billing-for-github-copilot/)
**Verified:** May 20, 2026

GitHub Copilot transitioned to usage-based billing with AI Credits effective June 1, 2026. Code completions and Next Edit Suggestions remain unlimited on paid plans and do not consume credits.

### Individual Plans

| Plan | Monthly Price | Included Usage | Key Features |
|------|--------------|----------------|-------------|
| **Free** | $0 | Limited | Limited code completions, limited AI usage |
| **Pro** | $10/mo | $15 total ($10 base + $5 flex) | Unlimited code completions, Chat, CLI access |
| **Pro+** | $39/mo | $70 total ($39 base + $31 flex) | Everything in Pro + premium models, extended context |
| **Max** | $100/mo | $200 total ($100 base + $100 flex) | Everything in Pro+ + highest limits, priority access |

### Business & Enterprise Plans

| Plan | Monthly Price | Per-User Credits | Key Features |
|------|--------------|-----------------|-------------|
| **Business** | $19/user/mo | $19/user | Organization-level policies, SSO, audit logs, IP indemnity |
| **Enterprise** | $39/user/mo | $39/user | Everything in Business + pooled org credits, fine-tuned models, GHEC required |

**Notes:**
- 1 AI Credit = $0.01 USD
- Unused credits pool at organization level for Business/Enterprise
- New sign-ups for Pro and Pro+ were temporarily paused in April 2026

---

## Claude (Consumer)

**Category:** AI assistant (chatbot)
**Source:** [anthropic.com/pricing](https://anthropic.com/pricing) · [claude.ai/pricing](https://claude.ai/pricing)
**Verified:** May 20, 2026

### Individual Plans

| Plan | Monthly Price | Usage Level | Key Features |
|------|--------------|-------------|-------------|
| **Free** | $0 | Basic, daily limits | Web, desktop, mobile access |
| **Pro** | $20/mo | ~5× Free usage | Claude Code, Projects, priority access |
| **Max 5×** | $100/mo | 5× Pro usage | Priority access, higher output limits |
| **Max 20×** | $200/mo | 20× Pro usage | Highest output limits |

### Team Plans

| Plan | Monthly Price | Key Features |
|------|--------------|-------------|
| **Team Standard** | $25/seat/mo ($20/seat annual) | Centralized management, 5+ users, shared workspaces |
| **Team Premium** | $125/seat/mo ($100/seat annual) | Full Claude Code/agent access |

### Enterprise

| Plan | Monthly Price | Key Features |
|------|--------------|-------------|
| **Enterprise** | Custom (starts ~$20/seat + usage) | SSO, SCIM, audit logs, HIPAA readiness, 500K+ token context |

**Notes:**
- Annual billing saves ~15–20% on Pro and Team plans
- Starting June 15, 2026: programmatic usage (Agent SDK, `claude -p`, GitHub Actions) is billed separately from interactive usage
- Pro includes $20/mo credit for programmatic usage

---

## ChatGPT

**Category:** AI assistant (chatbot)
**Source:** [openai.com/chatgpt/pricing](https://openai.com/chatgpt/pricing)
**Verified:** May 20, 2026

| Plan | Monthly Price | Per-Seat? | Key Features |
|------|--------------|-----------|-------------|
| **Free** | $0 | No | GPT-5.3 Instant, 10 messages/5hr window, ad-supported (US) |
| **Go** | $8/mo | No | Higher message limits, file uploads, image creation, Custom GPTs |
| **Plus** | $20/mo | No | GPT-5.5, Advanced Voice, Sora, 10 Deep Research runs/mo, Codex, ad-free |
| **Pro ($100)** | $100/mo | No | 5× Plus limits, GPT-5.5 Pro, o1 Pro |
| **Pro ($200)** | $200/mo | No | 20× Plus limits, ~1M token context, 250 Deep Research runs/mo |
| **Business** | $25/seat/mo (monthly) / $20/seat/mo (annual) | Yes | Everything in Plus + shared workspaces, admin controls, SAML SSO/MFA, 60+ app integrations, data excluded from training |
| **Enterprise** | Custom | Yes | 150+ seats typical, advanced security, dedicated support |

**Notes:**
- Business plan requires minimum 2 seats
- No annual billing option for individual Plus plan
- Enterprise requires direct sales engagement

---

## Anthropic API

**Category:** API (usage-based)
**Source:** [anthropic.com/pricing](https://anthropic.com/pricing) · [docs.anthropic.com/en/docs/about-claude/models](https://docs.anthropic.com/en/docs/about-claude/models)
**Verified:** May 20, 2026

Pricing is per million tokens (MTok). Output tokens are priced at 5× input tokens across all models.

### Standard API Pricing

| Model | Input (per MTok) | Output (per MTok) | Context Window |
|-------|-----------------|-------------------|----------------|
| **Claude Opus 4.7** | $5.00 | $25.00 | 1M tokens |
| **Claude Opus 4.6** | $5.00 | $25.00 | 200K tokens |
| **Claude Sonnet 4.6** | $3.00 | $15.00 | 200K tokens |
| **Claude Haiku 4.5** | $1.00 | $5.00 | 200K tokens |

### Cost Optimization

| Feature | Discount | Details |
|---------|----------|---------|
| **Batch API** | 50% off | 24-hour turnaround for async workloads |
| **Prompt Caching** | 90% off cached input | Cache hits cost ~10% of standard input |
| **Extended Caching (1hr)** | Varies | Higher write cost, lower read cost |

**Notes:**
- No long-context surcharges (eliminated March 2026)
- US-only data residency may incur 1.1× multiplier
- Batch Sonnet 4.6: $1.50 input / $7.50 output per MTok

### Monthly Cost Estimate for AISpendLens

Our audit summary uses Claude Sonnet 4.6. Per audit:
- System prompt: ~500 tokens input
- Audit data: ~300 tokens input
- Summary output: ~200 tokens
- Cost per audit: ~$0.003
- At 1,000 audits/day: ~$90/month

---

## OpenAI API

**Category:** API (usage-based)
**Source:** [openai.com/api/pricing](https://openai.com/api/pricing)
**Verified:** May 20, 2026

### Current Models

| Model | Input (per MTok) | Output (per MTok) | Context Window |
|-------|-----------------|-------------------|----------------|
| **GPT-4.1** | $2.00 | $8.00 | 1M tokens |
| **GPT-4.1 Mini** | $0.40 | $1.60 | 1M tokens |
| **GPT-4.1 Nano** | $0.10 | $0.40 | 1M tokens |
| **GPT-4o** | $2.50 | $10.00 | 128K tokens |
| **GPT-4o Mini** | $0.15 | $0.60 | 128K tokens |
| **o1** | $15.00 | $60.00 | 200K tokens |
| **o1 Mini** | $1.10 | $4.40 | 128K tokens |

### Cost Optimization

| Feature | Discount | Details |
|---------|----------|---------|
| **Prompt Caching** | 50–90% off input | Automatic for repeated context |
| **Batch API** | 50% off | 24-hour turnaround |
| **Model Routing** | Variable | Use Nano/Mini for simple tasks, GPT-4.1 for complex |

**Notes:**
- Pricing varies by API tier (Standard, Batch, Flex, Priority)
- Prompt caching is automatic — no setup required
- Fine-tuned model pricing varies

---

## Google Gemini

**Category:** AI assistant (chatbot) / Workspace integration
**Source:** [one.google.com/about/plans](https://one.google.com/about/plans) · [workspace.google.com/pricing](https://workspace.google.com/pricing)
**Verified:** May 20, 2026

### Consumer Plans (Google AI Subscriptions)

| Plan | Monthly Price | Key Features |
|------|--------------|-------------|
| **Free** | $0 | Basic Gemini access, daily limits |
| **AI Plus (200GB)** | $7.99/mo | Gemini Advanced, 200GB storage |
| **AI Plus (2TB)** | $9.99/mo | Gemini Advanced, 2TB storage |
| **AI Pro (5TB)** | $19.99/mo | Gemini Pro, 5TB storage, 4× higher limits |
| **AI Pro (10TB)** | $49.99/mo | Gemini Pro, 10TB storage |
| **AI Ultra (20TB)** | $99.99/mo | Up to 5× Pro limits, Deep Think, Veo |
| **AI Ultra (30TB)** | $199.99/mo | Up to 20× Pro limits |

### Google Workspace (Business Plans — Gemini Included)

| Plan | Monthly Price | Key Features |
|------|--------------|-------------|
| **Business Starter** | ~$8.40/user/mo | Basic Gemini in Gmail |
| **Business Standard** | ~$16.80/user/mo | Full Gemini AI suite (Docs, Sheets, Slides, Meet) |
| **Business Plus** | ~$26.40/user/mo | Everything in Standard + advanced security/compliance |

**Notes:**
- Gemini AI features are now included in all paid Workspace plans (as of Jan 2025)
- Separate "Gemini Business" and "Gemini Enterprise" add-ons have been discontinued
- Annual billing typically saves ~15%

---

## Windsurf

**Category:** AI-powered IDE
**Source:** [windsurf.com/pricing](https://windsurf.com/pricing)
**Verified:** May 20, 2026

Windsurf transitioned from a credit-based system to a quota-based system in early 2026. Usage now has daily and weekly refresh cycles.

| Plan | Monthly Price | Per-Seat? | Key Features |
|------|--------------|-----------|-------------|
| **Free** | $0 | No | Limited AI usage, IDE access |
| **Pro** | $20/mo | No | Standard access to premium AI models, daily/weekly quotas |
| **Teams** | $40/user/mo | Yes | Centralized billing, admin dashboard, usage analytics, priority support |
| **Max** | $200/mo | No | Highest daily/weekly quotas for power users |
| **Enterprise** | Custom (starts ~$60/user) | Yes | Highest quotas, RBAC, SSO, SCIM, SOC 2/FedRAMP |

**Notes:**
- Previous credit-based system has been replaced by quota-based system
- Daily and weekly usage limits refresh periodically (can't burn through a month's allocation in one day)
- Enterprise pricing varies; $60/user/mo is a common starting point for smaller deployments

---

## Pricing Comparison Matrix

### Subscription Tools — Individual Plans

| Tool | Free | Budget | Standard | Power |
|------|------|--------|----------|-------|
| **Cursor** | $0 | — | $20 (Pro) | $200 (Ultra) |
| **GitHub Copilot** | $0 | $10 (Pro) | $39 (Pro+) | $100 (Max) |
| **Claude** | $0 | — | $20 (Pro) | $200 (Max 20×) |
| **ChatGPT** | $0 | $8 (Go) | $20 (Plus) | $200 (Pro $200) |
| **Gemini** | $0 | $7.99 (AI Plus) | $19.99 (AI Pro) | $199.99 (AI Ultra) |
| **Windsurf** | $0 | — | $20 (Pro) | $200 (Max) |

### Subscription Tools — Team/Business Plans (Per Seat)

| Tool | Team Tier | Enterprise Tier |
|------|-----------|----------------|
| **Cursor** | $40/seat | Custom |
| **GitHub Copilot** | $19/seat | $39/seat |
| **Claude** | $25/seat | Custom |
| **ChatGPT** | $25/seat | Custom |
| **Gemini** | $16.80/seat (Workspace Standard) | $26.40/seat (Workspace Plus) |
| **Windsurf** | $40/seat | ~$60/seat |

### API Tools — Key Models

| Provider | Budget Model | Standard Model | Premium Model |
|----------|-------------|----------------|---------------|
| **Anthropic** | Haiku 4.5: $1/$5 | Sonnet 4.6: $3/$15 | Opus 4.7: $5/$25 |
| **OpenAI** | GPT-4.1 Nano: $0.10/$0.40 | GPT-4.1: $2/$8 | o1: $15/$60 |

*(Prices shown as input/output per MTok)*

---

## Changelog

| Date | Change |
|------|--------|
| May 20, 2026 | Initial pricing research and documentation |
| — | GitHub Copilot credit-based billing verified (effective June 1, 2026) |
| — | Windsurf quota-based pricing confirmed (transitioned from credits) |
| — | Google Gemini restructured tiers verified (AI Plus/Pro/Ultra) |
| — | Claude programmatic billing change noted (effective June 15, 2026) |

---

> **Maintenance note:** This file should be re-verified against official pricing pages on the 1st of each month. Set a calendar reminder. If a pricing page changes, update both this document AND `src/lib/audit-engine/pricing-data.ts`.
