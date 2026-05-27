"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Code2,
  FileText,
  Database,
  Search,
  Layers,
  Loader2,
  Info,
} from "lucide-react";
import { useAuditStore } from "@/store/audit-store";
import {
  AI_TOOLS,
  AITool,
  TOOL_DISPLAY_NAMES,
  USE_CASES,
  USE_CASE_LABELS,
  UseCase,
} from "@/lib/audit-engine/types";
import { PRICING_DATA, getPlansForTool } from "@/lib/audit-engine/pricing";

// ============================================================
// Tool Custom Icons & Emojis
// ============================================================

const toolIcons: Record<AITool, string> = {
  cursor: "⚡",
  github_copilot: "🐙",
  claude: "🤖",
  chatgpt: "💬",
  anthropic_api: "🔌",
  openai_api: "🔑",
  gemini: "✨",
  windsurf: "🌊",
};

const useCaseIcons: Record<UseCase, React.ReactNode> = {
  coding: <Code2 className="h-4.5 w-4.5" />,
  writing: <FileText className="h-4.5 w-4.5" />,
  data: <Database className="h-4.5 w-4.5" />,
  research: <Search className="h-4.5 w-4.5" />,
  mixed: <Layers className="h-4.5 w-4.5" />,
};

// ============================================================
// Step Ribbon Indicator
// ============================================================

function ProgressRibbon({ currentStep }: { currentStep: number }) {
  const labels = ["Select AI Tools", "Configure Spending", "Team Metrics"];

  return (
    <div className="border-b border-[#1c1c1f] bg-[#050505]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex items-center gap-8">
          {labels.map((label, i) => {
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;
            return (
              <div
                key={label}
                className={`progress-step flex items-center gap-2.5 py-4 ${
                  isActive ? "active text-white" : isCompleted ? "completed text-[#10b981]" : "text-zinc-600"
                }`}
              >
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/25">
                    <Check className="h-3 w-3 text-[#10b981]" />
                  </div>
                ) : (
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-bold border transition-colors ${
                      isActive
                        ? "bg-white text-[#050505] border-white"
                        : "bg-transparent text-zinc-600 border-zinc-800"
                    }`}
                  >
                    {i + 1}
                  </span>
                )}
                <span className="text-[13px] font-semibold tracking-tight hidden sm:inline">
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sticky Sidebar Summary
// ============================================================

function SelectedSummary() {
  const { selectedTools, toolConfigs } = useAuditStore();

  if (selectedTools.length === 0) {
    return (
      <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-5 space-y-4">
        <h4 className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">YOUR AUDIT</h4>
        <p className="text-[13px] text-zinc-500 leading-relaxed">
          Select the tools in your active AI stack to begin cost optimization.
        </p>
      </div>
    );
  }

  const totalSpend = selectedTools.reduce((sum, tool) => {
    const config = toolConfigs[tool];
    return sum + (config?.monthlySpend || 0);
  }, 0);

  const totalSeats = selectedTools.reduce((sum, tool) => {
    const config = toolConfigs[tool];
    return sum + (config?.seatCount || 0);
  }, 0);

  return (
    <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-5 space-y-5">
      <div>
        <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2.5">
          STACK SELECTION
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {selectedTools.map((tool) => (
            <span
              key={tool}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#050505] border border-[#1c1c1f] rounded-lg text-[12px] text-white font-medium shadow-sm"
            >
              <span>{toolIcons[tool]}</span>
              {TOOL_DISPLAY_NAMES[tool]}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#1c1c1f]" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
            SEATS
          </h4>
          <p className="text-lg font-bold text-white tracking-tight">{totalSeats}</p>
        </div>
        <div>
          <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
            EST. SPEND
          </h4>
          <p className="text-lg font-bold text-white tracking-tight tabular-nums">
            ${totalSpend.toLocaleString()}
            <span className="text-[11px] font-normal text-zinc-500">/mo</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 1: Tool Selection Component
// ============================================================

function ToolSelectionStep() {
  const { selectedTools, toggleTool } = useAuditStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Which AI tools does your team use?
        </h2>
        <p className="text-[14px] text-zinc-400">
          Select all that are currently active or under consideration. You will configure exact seats and spends next.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {AI_TOOLS.map((tool) => {
          const isSelected = selectedTools.includes(tool);
          const pricing = PRICING_DATA[tool];
          const sortedPlans = [...pricing.plans]
            .filter((p) => p.pricePerSeat > 0)
            .sort((a, b) => a.pricePerSeat - b.pricePerSeat);
          const minPrice = sortedPlans[0];

          return (
            <button
              key={tool}
              onClick={() => toggleTool(tool)}
              className={`relative text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none group hover:scale-[1.01] ${
                isSelected
                  ? "border-[#6366f1] bg-[#6366f1]/5 shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                  : "border-[#1c1c1f] bg-[#0b0b0c] hover:border-zinc-800"
              }`}
              id={`tool-select-${tool}`}
            >
              {isSelected && (
                <div className="absolute top-4.5 right-4.5 w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="text-2xl block mb-3">{toolIcons[tool]}</span>
              <span className="text-[14px] font-bold block text-white mb-1">
                {TOOL_DISPLAY_NAMES[tool]}
              </span>
              <span className="text-[12px] text-zinc-500 block">
                {pricing.category === "ide"
                  ? "Integrated Development AI"
                  : pricing.category === "chatbot"
                  ? "Conversational Assistant"
                  : "API Gateway"}
                {minPrice && (
                  <span className="text-zinc-400">
                    {" "}
                    · From ${minPrice.pricePerSeat}/seat
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================
// Step 2: Tool Config Component
// ============================================================

function ToolConfigStep() {
  const { selectedTools, toolConfigs, setToolConfig } = useAuditStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Configure active spending
        </h2>
        <p className="text-[14px] text-zinc-400">
          Provide your current plan details and seats. This calculates redundancies and downgrade options.
        </p>
      </div>

      <div className="space-y-4">
        {selectedTools.map((tool) => {
          const plans = getPlansForTool(tool);
          const config = toolConfigs[tool] || {
            plan: "",
            monthlySpend: 0,
            seatCount: 1,
          };

          return (
            <div
              key={tool}
              className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-5 md:p-6 space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-[#1c1c1f]/50">
                <span className="text-xl">{toolIcons[tool]}</span>
                <h3 className="text-[15px] font-bold text-white">
                  {TOOL_DISPLAY_NAMES[tool]}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-zinc-500 font-semibold mb-1.5 uppercase">
                    CURRENT PLAN
                  </label>
                  <select
                    value={config.plan}
                    onChange={(e) =>
                      setToolConfig(tool, { plan: e.target.value })
                    }
                    className="input-field"
                    id={`config-plan-${tool}`}
                  >
                    <option value="">Select current tier...</option>
                    {plans.map((p) => (
                      <option key={p.plan} value={p.plan}>
                        {p.plan.charAt(0).toUpperCase() + p.plan.slice(1)}
                        {p.pricePerSeat > 0
                          ? ` ($${p.pricePerSeat}${
                              p.isPerSeat ? "/seat" : ""
                            }/mo)`
                          : " (Free)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-500 font-semibold mb-1.5 uppercase">
                    MONTHLY SPEND ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={config.monthlySpend || ""}
                    onChange={(e) =>
                      setToolConfig(tool, {
                        monthlySpend: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="input-field font-semibold"
                    id={`config-spend-${tool}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-500 font-semibold mb-1.5 uppercase">
                    SEAT COUNT
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={config.seatCount || ""}
                    onChange={(e) =>
                      setToolConfig(tool, {
                        seatCount: Number(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                    className="input-field font-semibold"
                    id={`config-seats-${tool}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================
// Step 3: Team Info Component
// ============================================================

function TeamInfoStep() {
  const { teamSize, setTeamSize, primaryUseCase, setPrimaryUseCase } =
    useAuditStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Define team usage metrics
        </h2>
        <p className="text-[14px] text-zinc-400">
          Providing operational profiles allows the audit engine to recommend consolidated alternatives.
        </p>
      </div>

      <div className="space-y-4">
        {/* Total Team size input */}
        <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-6">
          <label className="block text-[11.5px] text-zinc-500 font-bold mb-2 uppercase">
            TOTAL AI USER COUNT
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={teamSize || ""}
              onChange={(e) => setTeamSize(Number(e.target.value) || 1)}
              placeholder="e.g., 5"
              className="input-field max-w-[160px] font-bold text-white"
              id="team-size-input"
            />
            <div className="text-[12px] text-zinc-500 flex items-center gap-1.5 bg-[#050505] px-3.5 py-2.5 rounded-xl border border-[#1c1c1f]">
              <Info className="h-3.5 w-3.5 text-zinc-600" />
              Total employees utilizing any subscription seat.
            </div>
          </div>
        </div>

        {/* Primary use cases grid */}
        <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-6 space-y-4">
          <label className="block text-[11.5px] text-zinc-500 font-bold uppercase">
            PRIMARY TEAM USE CASE
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {USE_CASES.map((uc) => {
              const isSelected = primaryUseCase === uc;
              return (
                <button
                  key={uc}
                  onClick={() => setPrimaryUseCase(uc)}
                  className={`flex flex-col items-center justify-center text-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group hover:scale-[1.02] ${
                    isSelected
                      ? "border-[#6366f1] bg-[#6366f1]/5 text-white"
                      : "border-[#1c1c1f] bg-[#050505] text-zinc-400 hover:border-zinc-800"
                  }`}
                  id={`usecase-${uc}`}
                >
                  <div
                    className={`p-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-[#6366f1]/10 border-indigo-500/25 text-[#6366f1]"
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {useCaseIcons[uc]}
                  </div>
                  <span className="text-[11.5px] font-bold tracking-tight">
                    {USE_CASE_LABELS[uc]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Wizard Layout
// ============================================================

export default function AuditPage() {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    selectedTools,
    toolConfigs,
    getAuditInput,
    setAuditResult,
  } = useAuditStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalSteps = 3;

  const canProceed = () => {
    if (currentStep === 0) return selectedTools.length > 0;
    if (currentStep === 1) {
      return selectedTools.every((tool) => {
        const config = toolConfigs[tool];
        return config && config.plan && config.monthlySpend >= 0;
      });
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const input = getAuditInput();

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error("Audit failed");

      const result = await response.json();
      setAuditResult(result);

      router.push("/audit/results");
    } catch (error) {
      console.error("Audit submission error:", error);
      // Local fallback in case offline or API error
      const { runAudit } = await import("@/lib/audit-engine/recommendations");
      const input = getAuditInput();
      const result = runAudit(input);
      setAuditResult(result);
      router.push("/audit/results");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-6 w-6 text-zinc-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-[#050505]">
      {/* Mini Navbar */}
      <nav className="border-b border-[#1c1c1f] bg-[#050505]">
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-lg bg-[#6366f1] flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform duration-200">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[13.5px] font-bold text-white tracking-tight">
              AISpendLens
            </span>
          </Link>
          <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest bg-[#0b0b0c] border border-[#1c1c1f] px-3 py-1.5 rounded-lg">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </nav>

      {/* Steps Progress ribbon */}
      <ProgressRibbon currentStep={currentStep} />

      {/* Central Area */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-10">
          
          {/* Left panel Summary sticky */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <SelectedSummary />
            </div>
          </div>

          {/* Core step wizards */}
          <div>
            <AnimatePresence mode="wait">
              {currentStep === 0 && <ToolSelectionStep key="step-0" />}
              {currentStep === 1 && <ToolConfigStep key="step-1" />}
              {currentStep === 2 && <TeamInfoStep key="step-2" />}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Floating Action Bar anchored to bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#1c1c1f] bg-[#050505]/85 backdrop-blur-md z-40">
        <div className="mx-auto max-w-4xl px-6 py-4.5 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`btn-secondary text-[12.5px] px-5 py-2.5 ${
              currentStep === 0 ? "opacity-30 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`btn-accent text-[12.5px] px-6 py-2.5 ${
                !canProceed() ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-accent text-[12.5px] px-6 py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing Stack...
                </>
              ) : (
                <>
                  Generate Cost Audit
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
