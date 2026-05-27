import { NextRequest, NextResponse } from "next/server";
import { leadCaptureSchema } from "@/lib/audit-engine/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate (includes honeypot check)
    const parseResult = leadCaptureSchema.safeParse(body);
    if (!parseResult.success) {
      // If honeypot was filled, silently accept (bot thinks it worked)
      const honeypotError = parseResult.error.issues.find(
        (i) => i.path.includes("honeypot")
      );
      if (honeypotError) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, company, role, teamSize, auditId } = parseResult.data;

    // Save to Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { saveLeadCapture } = await import("@/lib/supabase");
        await saveLeadCapture({ email, company, role, teamSize, auditId });
      }
    } catch (dbError) {
      console.error("Failed to save lead:", dbError);
    }

    // Send email (non-blocking)
    try {
      if (process.env.RESEND_API_KEY) {
        const { sendAuditEmail } = await import("@/lib/email/templates");

        // Fetch audit data for email
        let summary = "Your AI spend audit is ready. Visit AISpendLens to view your full results.";
        let totalSavings = 0;
        let annualSavings = 0;
        let credexEligible = false;

        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { supabaseAdmin } = await import("@/lib/supabase");
          const { data: audit } = await supabaseAdmin
            .from("audits")
            .select("results, summary, share_id")
            .eq("id", auditId)
            .single();

          if (audit) {
            summary = audit.summary || summary;
            const results = audit.results as {
              totalMonthlySavings: number;
              totalAnnualSavings: number;
              credexEligible: boolean;
            };
            totalSavings = results.totalMonthlySavings || 0;
            annualSavings = results.totalAnnualSavings || 0;
            credexEligible = results.credexEligible || false;
          }
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aispendlens.com";
        await sendAuditEmail({
          to: email,
          summary,
          totalSavings,
          annualSavings,
          credexEligible,
          reportUrl: `${appUrl}/audit/results`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
