import { AuditResult } from "@/lib/audit-engine/types";

// ============================================================
// AI Summary Generation via Anthropic
// ============================================================

const SYSTEM_PROMPT = `You are an AI spend optimization advisor for startups. Generate a concise, actionable ~100 word summary of the user's AI tool audit results. Be specific about dollar amounts and tool names. Use a professional but friendly tone. Focus on the biggest savings opportunity first, then mention secondary optimizations. If the stack is already optimized, acknowledge it and suggest monitoring strategies. Do not use bullet points — write in flowing prose. End with a forward-looking recommendation.`;

export function buildUserPrompt(result: AuditResult, stack: string[]): string {
  const toolSummaries = result.recommendations
    .map(
      (r) =>
        `${r.displayName}: ${r.currentPlan} plan at $${r.currentSpend}/mo → recommend ${r.recommendedPlan} at $${r.recommendedSpend}/mo (save $${r.monthlySavings}/mo). Reason: ${r.reasoning}`
    )
    .join("\n");

  return `Audit Results Summary:
- Current monthly AI spend: $${result.totalCurrentSpend}
- Recommended spend: $${result.totalRecommendedSpend}
- Monthly savings: $${result.totalMonthlySavings}
- Annual savings: $${result.totalAnnualSavings}
- Tools audited: ${stack.join(", ")}
${result.credexEligible ? "- Eligible for Credex credit optimization" : ""}
${result.overlapWarnings.length > 0 ? `- Warnings: ${result.overlapWarnings.join("; ")}` : ""}

Per-tool breakdown:
${toolSummaries}

Generate a concise ~100 word summary.`;
}

export async function generateAISummary(
  result: AuditResult,
  stack: string[]
): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn("No Anthropic API key found, using fallback summary");
      return generateFallbackSummary(result);
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt(result, stack),
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status);
      return generateFallbackSummary(result);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      return generateFallbackSummary(result);
    }
    return text;
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return generateFallbackSummary(result);
  }
}

function generateFallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, recommendations } = result;

  if (totalMonthlySavings === 0) {
    return "Your AI stack is well-optimized — you're making smart choices with your tooling. No immediate savings opportunities were found. As your team grows, revisit your plans quarterly to ensure you're still on the right tiers. Consider consolidating to fewer tools if you add new ones.";
  }

  const topSavings = recommendations
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings);

  const topTool = topSavings[0];

  let summary = `Your AI stack audit revealed $${totalMonthlySavings.toLocaleString()}/month in savings opportunities — $${totalAnnualSavings.toLocaleString()} annually. `;

  if (topTool) {
    summary += `The biggest win: switch ${topTool.displayName} from ${topTool.currentPlan} to ${topTool.recommendedPlan} to save $${topTool.monthlySavings}/mo. `;
  }

  if (topSavings.length > 1) {
    summary += `${topSavings.length} optimizations found across your stack. `;
  }

  if (result.credexEligible) {
    summary += `Your spend level qualifies for Credex credit optimization for additional savings.`;
  } else {
    summary += `Implement these changes to start saving immediately.`;
  }

  return summary;
}
