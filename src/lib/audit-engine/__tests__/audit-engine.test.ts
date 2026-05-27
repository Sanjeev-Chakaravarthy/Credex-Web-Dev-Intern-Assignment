import { describe, it, expect } from "vitest";
import { runAudit, generateFallbackSummary } from "../recommendations";
import { AuditInput, ToolInput } from "../types";

// ============================================================
// Helper: build a simple audit input
// ============================================================

function buildInput(
  tools: ToolInput[],
  teamSize = 5,
  primaryUseCase: "coding" | "writing" | "data" | "research" | "mixed" = "coding"
): AuditInput {
  return { tools, teamSize, primaryUseCase };
}

// ============================================================
// Test Suite
// ============================================================

describe("Audit Engine", () => {
  // -------------------------------------------------------
  // Test 1: Single-seat team plan downgrade
  // -------------------------------------------------------
  it("should detect single-seat team plan and recommend downgrade", () => {
    const input = buildInput([
      {
        tool: "chatgpt",
        plan: "team",
        monthlySpend: 25,
        seatCount: 1,
      },
    ]);

    const result = runAudit(input);

    expect(result.recommendations).toHaveLength(1);
    const rec = result.recommendations[0];
    expect(rec.recommendedPlan).toBe("plus");
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.severity).toBe("high");
    expect(rec.reasoning).toContain("team");
  });

  // -------------------------------------------------------
  // Test 2: Overlapping IDE tools detection
  // -------------------------------------------------------
  it("should detect overlapping IDE tools and suggest consolidation", () => {
    const input = buildInput([
      {
        tool: "cursor",
        plan: "pro",
        monthlySpend: 40,
        seatCount: 2,
      },
      {
        tool: "github_copilot",
        plan: "pro",
        monthlySpend: 20,
        seatCount: 2,
      },
    ]);

    const result = runAudit(input);
    expect(result.overlapWarnings.length).toBeGreaterThan(0);
    expect(result.overlapWarnings[0]).toContain("IDE");
  });

  // -------------------------------------------------------
  // Test 3: Excess seats detection
  // -------------------------------------------------------
  it("should detect excess seats when seat count exceeds team size", () => {
    const input = buildInput(
      [
        {
          tool: "cursor",
          plan: "pro",
          monthlySpend: 200,
          seatCount: 10,
        },
      ],
      5 // team size is 5 but 10 seats
    );

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reasoning).toContain("unused seats");
  });

  // -------------------------------------------------------
  // Test 4: High API spend optimization
  // -------------------------------------------------------
  it("should recommend API optimization for high spend", () => {
    const input = buildInput([
      {
        tool: "anthropic_api",
        plan: "usage_based",
        monthlySpend: 500,
        seatCount: 1,
      },
    ]);

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reasoning).toContain("batch");
  });

  // -------------------------------------------------------
  // Test 5: Optimal stack - no changes needed
  // -------------------------------------------------------
  it("should detect already optimized stack", () => {
    const input = buildInput([
      {
        tool: "cursor",
        plan: "pro",
        monthlySpend: 20,
        seatCount: 1,
      },
    ]);

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.severity).toBe("optimal");
    expect(rec.monthlySavings).toBe(0);
  });

  // -------------------------------------------------------
  // Test 6: Credex eligibility threshold
  // -------------------------------------------------------
  it("should mark Credex eligible for high savings", () => {
    const input = buildInput([
      {
        tool: "chatgpt",
        plan: "team",
        monthlySpend: 1250,
        seatCount: 1,
      },
      {
        tool: "claude",
        plan: "team",
        monthlySpend: 625,
        seatCount: 1,
      },
    ]);

    const result = runAudit(input);
    expect(result.credexEligible).toBe(true);
    expect(result.credexEstimatedSavings).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // Test 7: Chatbot overlap detection
  // -------------------------------------------------------
  it("should detect overlapping chatbot subscriptions", () => {
    const input = buildInput([
      {
        tool: "claude",
        plan: "pro",
        monthlySpend: 20,
        seatCount: 1,
      },
      {
        tool: "chatgpt",
        plan: "plus",
        monthlySpend: 20,
        seatCount: 1,
      },
    ]);

    const result = runAudit(input);
    expect(result.overlapWarnings.length).toBeGreaterThan(0);
    expect(result.overlapWarnings[0]).toContain("chatbot");
  });

  // -------------------------------------------------------
  // Test 8: Savings calculation accuracy
  // -------------------------------------------------------
  it("should calculate correct total savings across all tools", () => {
    const input = buildInput([
      {
        tool: "chatgpt",
        plan: "team",
        monthlySpend: 25,
        seatCount: 1,
      },
      {
        tool: "cursor",
        plan: "pro",
        monthlySpend: 20,
        seatCount: 1,
      },
    ]);

    const result = runAudit(input);

    // Total savings should equal sum of individual savings
    const sumSavings = result.recommendations.reduce(
      (sum, r) => sum + r.monthlySavings,
      0
    );
    expect(result.totalMonthlySavings).toBe(sumSavings);
    expect(result.totalAnnualSavings).toBe(sumSavings * 12);
  });

  // -------------------------------------------------------
  // Test 9: Fallback summary generation
  // -------------------------------------------------------
  it("should generate fallback summary when no savings found", () => {
    const input = buildInput([
      {
        tool: "cursor",
        plan: "pro",
        monthlySpend: 20,
        seatCount: 1,
      },
    ]);

    const result = runAudit(input);
    const summary = generateFallbackSummary(result);

    expect(summary).toBeTruthy();
    expect(summary.length).toBeGreaterThan(50);
    expect(summary).toContain("optimized");
  });

  // -------------------------------------------------------
  // Test 10: Claude Team below min seats
  // -------------------------------------------------------
  it("should detect Claude Team plan below minimum 5 seats", () => {
    const input = buildInput(
      [
        {
          tool: "claude",
          plan: "team",
          monthlySpend: 75,
          seatCount: 3,
        },
      ],
      3
    );

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reasoning).toContain("minimum");
  });

  // -------------------------------------------------------
  // Test 11: Enterprise downgrade for small team
  // -------------------------------------------------------
  it("should recommend downgrading from Copilot Enterprise for small teams", () => {
    const input = buildInput(
      [
        {
          tool: "github_copilot",
          plan: "enterprise",
          monthlySpend: 390,
          seatCount: 10,
        },
      ],
      10
    );

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.recommendedPlan).toBe("business");
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });
});
