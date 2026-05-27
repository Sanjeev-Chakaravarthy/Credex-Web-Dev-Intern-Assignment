# Testing Strategy

> What's tested, why, how, and what's not (yet).

---

## Philosophy

Tests exist to protect the business logic. The audit engine is the core of this product — if it calculates savings incorrectly, we lose user trust and generate bad leads. Everything else (UI, API wiring, Claude integration) is important but secondary.

Priority order:
1. **Audit engine logic** — Must be correct. Unit tested exhaustively.
2. **API input validation** — Must reject bad data. Unit tested.
3. **Integration points** — Supabase writes, Claude calls. Integration tested.
4. **UI flows** — Should work. Manually tested. E2E tests are a Week 2 priority.

---

## Test Structure

```
src/
├── lib/
│   └── audit-engine/
│       ├── __tests__/
│       │   ├── calculator.test.ts          # Core calculation logic
│       │   ├── overlap-detector.test.ts    # Overlap detection patterns
│       │   ├── recommendations.test.ts     # Recommendation generation
│       │   └── pricing-data.test.ts        # Pricing data integrity
│       └── ...
├── app/
│   └── api/
│       ├── audit/
│       │   └── __tests__/
│       │       └── route.test.ts           # Audit API validation
│       ├── lead/
│       │   └── __tests__/
│       │       └── route.test.ts           # Lead capture validation
│       └── summary/
│           └── __tests__/
│               └── route.test.ts           # Summary fallback logic
└── hooks/
    └── __tests__/
        └── use-audit-form.test.ts          # Form state transitions
```

---

## What's Tested

### 1. Audit Engine Calculator (`calculator.test.ts`)

This is the most important test file. Covers:

| Test Case | What It Verifies |
|-----------|-----------------|
| Single tool, correct plan | No savings recommended for optimal plan |
| Single tool, overpriced plan | Correct savings amount calculated |
| Multiple tools, mixed savings | Aggregate savings computed correctly |
| Zero spend input | Handles $0 spend gracefully |
| Single seat vs. team | Per-seat math is correct |
| Large team (50 seats) | Volume pricing thresholds apply |
| API tool with low spend | Doesn't recommend subscription if spend is low |
| API tool with high spend | Recommends subscription if spend exceeds threshold |
| All tools optimal | Returns totalMonthlySavings = 0 |
| Credex threshold: below | `credexEligible = false` when savings < $1,000/year |
| Credex threshold: above | `credexEligible = true` when savings >= $1,000/year |
| Credex threshold: exact | Edge case at exactly $1,000/year |

**Example test:**

```typescript
describe('calculateAudit', () => {
  it('should identify savings when user is on Cursor Pro but only has 1 seat', () => {
    const input: AuditInput = {
      tools: [{
        tool: 'cursor',
        plan: 'teams',
        monthlySpend: 40,
        seatCount: 1,
      }],
      teamSize: 1,
      primaryUseCase: 'coding',
    };

    const result = calculateAudit(input);

    expect(result.recommendations[0].currentPlan).toBe('teams');
    expect(result.recommendations[0].recommendedPlan).toBe('pro');
    expect(result.recommendations[0].monthlySavings).toBe(20);
    expect(result.recommendations[0].severity).toBe('medium');
  });

  it('should flag Credex eligibility when annual savings exceed threshold', () => {
    const input: AuditInput = {
      tools: [
        { tool: 'cursor', plan: 'teams', monthlySpend: 400, seatCount: 10 },
        { tool: 'github_copilot', plan: 'enterprise', monthlySpend: 390, seatCount: 10 },
      ],
      teamSize: 10,
      primaryUseCase: 'coding',
    };

    const result = calculateAudit(input);

    // Both IDE tools with overlap should flag Credex
    expect(result.credexEligible).toBe(true);
    expect(result.totalAnnualSavings).toBeGreaterThan(1000);
  });
});
```

### 2. Overlap Detector (`overlap-detector.test.ts`)

| Test Case | What It Verifies |
|-----------|-----------------|
| Cursor + GitHub Copilot | IDE overlap warning generated |
| Claude + ChatGPT | Chatbot overlap warning generated |
| Anthropic API + Claude Pro | API vs. subscription warning generated |
| OpenAI API + ChatGPT Plus | API vs. subscription warning generated |
| No overlaps (Cursor + Claude) | No warnings generated |
| All tools selected | All applicable overlaps detected (no false negatives) |

**Example test:**

```typescript
describe('detectOverlaps', () => {
  it('should detect IDE overlap between Cursor and GitHub Copilot', () => {
    const tools: AITool[] = ['cursor', 'github_copilot'];
    const warnings = detectOverlaps(tools);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Cursor');
    expect(warnings[0]).toContain('GitHub Copilot');
  });

  it('should return no warnings for non-overlapping tools', () => {
    const tools: AITool[] = ['cursor', 'claude', 'gemini'];
    const warnings = detectOverlaps(tools);

    expect(warnings).toHaveLength(0);
  });
});
```

### 3. Recommendation Engine (`recommendations.test.ts`)

| Test Case | What It Verifies |
|-----------|-----------------|
| Savings > $50/mo → severity "high" | Severity classification is correct |
| Savings $20–50/mo → severity "medium" | |
| Savings $5–20/mo → severity "low" | |
| Savings < $5/mo → severity "optimal" | |
| Recommendation includes reasoning | Non-empty string explaining the recommendation |
| Alternative tool suggested for overlaps | When overlap detected, alternative is populated |
| Annual savings = monthly × 12 | Basic math sanity check |

### 4. Pricing Data Integrity (`pricing-data.test.ts`)

These tests ensure the pricing database is well-formed:

```typescript
describe('pricing data integrity', () => {
  it('should have pricing for all supported tools', () => {
    for (const tool of AI_TOOLS) {
      const pricing = getPricing(tool);
      expect(pricing).toBeDefined();
      expect(pricing.plans.length).toBeGreaterThan(0);
    }
  });

  it('should have source URLs for all tools', () => {
    for (const tool of AI_TOOLS) {
      const pricing = getPricing(tool);
      expect(pricing.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('should have verified dates within last 90 days', () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    for (const tool of AI_TOOLS) {
      const pricing = getPricing(tool);
      const verified = new Date(pricing.verifiedDate);
      expect(verified.getTime()).toBeGreaterThan(ninetyDaysAgo.getTime());
    }
  });

  it('should have non-negative prices for all plans', () => {
    for (const tool of AI_TOOLS) {
      const pricing = getPricing(tool);
      for (const plan of pricing.plans) {
        expect(plan.pricePerSeat).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
```

### 5. API Route Validation (`route.test.ts`)

| Test Case | What It Verifies |
|-----------|-----------------|
| Valid input → 200 response | Happy path works |
| Empty tools array → 400 | Zod validation catches it |
| Negative spend → 400 | Zod validation catches it |
| Invalid tool name → 400 | Zod enum validation |
| Missing required fields → 400 | Zod required field validation |
| teamSize = 0 → 400 | Minimum value validation |
| Honeypot filled → 400 | Bot detection works |
| Extra fields ignored | Zod strips unknown fields |

### 6. Form State Hook (`use-audit-form.test.ts`)

| Test Case | What It Verifies |
|-----------|-----------------|
| Initial state → step 1 | Hook initializes correctly |
| Select tool → appears in selectedTools | Tool selection works |
| Deselect tool → removed from selectedTools | Tool deselection works |
| Can't advance from step 1 with no tools | Validation prevents empty submission |
| Step 2 shows fields for selected tools | Dynamic form generation works |
| Can navigate back from step 2 | Back button works |
| Step 3 submission builds valid AuditInput | Final payload is correct |

---

## What's NOT Tested (and Why)

### UI Components
No component tests (React Testing Library) for individual UI components. Why:
- shadcn/ui components are already tested upstream
- Custom components are mostly presentational
- The ROI of testing "does this card render?" is low
- Visual regression testing (Chromatic/Percy) would be more valuable here

### Claude Integration
No tests for the actual Claude API call. Why:
- The response is non-deterministic
- The prompt engineering is tested manually
- The fallback template IS tested (it's deterministic)
- Would need a mock/stub, which tests the mock, not the integration

### Supabase Writes
No integration tests for database writes. Why:
- Would need a test database or mock
- The write logic is simple (`INSERT INTO ... VALUES`)
- Errors would surface immediately in manual testing
- Would add integration tests with a test Supabase project in Week 2

### E2E Flows
No Playwright/Cypress E2E tests. Why:
- Setup cost is ~4 hours for proper CI integration
- Manual testing covers the critical paths for now
- This is the highest-priority addition for Week 2

---

## Coverage Goals

| Area | Current | Target (Week 2) | Target (Month 1) |
|------|---------|-----------------|-------------------|
| Audit Engine | ~90% | 95% | 98% |
| API Validation | ~85% | 90% | 95% |
| Form State Hook | ~70% | 85% | 90% |
| UI Components | 0% | 30% | 60% |
| E2E Flows | 0% | 50% | 80% |
| **Overall** | **~45%** | **~65%** | **~80%** |

---

## Edge Cases Worth Noting

### Numeric Edge Cases
- User enters `$0.00` spend → should return "optimal" severity, not crash
- User enters `$999,999` spend → should handle large numbers (no overflow)
- Seat count of 1 with a team-only plan → should recommend individual plan
- Decimal seat counts → Zod rejects (`.int()` validation)

### Tool Combination Edge Cases
- All 8 tools selected → should handle gracefully, likely high overlap warnings
- Only API tools selected → no subscription comparisons possible, different recommendation strategy
- Same tool selected twice → Zod should prevent this (`.min(1)` on unique array)

### API Edge Cases
- Request body > 1MB → should reject (Next.js default body limit)
- Concurrent requests from same IP → rate limiter should queue/reject
- Malformed JSON → Next.js returns 400 automatically
- Missing `Content-Type` header → should still work (Next.js handles this)

### AI Summary Edge Cases
- Claude returns empty string → use template fallback
- Claude times out (>10s) → use template fallback
- Claude returns HTML/markdown instead of plain text → strip tags
- Anthropic API key invalid → use template fallback (log error)
- Anthropic rate limited → use template fallback (log error)

---

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run src/lib/audit-engine/__tests__/calculator.test.ts

# Run with coverage
npx vitest run --coverage

# Run only audit engine tests
npx vitest run src/lib/audit-engine
```

---

## CI/CD Integration

Tests run on every push via GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
```

Type checking and linting run before tests. If types don't compile, there's no point running tests.
