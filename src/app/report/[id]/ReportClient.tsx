"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Share2,
  Brain,
  Sparkles,
  Trophy,
  AlertTriangle,
  TrendingDown,
  ArrowDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { AuditResult } from "@/lib/audit-engine/types";

// ============================================================
// Configurations
// ============================================================

const SEVERITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6366f1",
  optimal: "#10b981",
};

// ============================================================
// Animated Counting Component
// ============================================================

function AnimatedCounter({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 50;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
    </span>
  );
}

// ============================================================
// Client Rendering for Public Report
// ============================================================

export default function ReportClient({
  results,
  summary,
  isDemo,
}: {
  results: AuditResult;
  summary: string | null;
  isDemo: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isOptimized = results.totalMonthlySavings < 100;
  const pct = results.totalCurrentSpend > 0 ? Math.round((results.totalMonthlySavings / results.totalCurrentSpend) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Demo Warning Banner */}
      {isDemo && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[13px] text-amber-400">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <div>
            <span className="font-bold">Viewing Demo Spend Report:</span> The Supabase database connection is offline. AISpendLens loaded this high-fidelity sample stack to demonstrate optimization analytics.
          </div>
        </div>
      )}

      {/* Savings Hero Widget */}
      {isOptimized ? (
        <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-10 text-center shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4 border border-[#10b981]/20">
            <Trophy className="h-6 w-6 text-[#10b981]" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">This stack is optimized!</h2>
          <p className="text-[14px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
            The audit engine verified that this startup has configured active licenses efficiently.
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-[#0b0b0c] border border-indigo-500/15 card-glow-purple p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#6366f1]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/5 border border-[#10b981]/15 text-[12px] font-bold text-[#10b981]">
              <TrendingDown className="h-4 w-4" />
              {pct}% potential savings identified
            </div>

            <div className="space-y-1">
              <p className="text-[12.5px] text-zinc-500 font-bold uppercase tracking-wider">
                MONTHLY SAVINGS FOUND
              </p>
              <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none">
                <AnimatedCounter value={results.totalMonthlySavings} />
                <span className="text-xl font-normal text-zinc-600 tracking-normal"> / MONTH</span>
              </h1>
            </div>

            <div className="inline-block px-5 py-2.5 rounded-xl bg-[#050505] border border-[#1c1c1f] text-[14px] text-zinc-400">
              Projections achieve{" "}
              <span className="text-[#10b981] font-bold">
                <AnimatedCounter value={results.totalAnnualSavings} />
              </span>{" "}
              saved per year
            </div>
          </div>
        </div>
      )}

      {/* Overlapping warnings */}
      {results.overlapWarnings.length > 0 && (
        <div className="space-y-2">
          {results.overlapWarnings.map((warning: string, i: number) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-[#0b0b0c] border border-[#1c1c1f] border-l-[3px] border-l-[#f59e0b] rounded-2xl text-[13px] text-zinc-400"
            >
              <AlertTriangle className="h-4.5 w-4.5 text-[#f59e0b] shrink-0 mt-0.5" />
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* connected recommendations timeline */}
      <div className="space-y-6">
        <h3 className="text-[15px] font-bold text-white tracking-tight uppercase tracking-widest text-zinc-500">
          RECOMMENDED ACTION CHECKLIST
        </h3>

        <div className="space-y-0">
          {results.recommendations.map((rec, i) => {
            const isLast = i === results.recommendations.length - 1;
            const severityColor = SEVERITY_COLORS[rec.severity] || "#6366f1";

            return (
              <motion.div
                key={rec.tool}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="relative pl-8 pb-6"
              >
                {!isLast && <div className="absolute left-[9px] top-6 bottom-0 w-[1px] bg-[#1c1c1f]" />}

                <div
                  className="absolute left-0 top-[5px] w-5 h-5 rounded-full border bg-[#050505] flex items-center justify-center z-10"
                  style={{ borderColor: severityColor }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: severityColor }}
                  />
                </div>

                <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-5 md:p-6 space-y-4 hover:border-zinc-800 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[15px] font-bold text-white tracking-tight">{rec.displayName}</h4>
                      <p className="text-[11.5px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
                        ACTIVE TIER: {rec.currentPlan}
                      </p>
                    </div>
                    <div>
                      {rec.monthlySavings > 0 ? (
                        <span className="inline-flex items-center text-[12px] font-bold text-[#10b981] bg-[#10b981]/5 border border-[#10b981]/15 px-3 py-1.5 rounded-full">
                          SAVE ${rec.monthlySavings}/mo
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[12px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
                          OPTIMIZED
                        </span>
                      )}
                    </div>
                  </div>

                  {rec.monthlySavings > 0 && (
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3.5 px-4 bg-[#050505] border border-[#1c1c1f] rounded-xl">
                      <div>
                        <p className="text-[9.5px] text-zinc-600 font-bold uppercase">CURRENT</p>
                        <p className="text-[14.5px] font-bold text-white tracking-tight mt-0.5">${rec.currentSpend}/mo</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-700" />
                      <div>
                        <p className="text-[9.5px] text-[#10b981] font-bold uppercase">RECOMMENDED</p>
                        <p className="text-[14.5px] font-bold text-[#10b981] tracking-tight mt-0.5">${rec.recommendedSpend}/mo</p>
                      </div>
                    </div>
                  )}

                  <p className="text-[13.5px] text-zinc-400 leading-relaxed">{rec.reasoning}</p>

                  {rec.alternativeTool && (
                    <div className="p-3.5 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-xl flex items-start gap-2.5">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-[12.5px] text-zinc-400 leading-relaxed">
                        <span className="text-white font-bold">Consolidation: </span>
                        {rec.alternativeReason}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Spend comparison Bar chart */}
      <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-6 space-y-6">
        <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SPEND COMPARISON BY TOOL</h4>

        <div className="h-60 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={results.recommendations
                .filter((r) => r.currentSpend > 0)
                .map((r) => ({
                  name: r.displayName,
                  current: r.currentSpend,
                  recommended: r.recommendedSpend,
                }))}
              barGap={4}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0c",
                  border: "1px solid #1c1c1f",
                  borderRadius: "12px",
                  color: "#fafafa",
                  fontSize: "12.5px",
                  fontFamily: "inherit",
                }}
                formatter={(value) => [`$${value}/mo`]}
              />
              <Bar
                dataKey="current"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                name="Current"
              />
              <Bar
                dataKey="recommended"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Recommended"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 border-t border-[#1c1c1f]/40 pt-4 text-[12px]">
          <div className="flex items-center gap-2 text-zinc-500">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]" />
            Current Monthly Spend
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
            Recommended Optimized Spend
          </div>
        </div>
      </div>

      {/* Claude AI briefing report */}
      {summary && (
        <div className="bg-[#0b0b0c] border border-[#1c1c1f] border-l-[3px] border-l-[#a855f7] rounded-2xl p-6 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-white">
              <Brain className="h-4.5 w-4.5 text-[#a855f7]" />
              <h3 className="text-[14.5px] font-bold tracking-tight">AI Briefing Summary</h3>
            </div>
            <span className="text-[10px] font-bold text-[#a855f7] bg-[#a855f7]/5 border border-[#a855f7]/15 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              CLAUDE AGENT
            </span>
          </div>
          <p className="text-[13.5px] text-zinc-300 leading-relaxed font-mono">
            {summary}
          </p>
        </div>
      )}

      {/* Credex managed purchase rebating conditional CTA */}
      {results.credexEligible && (
        <div className="bg-[#0b0b0c] border border-[#1c1c1f] border-l-[3px] border-l-[#10b981] rounded-2xl p-6 relative overflow-hidden shadow-md">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Sparkles className="h-4.5 w-4.5 text-[#10b981]" />
            <h3 className="text-[15px] font-bold text-white tracking-tight">
              Access pre-negotiated startup rates with Credex
            </h3>
          </div>
          <p className="text-[13.5px] text-zinc-400 leading-relaxed mb-4">
            Startups with this profile typically qualify for additional rebates of 15% to 25% on subscription spends.
          </p>
          <a
            href="https://credex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary py-2.5 px-5 bg-[#10b981] hover:bg-[#059669] text-white border-transparent text-[12.5px] font-bold"
            style={{ backgroundColor: "#10b981" }}
          >
            Explore Credex rebate programs
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
