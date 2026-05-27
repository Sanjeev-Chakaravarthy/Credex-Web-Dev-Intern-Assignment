import { AuditInput, ToolInput, ToolRecommendation, AuditResult } from "./types";
import { PRICING_DATA, calculatePlanCost } from "./pricing";
import { evaluateRules } from "./rules";

// ============================================================
// Spend Calculators
// ============================================================

/**
 * Calculate total current monthly spend across all tools
 */
export function calculateCurrentSpend(tools: ToolInput[]): number {
  return tools.reduce((sum, t) => sum + t.monthlySpend, 0);
}

/**
 * Calculate recommended spend for a single tool based on rule results
 */
export function calculateToolRecommendedSpend(
  toolInput: ToolInput,
  context: AuditInput
): { recommendedSpend: number; recommendedPlan: string } {
  const ruleResult = evaluateRules(toolInput, context);

  if (!ruleResult) {
    // No rule triggered — current spend is optimal
    return {
      recommendedSpend: toolInput.monthlySpend,
      recommendedPlan: toolInput.plan,
    };
  }

  return {
    recommendedSpend: ruleResult.recommendedSpend,
    recommendedPlan: ruleResult.recommendedPlan,
  };
}

/**
 * Calculate total recommended spend across all tools
 */
export function calculateTotalRecommendedSpend(
  input: AuditInput
): number {
  return input.tools.reduce((sum, tool) => {
    const { recommendedSpend } = calculateToolRecommendedSpend(tool, input);
    return sum + recommendedSpend;
  }, 0);
}

/**
 * Calculate monthly savings
 */
export function calculateMonthlySavings(
  currentSpend: number,
  recommendedSpend: number
): number {
  return Math.max(0, currentSpend - recommendedSpend);
}

/**
 * Calculate annual savings projection
 */
export function calculateAnnualSavings(monthlySavings: number): number {
  return monthlySavings * 12;
}

/**
 * Calculate Credex estimated savings (additional % on top via credit optimization)
 */
export function calculateCredexSavings(currentSpend: number): number {
  // Credex typically offers 10-25% additional savings through credit optimization
  // on retail SaaS spend. Conservative estimate: 15%
  const CREDEX_SAVINGS_RATE = 0.15;
  return Math.round(currentSpend * CREDEX_SAVINGS_RATE);
}

/**
 * Determine Credex eligibility
 * Eligible if monthly savings > $500 OR total spend > $2000
 */
export function isCredexEligible(
  monthlySavings: number,
  totalCurrentSpend: number
): boolean {
  return monthlySavings > 500 || totalCurrentSpend > 2000;
}

// ============================================================
// Overlap Detection
// ============================================================

export function detectOverlaps(tools: ToolInput[]): string[] {
  const warnings: string[] = [];
  const categories: Record<string, ToolInput[]> = {};

  for (const tool of tools) {
    const category = PRICING_DATA[tool.tool].category;
    if (!categories[category]) categories[category] = [];
    categories[category].push(tool);
  }

  // Check IDE overlaps
  const paidIdeTools = (categories["ide"] || []).filter(
    (t) => t.plan !== "free"
  );
  if (paidIdeTools.length > 1) {
    const names = paidIdeTools
      .map((t) => PRICING_DATA[t.tool].displayName)
      .join(" + ");
    warnings.push(
      `⚠️ Overlapping IDE AI tools: ${names}. Consider consolidating to one.`
    );
  }

  // Check chatbot overlaps
  const paidChatbots = (categories["chatbot"] || []).filter(
    (t) => t.plan !== "free"
  );
  if (paidChatbots.length > 1) {
    const names = paidChatbots
      .map((t) => PRICING_DATA[t.tool].displayName)
      .join(" + ");
    warnings.push(
      `⚠️ Multiple paid chatbot subscriptions: ${names}. Most teams only need one premium chatbot.`
    );
  }

  return warnings;
}
