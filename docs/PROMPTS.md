# AI Prompts

> All prompts used in AISpendLens, including the production prompt, failed experiments, and fallback logic.

---

## Table of Contents

- [Production Prompt: Audit Summary](#production-prompt-audit-summary)
- [Failed Prompt Experiments](#failed-prompt-experiments)
- [Fallback Template Logic](#fallback-template-logic)
- [Prompt Engineering Notes](#prompt-engineering-notes)

---

## Production Prompt: Audit Summary

This is the prompt used to generate the executive summary on the results page. It runs after the deterministic audit engine has calculated all savings and recommendations.

### System Prompt

```
You are a pragmatic startup CFO advisor. You've just reviewed an AI tool spend audit for a startup engineering team.

Write a 2-3 sentence executive summary of the audit findings. Be direct, specific, and actionable. Reference actual dollar amounts. If there are significant savings opportunities, lead with the biggest one. If the stack is already optimized, say so confidently.

Rules:
- Maximum 3 sentences
- Use specific dollar amounts from the data provided
- Do NOT use bullet points or lists
- Do NOT use markdown formatting
- Do NOT hedge with phrases like "it might be worth considering"
- Write as if you're sending a Slack message to the CTO, not writing a report
- If savings are under $50/month total, focus on the positive — their stack is well-optimized
- If savings are over $500/month, be urgent — this is money on fire
```

### User Prompt Template

```
Here's the AI tool spend audit for a ${teamSize}-person ${primaryUseCase} team:

Current monthly spend: $${totalCurrentSpend}
Recommended monthly spend: $${totalRecommendedSpend}
Potential monthly savings: $${totalMonthlySavings} ($${totalAnnualSavings}/year)

Recommendations:
${recommendations.map(r =>
  `- ${r.displayName}: ${r.currentPlan} ($${r.currentSpend}/mo) → ${r.recommendedPlan} ($${r.recommendedSpend}/mo). Saves $${r.monthlySavings}/mo. ${r.reasoning}`
).join('\n')}

${overlapWarnings.length > 0 ? `Tool overlaps detected:\n${overlapWarnings.map(w => `- ${w}`).join('\n')}` : 'No tool overlaps detected.'}

${credexEligible ? `This team qualifies for Credex procurement optimization (estimated savings: $${credexEstimatedSavings}/year).` : ''}

Write the executive summary.
```

### Example Output

> "You're spending $4,200/month on AI tools for a 15-person team, but $1,800 of that is going to waste. The biggest hit: you're paying for both Cursor Teams ($600/mo) and GitHub Copilot Enterprise ($585/mo) when they do essentially the same thing — dropping one saves $585/month instantly. Combined with downgrading three ChatGPT Pro seats to Plus, you'd save $2,100/month or $25,200/year."

### API Call Configuration

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6-20260320',
  max_tokens: 1024,
  temperature: 0.3,     // Low temperature for consistent, factual output
  system: SYSTEM_PROMPT,
  messages: [{
    role: 'user',
    content: buildUserPrompt(auditResult),
  }],
});
```

**Why `temperature: 0.3`?**
We want the summary to be consistent and grounded in the data. At `temperature: 0.7+`, Claude gets creative with phrasing but occasionally invents savings amounts or recommends tools we didn't analyze. At `0.3`, it sticks closely to the numbers provided.

---

## Failed Prompt Experiments

### Experiment 1: "Act as a Financial Analyst"

**Prompt:**
```
You are a senior financial analyst at a Big 4 consulting firm. Analyze the following 
AI tool spend data and provide a comprehensive report with executive summary, 
detailed findings, and strategic recommendations.
```

**Why it failed:**
- Output was 500+ words with section headers, bullet points, and formal business language
- Felt like a McKinsey deck, not a useful product feature
- Users don't want a "comprehensive report" — they want the TL;DR
- The formatting (headers, bullets) broke our UI card layout
- Took 3-5 seconds to generate vs. 1-2 seconds for the shorter prompt

**Lesson learned:** Shorter is better. The summary should feel like a smart colleague DM'ing you, not a consultant billing you by the hour.

---

### Experiment 2: "Provide a JSON response"

**Prompt:**
```
Analyze this AI spend audit data and return a JSON response with the following structure:
{
  "headline": "One-line summary",
  "key_finding": "Most important finding",
  "action_items": ["Action 1", "Action 2", "Action 3"],
  "urgency": "high" | "medium" | "low",
  "tone": "positive" | "neutral" | "concerned"
}
```

**Why it failed:**
- Added unnecessary complexity — we already have all the structured data from the deterministic engine
- The JSON parsing occasionally failed (missing quotes, trailing commas)
- The `headline` and `key_finding` fields often contained the same information
- `urgency` and `tone` fields added no value over our existing severity classification
- We were using Claude to structure data that was already structured — a waste of API tokens and latency

**Lesson learned:** Don't use an LLM to generate structured data when you already have structured data. Use it for what it's good at: natural language generation. We already have the numbers; we need Claude to turn them into a compelling narrative.

---

### Experiment 3: "Compare to industry benchmarks"

**Prompt:**
```
You are an AI tools advisor for startups. Compare this team's AI spend against 
industry benchmarks and provide context for their spending patterns.

Industry benchmarks:
- Average Series A startup spends $2,800/mo on AI tools
- Median AI tool count per engineering team: 3.2
- Most common overlap: IDE + chatbot subscriptions
- 40% of startups overpay by more than 30%

Analyze their spend relative to these benchmarks and explain where they stand.
```

**Why it failed:**
- The "industry benchmarks" were fabricated — we don't have real benchmark data
- Claude would confidently state "you're spending 40% above the industry average" when the benchmarks were made up
- Users might make real financial decisions based on fake benchmarks — this is irresponsible
- The comparison added word count without adding actionable insight
- If we later get real benchmark data, this approach could work — but not with invented numbers

**Lesson learned:** Never give an LLM fake data and ask it to reason about it. It will present fabricated benchmarks as authoritative facts. Either have real data or don't include benchmarks at all.

---

### Experiment 4: "Roast their spending"

**Prompt:**
```
You're a brutally honest startup advisor known for your sharp wit. Roast this 
team's AI tool spending. Be funny but constructive. Think of it like a comedy 
roast — the goal is to make them laugh while making a point about their waste.
```

**Why it failed:**
- Tone was inconsistent — sometimes genuinely funny, sometimes just mean
- "Your team is paying $4,200/month on AI tools. That's more than your junior dev makes" — this lands wrong
- Some outputs were offensive (making jokes about layoffs, cost-cutting)
- Inappropriate for a product that CTOs might share with their CFO
- The "humor" felt forced and unprofessional at low temperature, but unhinged at high temperature

**Lesson learned:** Humor in AI-generated text is incredibly hard to calibrate. What's funny to a developer might be offensive to a finance person. For a B2B tool, professional-but-direct is the right tone. Save the roasts for X/Twitter marketing copy.

---

## Fallback Template Logic

When Claude is unavailable (API error, timeout, rate limit, invalid key), we generate a template-based summary. This ensures the user always sees a summary, even if the AI service is down.

### Fallback Template Code

```typescript
function generateFallbackSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, recommendations, overlapWarnings, credexEligible } = result;

  // Sort recommendations by savings, descending
  const topRecs = [...recommendations]
    .filter(r => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings);

  // Optimal stack — no savings to be found
  if (totalMonthlySavings === 0) {
    return `Your AI tool stack is well-optimized. Based on your current plans and team size, you're not leaving money on the table. Keep monitoring as your team grows — pricing tiers that make sense at ${result.recommendations[0]?.currentPlan || 'your current size'} may not at 2x headcount.`;
  }

  // Small savings (under $50/mo)
  if (totalMonthlySavings < 50) {
    const topRec = topRecs[0];
    return `Your AI stack is mostly optimized, with minor savings available. The main opportunity: ${topRec.displayName} could be moved from ${topRec.currentPlan} to ${topRec.recommendedPlan}, saving $${topRec.monthlySavings}/month. Total potential savings: $${totalAnnualSavings}/year.`;
  }

  // Medium savings ($50–500/mo)
  if (totalMonthlySavings < 500) {
    const topRec = topRecs[0];
    const overlapNote = overlapWarnings.length > 0
      ? ` Notable overlap detected: ${overlapWarnings[0]}`
      : '';
    return `You're spending more than necessary on AI tools — $${totalMonthlySavings}/month in potential savings identified. Biggest opportunity: ${topRec.displayName} (${topRec.currentPlan} → ${topRec.recommendedPlan}, saves $${topRec.monthlySavings}/mo).${overlapNote} Total annual savings: $${totalAnnualSavings}.`;
  }

  // Large savings ($500+/mo)
  const topTwo = topRecs.slice(0, 2);
  const credexNote = credexEligible
    ? ' Your savings level qualifies you for Credex procurement optimization, which could unlock additional volume discounts.'
    : '';
  return `Significant AI spend optimization opportunity: $${totalMonthlySavings}/month ($${totalAnnualSavings}/year) in potential savings. Top recommendations: ${topTwo.map(r => `${r.displayName} (${r.currentPlan} → ${r.recommendedPlan}, saves $${r.monthlySavings}/mo)`).join('; ')}.${credexNote}`;
}
```

### Template Output Examples

**Optimal stack:**
> "Your AI tool stack is well-optimized. Based on your current plans and team size, you're not leaving money on the table. Keep monitoring as your team grows — pricing tiers that make sense at Pro may not at 2x headcount."

**Small savings:**
> "Your AI stack is mostly optimized, with minor savings available. The main opportunity: GitHub Copilot could be moved from Business to Pro, saving $9/month. Total potential savings: $108/year."

**Large savings:**
> "Significant AI spend optimization opportunity: $850/month ($10,200/year) in potential savings. Top recommendations: Cursor (Teams → Pro, saves $400/mo); ChatGPT (Pro $200 → Plus, saves $360/mo). Your savings level qualifies you for Credex procurement optimization, which could unlock additional volume discounts."

---

## Prompt Engineering Notes

### What works for this use case:
1. **Constrain length aggressively** — "Maximum 3 sentences" prevents runaway output
2. **Specify anti-patterns** — "Do NOT use bullet points" prevents formatting that breaks our UI
3. **Provide the exact data** — Don't make Claude compute; give it the numbers and ask it to narrate
4. **Set the tone via analogy** — "Write as if you're sending a Slack message to the CTO" is more effective than "be concise and professional"
5. **Low temperature (0.3)** — Consistency matters more than creativity for financial data

### What doesn't work:
1. **Asking Claude to compute** — It will sometimes get the math wrong. Always provide pre-calculated numbers.
2. **Open-ended instructions** — "Analyze this data" produces wildly different outputs. Be specific about format and length.
3. **Fake data in the prompt** — Claude treats everything in the prompt as truth. Don't provide benchmarks you made up.
4. **High temperature for financial content** — Above 0.5, Claude starts making creative claims that aren't grounded in the data.
