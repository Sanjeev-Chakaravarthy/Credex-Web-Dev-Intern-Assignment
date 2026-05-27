"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Share2,
  Copy,
  Loader2,
  Brain,
  Mail,
  ExternalLink,
  Sparkles,
  Trophy,
  AlertTriangle,
  Globe,
  X,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuditStore } from "@/store/audit-store";
import { formatCurrency } from "@/lib/utils";
import { TOOL_DISPLAY_NAMES } from "@/lib/audit-engine/types";

// ============================================================
// Severity Configurations
// ============================================================

const SEVERITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6366f1",
  optimal: "#10b981",
};

// ============================================================
// Live Typing Animation Component
// ============================================================

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return <span className="typing-cursor pr-0.5">{displayed}</span>;
}

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
// Redesigned Toast Notification Overlay
// ============================================================

function ToastNotification({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className="toast flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
        <span>{message}</span>
      </div>
    </div>
  );
}

// ============================================================
// Share Modal Popup Component
// ============================================================

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  monthlySavings: number;
  onCopySuccess: () => void;
}

function ShareModal({ isOpen, onClose, shareUrl, monthlySavings, onCopySuccess }: ShareModalProps) {
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">("idle");

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
      onCopySuccess();
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setCopyState("idle");
    }
  };

  const shareText = `I just found $${monthlySavings.toLocaleString()}/mo in potential savings on my startup's AI stack using AISpendLens! Audit your subscriptions for free here:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-6 shadow-2xl space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-bold text-white tracking-tight flex items-center gap-2">
              <Share2 className="h-4.5 w-4.5 text-[#6366f1]" />
              Share Cost Report
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[13px] text-zinc-400 leading-relaxed">
            Generate cost summaries and share optimizations with your cofounders, CFO, or engineering managers.
          </p>

          {/* Copy URL Panel */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              REPORT ADDRESS
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input-field text-[12.5px] font-mono select-all bg-[#050505]"
              />
              <button
                onClick={handleCopyLink}
                disabled={copyState === "copying"}
                className="btn-secondary px-3.5 py-3 rounded-md"
              >
                {copyState === "copied" ? (
                  <span className="text-[12px] font-semibold text-[#10b981] flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                ) : (
                  <Copy className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <div className="h-px bg-[#1c1c1f]" />

          {/* Share Channels */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2.5">
              SHARING DIRECTORIES
            </h4>
            
            <div className="grid grid-cols-2 gap-3.5">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 py-3 bg-[#050505] hover:bg-zinc-900 text-[12.5px] font-semibold text-white border border-[#1c1c1f]"
              >
                <svg className="h-4 w-4 text-[#1DA1F2] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter Share
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 py-3 bg-[#050505] hover:bg-zinc-900 text-[12.5px] font-semibold text-white border border-[#1c1c1f]"
              >
                <svg className="h-4 w-4 text-[#0A66C2] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn Share
              </a>
            </div>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 bg-white text-[#050505] font-semibold text-[13px] hover:bg-zinc-200"
            >
              <Globe className="h-4.5 w-4.5" />
              Open Report Page
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ============================================================
// Massive Savings Hero Component
// ============================================================

function SavingsHero({
  monthlySavings,
  annualSavings,
  currentSpend,
}: {
  monthlySavings: number;
  annualSavings: number;
  currentSpend: number;
}) {
  const pct = currentSpend > 0 ? Math.round((monthlySavings / currentSpend) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0b0b0c] border border-indigo-500/15 card-glow-purple p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#6366f1]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/5 border border-[#10b981]/15 text-[12px] font-bold text-[#10b981]">
          <TrendingDown className="h-4 w-4" />
          {pct}% potential savings identified
        </div>

        <div className="space-y-1">
          <p className="text-[12.5px] text-zinc-500 font-bold uppercase tracking-wider">
            YOU CAN SAVE
          </p>
          <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none">
            <AnimatedCounter value={monthlySavings} />
            <span className="text-xl font-normal text-zinc-600 tracking-normal"> / MONTH</span>
          </h1>
        </div>

        <div className="inline-block px-5 py-2.5 rounded-xl bg-[#050505] border border-[#1c1c1f] text-[14px] text-zinc-400">
          Projections achieve{" "}
          <span className="text-[#10b981] font-bold">
            <AnimatedCounter value={annualSavings} />
          </span>{" "}
          saved per year
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Already Optimized Component
// ============================================================

function AlreadyOptimizedCard() {
  return (
    <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-10 text-center shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4 border border-[#10b981]/20">
        <Trophy className="h-6 w-6 text-[#10b981]" />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Your stack is optimized!</h2>
      <p className="text-[14px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
        Outstanding! The audit engine verified that your current AI licenses match your team size. Check back as your headcount expands.
      </p>
    </div>
  );
}

// ============================================================
// Timeline Recommendation Rows
// ============================================================

function RecommendationTimeline({
  recommendations,
}: {
  recommendations: Array<{
    tool: string;
    displayName: string;
    currentPlan: string;
    currentSpend: number;
    recommendedPlan: string;
    recommendedSpend: number;
    monthlySavings: number;
    annualSavings: number;
    reasoning: string;
    alternativeTool?: string;
    alternativeReason?: string;
    severity: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-[15px] font-bold text-white tracking-tight uppercase tracking-widest text-zinc-500">
        OPTIMIZATION TIMELINE
      </h3>

      <div className="space-y-0">
        {recommendations.map((rec, i) => {
          const isLast = i === recommendations.length - 1;
          const severityColor = SEVERITY_COLORS[rec.severity] || "#6366f1";

          return (
            <motion.div
              key={rec.tool}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="relative pl-8 pb-6"
            >
              {/* Connected Line */}
              {!isLast && <div className="absolute left-[9px] top-6 bottom-0 w-[1px] bg-[#1c1c1f]" />}

              {/* Connected Indicator Dot */}
              <div
                className="absolute left-0 top-[5px] w-5 h-5 rounded-full border bg-[#050505] flex items-center justify-center z-10"
                style={{ borderColor: severityColor }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: severityColor }}
                />
              </div>

              {/* Recommendation Card */}
              <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-5 md:p-6 space-y-4 hover:border-zinc-800 transition-colors duration-200">
                {/* Header */}
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

                {/* plan migrations detail block */}
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

                {/* reasoning paragraph */}
                <p className="text-[13.5px] text-zinc-400 leading-relaxed">{rec.reasoning}</p>

                {/* alternative solutions detail block */}
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
  );
}

// ============================================================
// Spend Comparison Chart Component
// ============================================================

function SpendChart({
  recommendations,
}: {
  recommendations: Array<{
    displayName: string;
    currentSpend: number;
    recommendedSpend: number;
  }>;
}) {
  const data = recommendations
    .filter((r) => r.currentSpend > 0)
    .map((r) => ({
      name: r.displayName,
      current: r.currentSpend,
      recommended: r.recommendedSpend,
    }));

  if (data.length === 0) return null;

  return (
    <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-6 space-y-6">
      <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SPEND COMPARISON BY TOOL</h4>

      <div className="h-60 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
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
  );
}

// ============================================================
// AI Summary Component
// ============================================================

function AISummary({
  summary,
  isLoading,
}: {
  summary: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="bg-[#0b0b0c] border border-[#1c1c1f] border-l-[3px] border-l-[#a855f7] rounded-2xl p-6 relative overflow-hidden shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-white">
          <Brain className="h-4.5 w-4.5 text-[#a855f7]" />
          <h3 className="text-[14.5px] font-bold tracking-tight">Personalized AI Cost Briefing</h3>
        </div>
        <span className="text-[10px] font-bold text-[#a855f7] bg-[#a855f7]/5 border border-[#a855f7]/15 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
          CLAUDE AGENT
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 py-2 text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[13px]">Synthesizing subscription overlaps...</span>
        </div>
      ) : (
        <p className="text-[13.5px] text-zinc-300 leading-relaxed font-mono">
          {summary ? <TypingText text={summary} /> : "Briefing unavailable."}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Redesigned PDF report Email Capture Form
// ============================================================

function LeadCapture({ auditId }: { auditId?: string }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          role,
          auditId: auditId || "unknown",
          honeypot,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Lead capture error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#0b0b0c] border border-[#1c1c1f] border-l-[3px] border-l-[#10b981] rounded-2xl p-6 text-center space-y-3 shadow-md">
        <CheckCircle2 className="h-10 w-10 text-[#10b981] mx-auto" />
        <h3 className="text-[15px] font-bold text-white tracking-tight">Optimization Report Dispatched!</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">
          We&apos;ve generated and sent your custom spend analysis PDF to <span className="text-white font-bold">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-6 space-y-5 shadow-md">
      <div className="flex items-center gap-2.5">
        <Mail className="h-4.5 w-4.5 text-zinc-500" />
        <div>
          <h3 className="text-[15px] font-bold text-white tracking-tight">Export PDF Spend Analysis</h3>
          <p className="text-[12.5px] text-zinc-500">Receive a structured PDF analysis containing pricing sources and downgrade checklists.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          aria-hidden="true"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter corporate email..."
          required
          className="input-field"
          id="lead-email"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (optional)"
            className="input-field"
            id="lead-company"
          />
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role (optional)"
            className="input-field"
            id="lead-role"
          />
        </div>

        <button
          type="submit"
          disabled={!email || isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-[13px]"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Export Report to PDF
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// Credex Rebate CTA
// ============================================================

function CredexCTA({ estimatedSavings }: { estimatedSavings: number }) {
  return (
    <div className="bg-[#0b0b0c] border border-[#1c1c1f] border-l-[3px] border-l-[#10b981] rounded-2xl p-6 relative overflow-hidden shadow-md">
      <div className="flex items-center gap-2.5 mb-2.5">
        <Sparkles className="h-4.5 w-4.5 text-[#10b981]" />
        <h3 className="text-[15px] font-bold text-white tracking-tight">
          Unlock pre-negotiated corporate rates with Credex
        </h3>
      </div>
      <p className="text-[13.5px] text-zinc-400 leading-relaxed mb-4">
        Your current volume qualifies for additional managed purchasing rebates. Startups typically save an additional{" "}
        <span className="text-[#10b981] font-bold">
          {formatCurrency(estimatedSavings)}/mo
        </span>{" "}
        on top of our standard plan suggestions.
      </p>
      <a
        href="https://credex.com"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary py-2.5 px-5 bg-[#10b981] hover:bg-[#059669] text-white border-transparent text-[12.5px] font-bold"
        style={{ backgroundColor: "#10b981" }}
      >
        Access Credex rebate programs
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

// ============================================================
// Results Dashboard Component
// ============================================================

export default function ResultsPage() {
  const router = useRouter();
  const { auditResult, aiSummary, setAiSummary, selectedTools } = useAuditStore();
  
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch AI Cost briefing summary
  const fetchSummary = useCallback(async () => {
    if (!auditResult || aiSummary) return;
    setSummaryLoading(true);

    try {
      const stack = selectedTools.map((t) => TOOL_DISPLAY_NAMES[t]);
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: auditResult, stack }),
      });

      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error("Summary fetch error:", error);
      const { generateFallbackSummary } = await import(
        "@/lib/audit-engine/recommendations"
      );
      setAiSummary(generateFallbackSummary(auditResult));
    } finally {
      setSummaryLoading(false);
    }
  }, [auditResult, aiSummary, selectedTools, setAiSummary]);

  useEffect(() => {
    if (mounted && auditResult) {
      fetchSummary();
      
      // Auto-set the share URL locally
      const appUrl = typeof window !== "undefined" ? window.location.origin : "https://aispendlens.com";
      const reportId = auditResult.id || "demo-stack";
      setShareUrl(`${appUrl}/report/${reportId}`);
    }
  }, [mounted, auditResult, fetchSummary]);

  // Integrated Share Handler
  const handleShareClick = async () => {
    if (!auditResult) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Startup AI Cost Report",
          text: `We just analyzed and found potential savings of $${auditResult.totalMonthlySavings}/mo on our stack!`,
          url: shareUrl,
        });
        setToastMessage("Report shared successfully!");
      } else {
        // Fallback directly to our beautiful custom share modal
        setIsShareOpen(true);
      }
    } catch (err) {
      console.error("Share handler cancelled/failed:", err);
      setIsShareOpen(true); // Fallback on cancel or error
    }
  };

  const handleCopySuccess = () => {
    setToastMessage("Report link copied to clipboard!");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-6 w-6 text-zinc-700 animate-spin" />
      </div>
    );
  }

  if (!auditResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050505]">
        <p className="text-zinc-500">No active cost calculations found in storage.</p>
        <Link href="/audit" className="btn-primary text-[12.5px] px-5 py-2.5">
          Start cost audit wizard
        </Link>
      </div>
    );
  }

  const isOptimized = auditResult.totalMonthlySavings < 100;

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      {/* Top Navbar */}
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

          <button
            onClick={handleShareClick}
            className="btn-secondary text-[12.5px] px-4 py-2 flex items-center gap-2.5"
          >
            <Share2 className="h-3.5 w-3.5 text-zinc-400" />
            Share Cost Report
          </button>
        </div>
      </nav>

      {/* Main Results View */}
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        
        {/* Savings Hero Widget */}
        {isOptimized ? (
          <AlreadyOptimizedCard />
        ) : (
          <SavingsHero
            monthlySavings={auditResult.totalMonthlySavings}
            annualSavings={auditResult.totalAnnualSavings}
            currentSpend={auditResult.totalCurrentSpend}
          />
        )}

        {/* Overlapping warning lists */}
        {auditResult.overlapWarnings.length > 0 && (
          <div className="space-y-2">
            {auditResult.overlapWarnings.map((warning: string, i: number) => (
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

        {/* Tactical connected connected timeline cards */}
        <RecommendationTimeline recommendations={auditResult.recommendations} />

        {/* Recharts graphic breakdown comparison */}
        <SpendChart recommendations={auditResult.recommendations} />

        {/* Premium live typing briefing briefing card */}
        <AISummary summary={aiSummary} isLoading={summaryLoading} />

        {/* Redesigned email capturing Form card */}
        <LeadCapture auditId={auditResult.id} />

        {/* Credex corporate discount rebate conditional CTA */}
        {auditResult.credexEligible && (
          <CredexCTA estimatedSavings={auditResult.credexEstimatedSavings} />
        )}

        {/* Redirection */}
        {/* Credibility Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[11px] text-zinc-600 pt-6">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-zinc-700" />
            Pricing verified from official vendor pages
          </span>
          <span className="hidden sm:inline text-zinc-800">·</span>
          <span>Last pricing refresh: May 2026</span>
        </div>

        <div className="text-center pt-4 border-t border-[#1c1c1f]/40">
          <Link
            href="/audit"
            className="text-[13px] text-zinc-500 hover:text-white transition-colors"
          >
            ← Configure a different stack audit
          </Link>
        </div>
      </main>

      {/* Interactive Custom Share modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={shareUrl}
        monthlySavings={auditResult.totalMonthlySavings}
        onCopySuccess={handleCopySuccess}
      />

      {/* Sliding success toast alerts */}
      {toastMessage && (
        <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
