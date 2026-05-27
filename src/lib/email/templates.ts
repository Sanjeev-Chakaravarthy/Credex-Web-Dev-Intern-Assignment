import { AuditResult } from "@/lib/audit-engine/types";

export function buildAuditEmailHtml(params: {
  summary: string;
  totalSavings: number;
  annualSavings: number;
  credexEligible: boolean;
  reportUrl?: string;
}): string {
  const { summary, totalSavings, annualSavings, credexEligible, reportUrl } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Spend Audit Results — AISpendLens</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Logo -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom: 32px;">
              <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                AI<span style="color: #818cf8;">SpendLens</span>
              </span>
            </td>
          </tr>
        </table>

        <!-- Hero Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%); border-radius: 16px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.1em;">Your Audit Results</p>
              <p style="margin: 0 0 4px; font-size: 40px; font-weight: 800; color: #ffffff;">$${totalSavings.toLocaleString()}<span style="font-size: 18px; color: #a5b4fc;">/mo</span></p>
              <p style="margin: 0; font-size: 16px; color: #c7d2fe;">Potential monthly savings identified</p>
              <p style="margin: 16px 0 0; font-size: 24px; font-weight: 600; color: #34d399;">$${annualSavings.toLocaleString()} <span style="font-size: 14px; color: #6ee7b7;">annually</span></p>
            </td>
          </tr>
        </table>

        <!-- Summary -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #141420; border: 1px solid #1e1e30; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #ffffff;">AI-Powered Summary</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">${summary}</p>
            </td>
          </tr>
        </table>

        ${reportUrl ? `
        <!-- View Report CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td align="center">
              <a href="${reportUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600;">View Full Report →</a>
            </td>
          </tr>
        </table>
        ` : ""}

        ${credexEligible ? `
        <!-- Credex CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #065f46, #064e3b); border: 1px solid #047857; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #ffffff;">💰 Unlock Even More Savings with Credex</p>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #a7f3d0;">Your spend level qualifies for Credex credit optimization. Many startups save an additional 15-25% on their SaaS spend through Credex.</p>
              <a href="https://credex.com" style="display: inline-block; padding: 10px 24px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Explore Credex →</a>
            </td>
          </tr>
        </table>
        ` : ""}

        <!-- Consultation -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #141420; border: 1px solid #1e1e30; border-radius: 12px; margin-bottom: 32px;">
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #ffffff;">Need Help Implementing?</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">Our team can help you optimize your AI stack in a free 15-minute consultation. Reply to this email to schedule a call.</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #1e1e30;">
              <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center;">
                AISpendLens — AI Spend Optimization for Startups<br>
                <a href="#" style="color: #6366f1; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendAuditEmail(params: {
  to: string;
  summary: string;
  totalSavings: number;
  annualSavings: number;
  credexEligible: boolean;
  reportUrl?: string;
}): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("No Resend API key, skipping email");
      return false;
    }

    const html = buildAuditEmailHtml(params);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "AISpendLens <onboarding@resend.dev>",
        to: params.to,
        subject: `Your AI Spend Audit: $${params.totalSavings.toLocaleString()}/mo savings found`,
        html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}
