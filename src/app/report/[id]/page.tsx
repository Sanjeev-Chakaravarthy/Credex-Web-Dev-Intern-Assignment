import { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { AuditResult } from "@/lib/audit-engine/types";
import ReportClient from "./ReportClient";

// ============================================================
// Mock Demo Data Fallback
// ============================================================

const MOCK_AUDIT_RESULT: AuditResult = {
  id: "demo-stack",
  totalCurrentSpend: 1332,
  totalRecommendedSpend: 772,
  totalMonthlySavings: 560,
  totalAnnualSavings: 6720,
  credexEligible: true,
  credexEstimatedSavings: 180,
  overlapWarnings: [
    "Detected overlapping AI licenses: Both Cursor Business and Claude Team plans are configured. Recommend consolidating active seat counts.",
    "Redundant tooling configured: GitHub Copilot enterprise licenses are redundant with active Cursor Pro subscriptions."
  ],
  recommendations: [
    {
      tool: "cursor",
      displayName: "Cursor",
      currentPlan: "Business",
      currentSpend: 400,
      recommendedPlan: "Pro",
      recommendedSpend: 200,
      monthlySavings: 200,
      annualSavings: 2400,
      reasoning: "Your team size is 10 but you configured Cursor Business. Downgrading to Cursor Pro yields identical speed and capacity limits while cutting subscription spend in half.",
      severity: "high"
    },
    {
      tool: "claude",
      displayName: "Claude",
      currentPlan: "Team",
      currentSpend: 300,
      recommendedPlan: "Pro (Consolidated)",
      recommendedSpend: 100,
      monthlySavings: 200,
      annualSavings: 2400,
      reasoning: "Overlap detected with active Cursor licenses. Keeping Claude subscriptions only for 5 power writers/researchers while migrating engineers fully to Cursor.",
      severity: "high"
    },
    {
      tool: "chatgpt",
      displayName: "ChatGPT",
      currentPlan: "Team",
      currentSpend: 120,
      recommendedPlan: "Plus (Silo removal)",
      recommendedSpend: 40,
      monthlySavings: 80,
      annualSavings: 960,
      reasoning: "Swapped individual accounts for developers to shared direct API keys or centralized credits, preventing duplicate billing profiles.",
      severity: "medium"
    },
    {
      tool: "github_copilot",
      displayName: "GitHub Copilot",
      currentPlan: "Enterprise",
      currentSpend: 160,
      recommendedPlan: "Canceled",
      recommendedSpend: 0,
      monthlySavings: 160,
      annualSavings: 1920,
      reasoning: "Fully redundant after your development team completed migration to Cursor IDE. Canceled 8 active licenses.",
      severity: "high"
    }
  ]
};

const MOCK_SUMMARY = "Based on our deterministic rules, your startup is spending $1,332/mo on redundant AI subscriptions. Consolidating Claude seats down to active users, migrating all engineers fully to Cursor Pro, and canceling GitHub Copilot licenses immediately drops your AI SaaS bill to $772/mo. That is a net reduction of 42% ($560/mo or $6,720/yr in recurring spend savings).";

// ============================================================
// Metadata Generation (Dynamic OG Tags + Twitter Cards)
// ============================================================

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aispendlens.com";

  let title = "AI Spend Audit Report — AISpendLens";
  let description = "See how this startup optimized their AI tool spending with AISpendLens.";

  try {
    if (id === "demo-stack" || id === "unknown") {
      title = `Saving $560/mo on AI Tools — AISpendLens`;
      description = `This startup found $6,720/year in AI spend savings across 4 tools.`;
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { getAuditByShareId } = await import("@/lib/supabase");
      const audit = await getAuditByShareId(id);
      if (audit) {
        const results = audit.results as AuditResult;
        title = `Saving $${results.totalMonthlySavings.toLocaleString()}/mo on AI Tools — AISpendLens`;
        description = `This startup found $${results.totalAnnualSavings.toLocaleString()}/year in AI spend savings across ${results.recommendations.length} tools.`;
      }
    }
  } catch {
    // Graceful fallback to default values
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/report/${id}`,
      siteName: "AISpendLens",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ============================================================
// Fetch Database Operations
// ============================================================

async function getAuditData(shareId: string) {
  if (shareId === "demo-stack" || shareId === "unknown") {
    return {
      results: MOCK_AUDIT_RESULT,
      summary: MOCK_SUMMARY,
      isDemo: true,
    };
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return {
        results: MOCK_AUDIT_RESULT,
        summary: MOCK_SUMMARY,
        isDemo: true,
      };
    }
    const { getAuditByShareId } = await import("@/lib/supabase");
    const data = await getAuditByShareId(shareId);
    
    if (!data) {
      return {
        results: MOCK_AUDIT_RESULT,
        summary: MOCK_SUMMARY,
        isDemo: true,
      };
    }

    return {
      results: data.results as AuditResult,
      summary: data.summary as string | null,
      isDemo: false,
    };
  } catch {
    return {
      results: MOCK_AUDIT_RESULT,
      summary: MOCK_SUMMARY,
      isDemo: true,
    };
  }
}

// ============================================================
// Public Report Route (Server Component Wrapper)
// ============================================================

export default async function PublicReportPage({ params }: Props) {
  const { id } = await params;
  const data = await getAuditData(id);

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      {/* Top navbar */}
      <nav className="border-b border-[#1c1c1f] bg-[#050505]">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-lg bg-[#6366f1] flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform duration-200">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[13.5px] font-bold text-white tracking-tight">
              AISpendLens
            </span>
          </Link>
          <span className="text-[11.5px] font-bold text-[#6366f1] bg-[#6366f1]/5 border border-[#6366f1]/15 px-3 py-1.5 rounded-lg uppercase tracking-wider">
            📊 Shared Report
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-8">
        
        {/* Public Report client renderer */}
        <ReportClient
          results={data.results}
          summary={data.summary}
          isDemo={data.isDemo}
        />

        {/* Credibility Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[11px] text-zinc-600 pt-2">
          <span className="flex items-center gap-1.5">
            <svg className="h-3 w-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Pricing verified from official vendor pages
          </span>
          <span className="hidden sm:inline text-zinc-800">·</span>
          <span>Last pricing refresh: May 2026</span>
        </div>

        {/* CTA to run own audit */}
        <div className="text-center py-10 border-t border-[#1c1c1f]/40 space-y-6">
          <h3 className="text-2xl font-extrabold text-white tracking-tight leading-none">
            Audit your own startup AI spend
          </h3>
          <p className="text-zinc-500 max-w-xs mx-auto text-[13.5px]">
            Takes 2 minutes, verified pricing databases, no credit card.
          </p>
          <div>
            <Link
              href="/audit"
              className="btn-accent py-3.5 px-8 text-[14px] font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              Start My Free Cost Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
