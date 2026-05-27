import {
  AITool,
  AuditInput,
  ToolInput,
  ToolRecommendation,
} from "./types";
import {
  getPlanPricing,
  calculatePlanCost,
  getCheaperPlan,
  getToolCategory,
  PRICING_DATA,
} from "./pricing";

// ============================================================
// Rule Interface
// ============================================================

export interface Rule {
  id: string;
  name: string;
  description: string;
  evaluate: (
    toolInput: ToolInput,
    context: AuditInput
  ) => RuleResult | null;
}

export interface RuleResult {
  recommendedPlan: string;
  recommendedSpend: number;
  reasoning: string;
  severity: "high" | "medium" | "low";
  alternativeTool?: string;
  alternativeReason?: string;
}

// ============================================================
// Rule Definitions
// ============================================================

/**
 * Rule 1: Team plan with single seat → downgrade to individual plan
 * Applies to: Claude Team, ChatGPT Team, Cursor Business, Windsurf Team
 */
const singleSeatTeamPlanRule: Rule = {
  id: "single-seat-team",
  name: "Single Seat Team Plan",
  description: "Detect team plans used by a single user",
  evaluate: (toolInput, _context) => {
    const { tool, plan, seatCount } = toolInput;
    if (seatCount > 1) return null;

    const teamPlans: Record<string, string> = {
      claude: "team",
      chatgpt: "team",
      cursor: "business",
      windsurf: "team",
      github_copilot: "business",
    };

    const teamPlan = teamPlans[tool];
    if (!teamPlan || plan !== teamPlan) return null;

    const cheaper = getCheaperPlan(tool, plan);
    if (!cheaper) return null;

    const newCost = cheaper.isPerSeat
      ? cheaper.pricePerSeat * seatCount
      : cheaper.pricePerSeat;

    return {
      recommendedPlan: cheaper.plan,
      recommendedSpend: newCost,
      reasoning: `You're on a team/business plan with only 1 seat. Downgrade to ${cheaper.plan} to save $${(toolInput.monthlySpend - newCost).toFixed(0)}/mo without losing individual features.`,
      severity: "high",
    };
  },
};

/**
 * Rule 2: Small team on enterprise plan → suggest business tier
 */
const oversizedPlanRule: Rule = {
  id: "oversized-plan",
  name: "Oversized Plan",
  description: "Enterprise plan for small teams",
  evaluate: (toolInput, context) => {
    const { tool, plan, seatCount } = toolInput;

    if (plan !== "enterprise" || context.teamSize > 50) return null;
    if (tool !== "github_copilot") return null;

    const businessPlan = getPlanPricing(tool, "business");
    if (!businessPlan) return null;

    const newCost = businessPlan.pricePerSeat * seatCount;

    return {
      recommendedPlan: "business",
      recommendedSpend: newCost,
      reasoning: `Enterprise plan is designed for large orgs (50+ devs). With a team of ${context.teamSize}, Business tier provides sufficient features at a lower cost.`,
      severity: "high",
    };
  },
};

/**
 * Rule 3: Cursor + GitHub Copilot overlap detection → pick one IDE AI
 */
const ideCodingOverlapRule: Rule = {
  id: "ide-overlap",
  name: "IDE AI Tool Overlap",
  description: "Using multiple IDE AI tools simultaneously",
  evaluate: (toolInput, context) => {
    const { tool, plan } = toolInput;
    const category = getToolCategory(tool);
    if (category !== "ide") return null;

    const otherIdeTools = context.tools.filter(
      (t) => t.tool !== tool && getToolCategory(t.tool) === "ide" && t.plan !== "free"
    );

    if (otherIdeTools.length === 0) return null;

    // If this tool is more expensive, recommend the cheaper one
    const otherTool = otherIdeTools[0];
    const otherCost = otherTool.monthlySpend;
    const thisCost = toolInput.monthlySpend;

    if (thisCost <= otherCost) return null; // keep the cheaper one

    const otherName = PRICING_DATA[otherTool.tool].displayName;

    return {
      recommendedPlan: "free",
      recommendedSpend: 0,
      reasoning: `You're paying for both ${PRICING_DATA[tool].displayName} and ${otherName}. These tools overlap significantly for coding assistance. Consider consolidating to one.`,
      severity: "medium",
      alternativeTool: otherTool.tool,
      alternativeReason: `${otherName} at $${otherCost}/mo covers similar IDE AI features`,
    };
  },
};

/**
 * Rule 4: Claude + ChatGPT overlap → pick one chatbot
 */
const chatbotOverlapRule: Rule = {
  id: "chatbot-overlap",
  name: "Chatbot Overlap",
  description: "Paying for multiple chatbot subscriptions",
  evaluate: (toolInput, context) => {
    const { tool, plan } = toolInput;
    if (plan === "free") return null;
    const category = getToolCategory(tool);
    if (category !== "chatbot") return null;

    const otherChatbots = context.tools.filter(
      (t) =>
        t.tool !== tool &&
        getToolCategory(t.tool) === "chatbot" &&
        t.plan !== "free"
    );

    if (otherChatbots.length === 0) return null;

    const otherTool = otherChatbots[0];
    const otherCost = otherTool.monthlySpend;
    const thisCost = toolInput.monthlySpend;

    if (thisCost <= otherCost) return null;

    const otherName = PRICING_DATA[otherTool.tool].displayName;

    return {
      recommendedPlan: "free",
      recommendedSpend: 0,
      reasoning: `You're paying for both ${PRICING_DATA[tool].displayName} and ${otherName}. For most teams, one premium chatbot is sufficient. Use the free tier of the other.`,
      severity: "medium",
      alternativeTool: otherTool.tool,
      alternativeReason: `Consolidate to ${otherName} and use ${PRICING_DATA[tool].displayName} free tier`,
    };
  },
};

/**
 * Rule 5: Seat count exceeds team size → reduce seats
 */
const excessSeatsRule: Rule = {
  id: "excess-seats",
  name: "Excess Seats",
  description: "More seats than team members",
  evaluate: (toolInput, context) => {
    const { tool, plan, seatCount, monthlySpend } = toolInput;
    if (seatCount <= context.teamSize) return null;

    const planPricing = getPlanPricing(tool, plan);
    if (!planPricing || !planPricing.isPerSeat) return null;

    const newCost = planPricing.pricePerSeat * context.teamSize;

    return {
      recommendedPlan: plan,
      recommendedSpend: newCost,
      reasoning: `You have ${seatCount} seats but only ${context.teamSize} team members. Remove ${seatCount - context.teamSize} unused seats to save $${(monthlySpend - newCost).toFixed(0)}/mo.`,
      severity: "high",
    };
  },
};

/**
 * Rule 6: Overspending on API vs reported spend
 * If someone is spending >$200/mo on API, suggest batching
 */
const highApiSpendRule: Rule = {
  id: "high-api-spend",
  name: "High API Spend",
  description: "Opportunities to optimize API costs",
  evaluate: (toolInput) => {
    const { tool, monthlySpend } = toolInput;
    if (tool !== "anthropic_api" && tool !== "openai_api") return null;
    if (monthlySpend < 200) return null;

    const savingsEstimate = Math.round(monthlySpend * 0.3);
    const newCost = monthlySpend - savingsEstimate;

    return {
      recommendedPlan: "usage_based",
      recommendedSpend: newCost,
      reasoning: `At $${monthlySpend}/mo on API spend, consider: batch API (50% off), prompt caching, switching to smaller models for simple tasks, and setting usage limits. Estimated 30% savings.`,
      severity: monthlySpend > 500 ? "high" : "medium",
    };
  },
};

/**
 * Rule 7: Using Pro plan but team is tiny for coding → consider free
 */
const freeIsEnoughRule: Rule = {
  id: "free-sufficient",
  name: "Free Tier Sufficient",
  description: "Light usage might be covered by free plans",
  evaluate: (toolInput, context) => {
    const { tool, plan, seatCount } = toolInput;
    if (plan === "free") return null;
    if (context.teamSize > 3) return null;
    if (seatCount > 1) return null;

    // Only suggest free for individual users on basic plans
    const toolPricing = getPlanPricing(tool, plan);
    if (!toolPricing) return null;

    // Don't suggest free for heavy coding users on IDE tools
    if (
      getToolCategory(tool) === "ide" &&
      context.primaryUseCase === "coding"
    ) {
      return null;
    }

    // For chatbots used for research/writing, free might suffice
    if (
      getToolCategory(tool) === "chatbot" &&
      (context.primaryUseCase === "research" || context.primaryUseCase === "writing")
    ) {
      return {
        recommendedPlan: "free",
        recommendedSpend: 0,
        reasoning: `For ${context.primaryUseCase} use with a small team, the free tier may provide sufficient access. Try downgrading for a month to test.`,
        severity: "low",
      };
    }

    return null;
  },
};

/**
 * Rule 8: Suggest Cursor/Windsurf instead of Copilot for coding-first teams
 */
const betterAlternativeRule: Rule = {
  id: "better-alternative",
  name: "Better Alternative Available",
  description: "A more cost-effective tool exists for the use case",
  evaluate: (toolInput, context) => {
    if (context.primaryUseCase !== "coding") return null;

    const { tool, plan, monthlySpend } = toolInput;

    // If using expensive Copilot Enterprise, suggest Cursor Business
    if (
      tool === "github_copilot" &&
      plan === "enterprise" &&
      context.teamSize <= 20
    ) {
      const cursorCost = 40 * toolInput.seatCount;
      if (cursorCost < monthlySpend) {
        return {
          recommendedPlan: plan,
          recommendedSpend: monthlySpend,
          reasoning: `Cursor Business ($40/seat) offers similar AI coding features to Copilot Enterprise ($39/seat) with deeper IDE integration for agentic workflows.`,
          severity: "low",
          alternativeTool: "cursor",
          alternativeReason:
            "Cursor Business provides comparable features with better agentic coding support",
        };
      }
    }

    return null;
  },
};

/**
 * Rule 9: Team plan below minimum seat requirement
 * E.g., Claude Team requires 5 seats minimum
 */
const belowMinSeatsRule: Rule = {
  id: "below-min-seats",
  name: "Below Minimum Seats",
  description: "Team plan with fewer than required minimum seats",
  evaluate: (toolInput, context) => {
    const { tool, plan, seatCount } = toolInput;
    const planPricing = getPlanPricing(tool, plan);
    if (!planPricing || !planPricing.minSeats) return null;
    if (seatCount >= planPricing.minSeats) return null;

    // They're paying for minSeats anyway, so check if downgrading is better
    const cheaper = getCheaperPlan(tool, plan);
    if (!cheaper) return null;

    const currentMinCost = planPricing.pricePerSeat * planPricing.minSeats;
    const downgradePerSeatCost = cheaper.isPerSeat
      ? cheaper.pricePerSeat * context.teamSize
      : cheaper.pricePerSeat;

    if (downgradePerSeatCost >= currentMinCost) return null;

    return {
      recommendedPlan: cheaper.plan,
      recommendedSpend: downgradePerSeatCost,
      reasoning: `${PRICING_DATA[tool].displayName} Team requires minimum ${planPricing.minSeats} seats, but you only have ${seatCount} users. You're paying for unused seats. Downgrade to ${cheaper.plan} for individual plans.`,
      severity: "high",
    };
  },
};

/**
 * Rule 10: Gemini Advanced when using other AI chatbots
 */
const geminiRedundancyRule: Rule = {
  id: "gemini-redundancy",
  name: "Gemini Redundancy",
  description: "Gemini Advanced when other chatbots are paid",
  evaluate: (toolInput, context) => {
    const { tool, plan } = toolInput;
    if (tool !== "gemini" || plan !== "advanced") return null;

    const hasPaidChatbot = context.tools.some(
      (t) =>
        t.tool !== "gemini" &&
        getToolCategory(t.tool) === "chatbot" &&
        t.plan !== "free"
    );

    if (!hasPaidChatbot) return null;

    return {
      recommendedPlan: "free",
      recommendedSpend: 0,
      reasoning: `You already have a paid chatbot subscription. Gemini free tier provides solid capabilities for supplementary use. Save $19.99/mo.`,
      severity: "medium",
    };
  },
};

// ============================================================
// Rule Registry
// ============================================================

export const ALL_RULES: Rule[] = [
  singleSeatTeamPlanRule,
  oversizedPlanRule,
  ideCodingOverlapRule,
  chatbotOverlapRule,
  excessSeatsRule,
  highApiSpendRule,
  freeIsEnoughRule,
  betterAlternativeRule,
  belowMinSeatsRule,
  geminiRedundancyRule,
];

/**
 * Run all rules against a single tool input and return the best recommendation.
 * Rules are priority-ordered: first match with highest severity wins.
 */
export function evaluateRules(
  toolInput: ToolInput,
  context: AuditInput
): RuleResult | null {
  const results: RuleResult[] = [];

  for (const rule of ALL_RULES) {
    const result = rule.evaluate(toolInput, context);
    if (result) {
      results.push(result);
    }
  }

  if (results.length === 0) return null;

  // Sort by severity: high > medium > low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Return highest-savings recommendation among top severity
  const topSeverity = results[0].severity;
  const topResults = results.filter((r) => r.severity === topSeverity);

  // Among same severity, pick the one with lowest recommended spend (most savings)
  topResults.sort((a, b) => a.recommendedSpend - b.recommendedSpend);

  return topResults[0];
}
