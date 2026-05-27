# Architecture

> System architecture for AISpendLens — an AI spend audit tool for startups.

---

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Request Flow](#request-flow)
- [Component Hierarchy](#component-hierarchy)
- [Data Model](#data-model)
- [API Route Map](#api-route-map)
- [Audit Engine Pipeline](#audit-engine-pipeline)
- [AI Summary Pipeline](#ai-summary-pipeline)
- [Infrastructure](#infrastructure)
- [Key Design Decisions](#key-design-decisions)

---

## High-Level Overview

```mermaid
graph TB
    subgraph Client["Browser (Next.js Client)"]
        LP["Landing Page"]
        AW["Audit Wizard"]
        RP["Results Page"]
        SP["Share Page"]
    end

    subgraph Server["Next.js API Routes (Edge/Node)"]
        AA["/api/audit"]
        AL["/api/lead"]
        AS["/api/share/[id]"]
        ASM["/api/summary"]
    end

    subgraph Engine["Audit Engine (Pure TypeScript)"]
        PD["Pricing Database"]
        CALC["Calculator"]
        OD["Overlap Detector"]
        REC["Recommendation Engine"]
    end

    subgraph External["External Services"]
        SB["Supabase (PostgreSQL)"]
        CL["Anthropic Claude API"]
        RS["Resend (Email)"]
        CX["Credex (Partner)"]
    end

    LP -->|"Start Audit"| AW
    AW -->|"POST /api/audit"| AA
    AA --> Engine
    Engine -->|"Calculate"| AA
    AA -->|"Store result"| SB
    AA -->|"Return result"| RP
    RP -->|"POST /api/summary"| ASM
    ASM -->|"Generate summary"| CL
    RP -->|"POST /api/lead"| AL
    AL -->|"Store lead"| SB
    AL -->|"Forward lead"| CX
    RP -->|"Email report"| RS
    SP -->|"GET /api/share/[id]"| AS
    AS -->|"Fetch audit"| SB
```

---

## Request Flow

This is the complete user journey from landing to conversion:

```mermaid
sequenceDiagram
    actor U as User
    participant L as Landing Page
    participant W as Audit Wizard
    participant API as /api/audit
    participant E as Audit Engine
    participant DB as Supabase
    participant R as Results Page
    participant AI as Claude API
    participant Lead as /api/lead
    participant CX as Credex

    U->>L: Visit aispendlens.com
    L->>W: Click "Audit My AI Spend"

    Note over W: Step 1: Select AI tools
    Note over W: Step 2: Enter plans + spend per tool
    Note over W: Step 3: Team size + use case

    W->>API: POST /api/audit (AuditInput)
    API->>API: Validate with Zod schema
    API->>E: calculateAudit(input)

    E->>E: Look up pricing for each tool
    E->>E: Compare current vs. optimal plan
    E->>E: Detect tool overlaps
    E->>E: Generate recommendations
    E->>E: Calculate savings + Credex eligibility

    E-->>API: AuditResult
    API->>DB: INSERT INTO audits
    API-->>R: Return AuditResult + auditId

    R->>AI: POST /api/summary (auditResult)
    AI-->>R: Executive summary paragraph

    Note over R: User sees results, charts, recommendations

    U->>R: Enter email (optional)
    R->>Lead: POST /api/lead (email, auditId)
    Lead->>DB: INSERT INTO lead_captures
    Lead->>CX: Forward lead (if Credex eligible)

    U->>R: Click "Share Report"
    R-->>U: Copy shareable URL
```

---

## Component Hierarchy

```mermaid
graph TD
    subgraph Root["RootLayout"]
        subgraph Pages["Pages"]
            LP["LandingPage"]
            AP["AuditPage"]
            RP["ResultsPage"]
            SHP["SharePage"]
        end
    end

    subgraph LandingComponents["Landing Page Components"]
        Hero["HeroSection"]
        HW["HowItWorks"]
        Tools["ToolShowcase"]
        FAQ["FAQSection"]
        CTA["CTASection"]
    end

    subgraph AuditComponents["Audit Wizard Components"]
        WZ["AuditWizard"]
        S1["StepToolSelection"]
        S2["StepToolDetails"]
        S3["StepTeamInfo"]
        TC["ToolCard"]
        PL["PlanSelector"]
        SI["SpendInput"]
        PB["ProgressBar"]
    end

    subgraph ResultsComponents["Results Page Components"]
        RS["ResultsSummary"]
        SC["SpendChart"]
        SV["SavingsChart"]
        RL["RecommendationList"]
        RC["RecommendationCard"]
        OW["OverlapWarnings"]
        LC["LeadCaptureForm"]
        CC["CredexCTA"]
        SHR["ShareButton"]
        AIS["AISummaryCard"]
    end

    subgraph UIComponents["shadcn/ui Primitives"]
        BTN["Button"]
        INP["Input"]
        SL["Select"]
        CRD["Card"]
        DLG["Dialog"]
        TT["Tooltip"]
        BD["Badge"]
    end

    LP --> LandingComponents
    AP --> AuditComponents
    RP --> ResultsComponents
    SHP --> ResultsComponents

    AuditComponents --> UIComponents
    ResultsComponents --> UIComponents
    LandingComponents --> UIComponents
```

---

## Data Model

```mermaid
erDiagram
    audits {
        uuid id PK "gen_random_uuid()"
        jsonb input "AuditInput — tools, teamSize, primaryUseCase"
        jsonb result "AuditResult — recommendations, savings, etc."
        text share_id UK "nanoid(10) — shareable slug"
        timestamptz created_at "now()"
    }

    lead_captures {
        uuid id PK "gen_random_uuid()"
        text email "User email address"
        text company "Optional company name"
        text role "Optional role/title"
        integer team_size "Optional team size"
        uuid audit_id FK "References audits.id"
        boolean credex_eligible "Forwarded to Credex?"
        timestamptz created_at "now()"
    }

    audits ||--o{ lead_captures : "has"
```

### SQL Schema

```sql
-- audits table
CREATE TABLE audits (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    input       JSONB NOT NULL,
    result      JSONB NOT NULL,
    share_id    TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_audits_share_id ON audits(share_id);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);

-- lead_captures table
CREATE TABLE lead_captures (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email           TEXT NOT NULL,
    company         TEXT,
    role            TEXT,
    team_size       INTEGER,
    audit_id        UUID REFERENCES audits(id) ON DELETE CASCADE,
    credex_eligible BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_lead_captures_email ON lead_captures(email);
CREATE INDEX idx_lead_captures_audit_id ON lead_captures(audit_id);

-- Row Level Security
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_captures ENABLE ROW LEVEL SECURITY;

-- Public can read audits by share_id (for shared reports)
CREATE POLICY "Public can read shared audits"
    ON audits FOR SELECT
    USING (share_id IS NOT NULL);

-- Only service role can insert (API routes use service role key)
CREATE POLICY "Service role can insert audits"
    ON audits FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can insert leads"
    ON lead_captures FOR INSERT
    WITH CHECK (true);
```

---

## API Route Map

```mermaid
graph LR
    subgraph API["API Routes"]
        direction TB
        A1["POST /api/audit"]
        A2["POST /api/lead"]
        A3["GET /api/share/[id]"]
        A4["POST /api/summary"]
    end

    A1 -->|"Input: AuditInput"| R1["Output: AuditResult + auditId"]
    A2 -->|"Input: LeadCapture"| R2["Output: { success: true }"]
    A3 -->|"Input: shareId param"| R3["Output: AuditResult"]
    A4 -->|"Input: AuditResult"| R4["Output: { summary: string }"]
```

### Route Details

| Route | Method | Auth | Rate Limit | Description |
|-------|--------|------|------------|-------------|
| `/api/audit` | POST | None | 10/hr/IP | Run audit calculation, store result, return recommendations |
| `/api/lead` | POST | None | 5/hr/IP | Capture email + optional info, forward to Credex if eligible |
| `/api/share/[id]` | GET | None | 30/hr/IP | Retrieve a shared audit by `share_id` |
| `/api/summary` | POST | None | 10/hr/IP | Generate AI executive summary via Claude |

### Request/Response Schemas

**POST /api/audit**
```typescript
// Request body
{
  tools: Array<{
    tool: "cursor" | "github_copilot" | "claude" | "chatgpt" | "anthropic_api" | "openai_api" | "gemini" | "windsurf",
    plan: string,
    monthlySpend: number,
    seatCount: number
  }>,
  teamSize: number,
  primaryUseCase: "coding" | "writing" | "data" | "research" | "mixed"
}

// Response
{
  id: string,
  totalCurrentSpend: number,
  totalRecommendedSpend: number,
  totalMonthlySavings: number,
  totalAnnualSavings: number,
  recommendations: ToolRecommendation[],
  credexEligible: boolean,
  credexEstimatedSavings: number,
  overlapWarnings: string[],
  shareId: string
}
```

---

## Audit Engine Pipeline

The audit engine is the core of AISpendLens. It's a pure, deterministic TypeScript pipeline — no AI involved in the actual calculations. This is intentional: calculations must be reproducible and debuggable.

```mermaid
graph TD
    INPUT["AuditInput"] --> VALIDATE["1. Zod Validation"]
    VALIDATE --> LOOKUP["2. Pricing Lookup"]
    LOOKUP --> COMPARE["3. Plan Comparison"]
    COMPARE --> OVERLAP["4. Overlap Detection"]
    OVERLAP --> RECOMMEND["5. Recommendation Generation"]
    RECOMMEND --> CREDEX["6. Credex Eligibility Check"]
    CREDEX --> RESULT["AuditResult"]

    subgraph Step2["2. Pricing Lookup"]
        PD["pricing-data.ts"]
        PD -->|"For each tool"| CP["Current plan cost"]
        PD -->|"All plans"| AP["Available alternatives"]
    end

    subgraph Step3["3. Plan Comparison"]
        CP2["Current spend"] --> DIFF["Calculate delta"]
        OP["Optimal plan for seat count"] --> DIFF
        DIFF --> SAV["Monthly/Annual savings"]
    end

    subgraph Step4["4. Overlap Detection"]
        OV1["Cursor + GitHub Copilot → IDE overlap"]
        OV2["Claude + ChatGPT → Chatbot overlap"]
        OV3["Anthropic API + Claude Pro → API vs. subscription"]
        OV4["OpenAI API + ChatGPT Plus → API vs. subscription"]
    end

    subgraph Step5["5. Recommendation Engine"]
        SEV["Severity scoring"]
        SEV -->|"> $50/mo savings"| HIGH["🔴 High"]
        SEV -->|"$20-50/mo savings"| MED["🟡 Medium"]
        SEV -->|"$5-20/mo savings"| LOW["🟢 Low"]
        SEV -->|"< $5/mo savings"| OPT["✅ Optimal"]
    end
```

### Pipeline Steps in Detail

#### 1. Input Validation
Zod schemas validate all input. Rejects malformed data before any calculation begins. This runs both client-side (for instant feedback) and server-side (for security).

#### 2. Pricing Lookup
Each tool's current plan is matched against our pricing database (`pricing-data.ts`). The database stores official pricing with source URLs and verification dates. Updated manually — we check pricing pages weekly.

#### 3. Plan Comparison
For each tool, we calculate the optimal plan based on:
- **Seat count**: Some plans have per-seat pricing; others are flat
- **Feature needs**: Based on `primaryUseCase`
- **Volume**: API tools compare actual usage vs. subscription break-even

#### 4. Overlap Detection
The engine detects common overlap patterns:
- Using both Cursor Pro AND GitHub Copilot (IDE autocomplete overlap)
- Using both Claude Pro AND ChatGPT Plus (chatbot overlap)
- Paying for Claude Pro subscription AND heavy Anthropic API usage
- Paying for ChatGPT Plus AND heavy OpenAI API usage

#### 5. Recommendation Generation
Each tool gets a recommendation with:
- **Severity**: How much money is being wasted
- **Specific action**: "Downgrade from Pro to Free" or "Consolidate with X"
- **Reasoning**: Human-readable explanation
- **Alternative tool**: If consolidation is recommended

#### 6. Credex Eligibility
If `totalAnnualSavings > $1,000`, the user is flagged as Credex-eligible. This threshold is configurable via `CREDEX_SAVINGS_THRESHOLD`.

---

## AI Summary Pipeline

The AI summary is the only non-deterministic part of the system. It runs separately from the audit calculation and fails gracefully.

```mermaid
graph TD
    AR["AuditResult"] --> BUILD["Build prompt"]
    BUILD --> CALL["Call Claude API"]
    CALL -->|"Success"| PARSE["Parse response"]
    CALL -->|"Failure/Timeout"| FALLBACK["Template fallback"]
    PARSE --> SUMMARY["Summary string"]
    FALLBACK --> SUMMARY

    subgraph Prompt["Prompt Construction"]
        SYS["System prompt: You are a startup CFO advisor..."]
        USR["User prompt: Here's the audit data..."]
        SYS --> BUILD
        USR --> BUILD
    end

    subgraph Fallback["Template Fallback"]
        T1["Based on totalMonthlySavings"]
        T2["Insert tool-specific recommendations"]
        T3["Add Credex mention if eligible"]
    end
```

### Fallback Strategy

If Claude is unavailable or returns an error:
1. A template-based summary is generated using the structured audit data
2. The summary includes the top 3 recommendations by savings amount
3. No degradation in audit accuracy — only the narrative summary is affected

---

## Infrastructure

```mermaid
graph TB
    subgraph Vercel["Vercel (Hosting)"]
        EDGE["Edge Network (CDN)"]
        SSR["Node.js Runtime"]
        STATIC["Static Assets"]
    end

    subgraph Supabase["Supabase (Database)"]
        PG["PostgreSQL"]
        RLS["Row Level Security"]
        REST["REST API (PostgREST)"]
    end

    subgraph Anthropic["Anthropic"]
        CLAUDE["Claude Sonnet 4.6"]
    end

    subgraph Resend["Resend"]
        EMAIL["Email Delivery"]
    end

    USER["User Browser"] --> EDGE
    EDGE --> SSR
    EDGE --> STATIC
    SSR --> REST
    SSR --> CLAUDE
    SSR --> EMAIL
```

### Cost Profile (at scale)

| Service | Free Tier | Expected Cost at 1K audits/day |
|---------|-----------|-------------------------------|
| Vercel | 100GB bandwidth | ~$20/mo (Pro) |
| Supabase | 500MB DB, 2GB transfer | ~$25/mo (Pro) |
| Anthropic | None | ~$15/mo (~500 summaries/day × ~800 tokens × $3/MTok) |
| Resend | 100 emails/day | ~$20/mo (Pro) |
| **Total** | | **~$80/mo** |

---

## Key Design Decisions

### 1. No Authentication Required
We deliberately skipped auth. The goal is zero-friction: land → audit → value. Adding a login wall would kill conversion. Email is captured *after* the user sees their savings — classic value-first pattern.

### 2. Deterministic Audit Engine
The core audit logic is pure TypeScript with no AI dependency. This means:
- Results are reproducible and testable
- No API costs for the calculation itself
- Works offline (except for the summary)
- Audits complete in <100ms

### 3. Claude for Summary Only
AI is used only for generating the executive summary paragraph. This is the right trade-off:
- Calculations must be exact → deterministic code
- Summaries benefit from natural language → LLM
- If Claude is down, we fall back to templates → no degradation

### 4. Edge-Compatible API Routes
All API routes are designed to run on Vercel's Edge Runtime where possible, minimizing cold start latency. The `/api/summary` route uses Node.js runtime since the Anthropic SDK requires it.

### 5. Share via ID, Not Auth
Shared reports use a `nanoid(10)` slug. No auth required to view. This makes sharing frictionless but means reports are technically public if you guess the ID. The 10-character nanoid gives us ~1 trillion possibilities — acceptable for non-sensitive data.
