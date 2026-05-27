import { NextRequest, NextResponse } from "next/server";
import { auditInputSchema } from "@/lib/audit-engine/types";
import { runAudit } from "@/lib/audit-engine/recommendations";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const parseResult = auditInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Run audit engine
    const result = runAudit(parseResult.data);

    // Try saving to Supabase (non-blocking, graceful failure)
    let auditId: string | undefined;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { saveAudit } = await import("@/lib/supabase");
        const saved = await saveAudit({
          stack: parseResult.data,
          results: result,
        });
        auditId = saved.id;
      }
    } catch (dbError) {
      console.error("Failed to save audit to DB:", dbError);
      // Continue without DB — audit still works
    }

    return NextResponse.json({
      ...result,
      id: auditId,
    });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
