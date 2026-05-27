import { AuditInput, AuditResult, ToolRecommendation } from "./types";
import { PRICING_DATA } from "./pricing";
import { evaluateRules } from "./rules";
import {
  calculateCurrentSpend,
  calculateMonthlySavings,
  calculateAnnualSavings,
  calculateCredexSavings,
  isCredexEligible,
  detectOverlaps,
} from "./calculators";

// ============================================================
// Main Audit Orchestrator
// ============================================================

/**
 * Run the complete audit pipeline:
 * 1. Validate input
 * 2. Run rules against each tool
 * 3. Calculate savings
 * 4. Detect overlaps
 * 5. Determine Credex eligibility
 * 6. Return structured AuditResult
 */
export function runAudit(input: AuditInput): AuditResult {
  const recommendations: ToolRecommendation[] = [];

  // Process each tool through the rule engine
  for (const toolInput of input.tools) {
    const ruleResult = evaluateRules(toolInput, input);
    const toolPricing = PRICING_DATA[toolInput.tool];

    if (ruleResult) {
      const monthlySavings = Math.max(
        0,
        toolInput.monthlySpend - ruleResult.recommendedSpend
      );

      recommendations.push({
        tool: toolInput.tool,
        displayName: toolPricing.displayName,
        currentPlan: toolInput.plan,
        currentSpend: toolInput.monthlySpend,
        recommendedPlan: ruleResult.recommendedPlan,
        recommendedSpend: ruleResult.recommendedSpend,
        monthlySavings,
        annualSavings: monthlySavings * 12,
        reasoning: ruleResult.reasoning,
        alternativeTool: ruleResult.alternativeTool,
        alternativeReason: ruleResult.alternativeReason,
        severity: ruleResult.severity,
      });
    } else {
      // Tool is already optimally configured
      recommendations.push({
        tool: toolInput.tool,
        displayName: toolPricing.displayName,
        currentPlan: toolInput.plan,
        currentSpend: toolInput.monthlySpend,
        recommendedPlan: toolInput.plan,
        recommendedSpend: toolInput.monthlySpend,
        monthlySavings: 0,
        annualSavings: 0,
        reasoning: "Your current plan is well-suited for your usage. No changes recommended.",
        severity: "optimal",
      });
    }
  }

  // Calculate totals
  const totalCurrentSpend = calculateCurrentSpend(input.tools);
  const totalRecommendedSpend = recommendations.reduce(
    (sum, r) => sum + r.recommendedSpend,
    0
  );
  const totalMonthlySavings = calculateMonthlySavings(
    totalCurrentSpend,
    totalRecommendedSpend
  );
  const totalAnnualSavings = calculateAnnualSavings(totalMonthlySavings);

  // Credex calculations
  const credexEligible = isCredexEligible(totalMonthlySavings, totalCurrentSpend);
  const credexEstimatedSavings = credexEligible
    ? calculateCredexSavings(totalCurrentSpend)
    : 0;

  // Overlap warnings
  const overlapWarnings = detectOverlaps(input.tools);

  return {
    totalCurrentSpend,
    totalRecommendedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    credexEligible,
    credexEstimatedSavings,
    overlapWarnings,
  };
}

/**
 * Generate a plain-text summary (fallback when AI is unavailable)
 */
export function generateFallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, recommendations } = result;

  if (totalMonthlySavings === 0) {
    return "Your AI stack is well-optimized! You're not overspending on any tools. Keep monitoring as your team grows — pricing tiers that make sense today may not be optimal at scale.";
  }

  const topSavings = recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings);

  const topTool = topSavings[0];
  const savingsCount = topSavings.length;

  let summary = `We found $${totalMonthlySavings.toLocaleString()}/month in potential savings across your AI stack — that's $${totalAnnualSavings.toLocaleString()} annually. `;

  if (topTool) {
    summary += `Your biggest opportunity is ${topTool.displayName}: ${topTool.reasoning} `;
  }

  if (savingsCount > 1) {
    summary += `We identified ${savingsCount} optimization${savingsCount > 1 ? "s" : ""} total. `;
  }

  if (result.overlapWarnings.length > 0) {
    summary += "We also detected overlapping tool subscriptions that could be consolidated. ";
  }

  if (result.credexEligible) {
    summary += "Given your spend level, you may qualify for additional savings through Credex credit optimization.";
  }

  return summary.trim();
}
