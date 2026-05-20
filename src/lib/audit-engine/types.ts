import { z } from "zod";

// ============================================================
// Tool & Plan Definitions
// ============================================================

export const AI_TOOLS = [
  "cursor",
  "github_copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "windsurf",
] as const;

export type AITool = (typeof AI_TOOLS)[number];

export const TOOL_DISPLAY_NAMES: Record<AITool, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export const USE_CASES = [
  "coding",
  "writing",
  "data",
  "research",
  "mixed",
] as const;

export type UseCase = (typeof USE_CASES)[number];

export const USE_CASE_LABELS: Record<UseCase, string> = {
  coding: "Coding & Development",
  writing: "Writing & Content",
  data: "Data Analysis",
  research: "Research",
  mixed: "Mixed / General",
};

// ============================================================
// Pricing Types
// ============================================================

export interface PlanPricing {
  plan: string;
  pricePerSeat: number;
  isPerSeat: boolean;
  minSeats?: number;
  features: string[];
  isApiPlan?: boolean;
}

export interface ToolPricing {
  tool: AITool;
  displayName: string;
  plans: PlanPricing[];
  category: "ide" | "chatbot" | "api";
  sourceUrl: string;
  verifiedDate: string;
}

// ============================================================
// Input Schemas
// ============================================================

export const toolInputSchema = z.object({
  tool: z.enum(AI_TOOLS),
  plan: z.string().min(1, "Plan is required"),
  monthlySpend: z.number().min(0, "Spend must be non-negative"),
  seatCount: z.number().int().min(1, "At least 1 seat required"),
});

export const auditInputSchema = z.object({
  tools: z.array(toolInputSchema).min(1, "Select at least one tool"),
  teamSize: z.number().int().min(1, "Team size must be at least 1"),
  primaryUseCase: z.enum(USE_CASES),
});

export type ToolInput = z.infer<typeof toolInputSchema>;
export type AuditInput = z.infer<typeof auditInputSchema>;

// ============================================================
// Result Types
// ============================================================

export interface ToolRecommendation {
  tool: AITool;
  displayName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedPlan: string;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
  alternativeTool?: string;
  alternativeReason?: string;
  severity: "high" | "medium" | "low" | "optimal";
}

export interface AuditResult {
  id?: string;
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  recommendations: ToolRecommendation[];
  credexEligible: boolean;
  credexEstimatedSavings: number;
  overlapWarnings: string[];
  summary?: string;
  shareId?: string;
  createdAt?: string;
}

// ============================================================
// API Types
// ============================================================

export interface LeadCapture {
  email: string;
  company?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
}

export const leadCaptureSchema = z.object({
  email: z.string().email("Valid email required"),
  company: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().int().optional(),
  auditId: z.string().min(1),
  honeypot: z.string().max(0, "Bot detected").optional(),
});
