import { AITool, ToolPricing, PlanPricing } from "./types";

// ============================================================
// Official Pricing Data — Last verified May 2026
// All prices in USD/month
// ============================================================

export const PRICING_DATA: Record<AITool, ToolPricing> = {
  cursor: {
    tool: "cursor",
    displayName: "Cursor",
    category: "ide",
    sourceUrl: "https://www.cursor.com/pricing",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "free",
        pricePerSeat: 0,
        isPerSeat: false,
        features: ["2000 completions", "50 slow premium requests"],
      },
      {
        plan: "pro",
        pricePerSeat: 20,
        isPerSeat: true,
        features: [
          "Unlimited completions",
          "500 fast premium requests",
          "Unlimited slow premium requests",
        ],
      },
      {
        plan: "business",
        pricePerSeat: 40,
        isPerSeat: true,
        features: [
          "Everything in Pro",
          "Admin dashboard",
          "Enforced privacy mode",
          "SAML/SSO",
        ],
      },
    ],
  },
  github_copilot: {
    tool: "github_copilot",
    displayName: "GitHub Copilot",
    category: "ide",
    sourceUrl: "https://github.com/features/copilot#pricing",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "free",
        pricePerSeat: 0,
        isPerSeat: false,
        features: ["2000 completions/mo", "50 chat messages/mo"],
      },
      {
        plan: "pro",
        pricePerSeat: 10,
        isPerSeat: true,
        features: [
          "Unlimited completions",
          "Unlimited chat",
          "Agent mode",
        ],
      },
      {
        plan: "business",
        pricePerSeat: 19,
        isPerSeat: true,
        features: [
          "Everything in Pro",
          "Organization management",
          "Policy management",
          "Audit logs",
        ],
      },
      {
        plan: "enterprise",
        pricePerSeat: 39,
        isPerSeat: true,
        features: [
          "Everything in Business",
          "Custom models",
          "Knowledge bases",
          "Fine-tuned models",
        ],
      },
    ],
  },
  claude: {
    tool: "claude",
    displayName: "Claude",
    category: "chatbot",
    sourceUrl: "https://www.anthropic.com/pricing",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "free",
        pricePerSeat: 0,
        isPerSeat: false,
        features: ["Basic access", "Limited usage"],
      },
      {
        plan: "pro",
        pricePerSeat: 20,
        isPerSeat: true,
        features: [
          "5x more usage",
          "Priority access",
          "Early feature access",
          "Projects",
        ],
      },
      {
        plan: "team",
        pricePerSeat: 25,
        isPerSeat: true,
        minSeats: 5,
        features: [
          "Everything in Pro",
          "Higher usage limits",
          "Admin console",
          "Team collaboration",
        ],
      },
    ],
  },
  chatgpt: {
    tool: "chatgpt",
    displayName: "ChatGPT",
    category: "chatbot",
    sourceUrl: "https://openai.com/chatgpt/pricing/",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "free",
        pricePerSeat: 0,
        isPerSeat: false,
        features: ["GPT-4o mini", "Limited GPT-4o"],
      },
      {
        plan: "plus",
        pricePerSeat: 20,
        isPerSeat: true,
        features: [
          "Extended GPT-4o",
          "DALL-E",
          "Advanced data analysis",
          "Custom GPTs",
        ],
      },
      {
        plan: "team",
        pricePerSeat: 25,
        isPerSeat: true,
        minSeats: 2,
        features: [
          "Everything in Plus",
          "Higher message caps",
          "Admin console",
          "Workspace",
        ],
      },
    ],
  },
  anthropic_api: {
    tool: "anthropic_api",
    displayName: "Anthropic API",
    category: "api",
    sourceUrl: "https://www.anthropic.com/pricing#702702",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "usage_based",
        pricePerSeat: 0,
        isPerSeat: false,
        isApiPlan: true,
        features: [
          "Pay per token",
          "Claude 3.5 Sonnet: $3/$15 per MTok",
          "Claude 3 Opus: $15/$75 per MTok",
          "Batch API available",
        ],
      },
    ],
  },
  openai_api: {
    tool: "openai_api",
    displayName: "OpenAI API",
    category: "api",
    sourceUrl: "https://openai.com/api/pricing/",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "usage_based",
        pricePerSeat: 0,
        isPerSeat: false,
        isApiPlan: true,
        features: [
          "Pay per token",
          "GPT-4o: $2.50/$10 per MTok",
          "GPT-4o mini: $0.15/$0.60 per MTok",
          "Batch API 50% discount",
        ],
      },
    ],
  },
  gemini: {
    tool: "gemini",
    displayName: "Gemini",
    category: "chatbot",
    sourceUrl: "https://gemini.google.com/advanced",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "free",
        pricePerSeat: 0,
        isPerSeat: false,
        features: ["Gemini 2.0 Flash", "Basic features"],
      },
      {
        plan: "advanced",
        pricePerSeat: 19.99,
        isPerSeat: true,
        features: [
          "Gemini Ultra",
          "2TB storage",
          "Google One benefits",
          "Advanced coding",
        ],
      },
    ],
  },
  windsurf: {
    tool: "windsurf",
    displayName: "Windsurf",
    category: "ide",
    sourceUrl: "https://windsurf.com/pricing",
    verifiedDate: "2026-05-15",
    plans: [
      {
        plan: "free",
        pricePerSeat: 0,
        isPerSeat: false,
        features: ["Limited completions", "Basic AI features"],
      },
      {
        plan: "pro",
        pricePerSeat: 15,
        isPerSeat: true,
        features: [
          "Unlimited completions",
          "Premium models",
          "Priority support",
        ],
      },
      {
        plan: "team",
        pricePerSeat: 30,
        isPerSeat: true,
        minSeats: 2,
        features: [
          "Everything in Pro",
          "Team management",
          "Centralized billing",
          "Usage analytics",
        ],
      },
    ],
  },
};

// ============================================================
// Helper Functions
// ============================================================

export function getPricing(tool: AITool): ToolPricing {
  return PRICING_DATA[tool];
}

export function getPlanPricing(tool: AITool, plan: string): PlanPricing | null {
  const toolPricing = PRICING_DATA[tool];
  return toolPricing.plans.find((p) => p.plan === plan) || null;
}

export function getPlansForTool(tool: AITool): PlanPricing[] {
  return PRICING_DATA[tool].plans;
}

export function calculatePlanCost(
  tool: AITool,
  plan: string,
  seats: number
): number {
  const planPricing = getPlanPricing(tool, plan);
  if (!planPricing) return 0;
  if (planPricing.isApiPlan) return 0; // API plans are usage-based
  return planPricing.isPerSeat
    ? planPricing.pricePerSeat * seats
    : planPricing.pricePerSeat;
}

export function getCheaperPlan(
  tool: AITool,
  currentPlan: string
): PlanPricing | null {
  const plans = getPlansForTool(tool);
  const currentIndex = plans.findIndex((p) => p.plan === currentPlan);
  if (currentIndex <= 0) return null;
  return plans[currentIndex - 1];
}

export function getToolCategory(tool: AITool): string {
  return PRICING_DATA[tool].category;
}
