import { NextRequest, NextResponse } from "next/server";
import { generateAISummary } from "@/lib/ai/summary";
import { AuditResult } from "@/lib/audit-engine/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { result, stack } = body as {
      result: AuditResult;
      stack: string[];
    };

    if (!result || !stack) {
      return NextResponse.json(
        { error: "Missing result or stack data" },
        { status: 400 }
      );
    }

    const summary = await generateAISummary(result, stack);

    // Try updating the audit record with the summary
    try {
      if (
        result.id &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ) {
        const { supabaseAdmin } = await import("@/lib/supabase");
        await supabaseAdmin
          .from("audits")
          .update({ summary })
          .eq("id", result.id);
      }
    } catch (dbError) {
      console.error("Failed to update audit summary:", dbError);
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
