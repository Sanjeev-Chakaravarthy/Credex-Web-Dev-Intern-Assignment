import { NextRequest, NextResponse } from "next/server";
import { generateShareId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auditId } = body;

    if (!auditId) {
      return NextResponse.json(
        { error: "Missing auditId" },
        { status: 400 }
      );
    }

    const shareId = generateShareId();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aispendlens.com";

    // Update audit with share_id in Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { updateAuditShareId } = await import("@/lib/supabase");
        await updateAuditShareId(auditId, shareId);
      }
    } catch (dbError) {
      console.error("Failed to update share ID:", dbError);
    }

    return NextResponse.json({
      shareId,
      shareUrl: `${appUrl}/report/${shareId}`,
    });
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
