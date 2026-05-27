import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, summary, totalSavings, annualSavings, credexEligible, reportUrl } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing recipient" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    const { sendAuditEmail } = await import("@/lib/email/templates");

    const sent = await sendAuditEmail({
      to,
      summary: summary || "Your AI spend audit is ready!",
      totalSavings: totalSavings || 0,
      annualSavings: annualSavings || 0,
      credexEligible: credexEligible || false,
      reportUrl,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
