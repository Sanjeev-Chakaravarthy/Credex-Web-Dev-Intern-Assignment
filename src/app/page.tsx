"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Sparkles,
  ChevronDown,
  Info,
  DollarSign,
  ChevronRight,
} from "lucide-react";

// ============================================================
// Navbar Component
// ============================================================

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/85 backdrop-blur-md border-b border-[#1c1c1f]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-lg flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-[#6366f1] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-transform duration-200">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            AISpendLens
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="#compare"
            className="text-[13px] text-zinc-400 hover:text-white transition-colors"
          >
            Spend Explorer
          </a>
          <a
            href="#faq"
            className="text-[13px] text-zinc-400 hover:text-white transition-colors"
          >
            FAQ
          </a>
          <Link href="/audit" className="btn-primary text-[12.5px] px-4 py-2">
            Run free audit
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// Animated Cycling Stack Text
// ============================================================

const STACK_ITEMS = ["Cursor", "Claude", "ChatGPT", "Copilot"];

function AnimatedStackCycle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % STACK_ITEMS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-block relative h-[1.15em] w-[180px] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 bottom-0 text-[#6366f1] font-extrabold"
        >
          {STACK_ITEMS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Tilting Interactive Mockup
// ============================================================

function InteractiveReportPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [savingsCounter, setSavingsCounter] = useState(0);

  // Live Animating Counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSavingsCounter((prev) => {
        if (prev >= 847) return 0;
        return prev + 7;
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Tilt calculations
    const rotateX = -12 * (y / rect.height - 0.5);
    const rotateY = 12 * (x / rect.width - 0.5);

    setCoords({ rotateX, rotateY, x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  };

  const previewRows = [
    { tool: "Cursor", from: "Business", to: "Pro", save: 80, color: "#6366f1" },
    { tool: "Claude", from: "Team", to: "Pro", save: 105, color: "#a855f7" },
    { tool: "ChatGPT", from: "Team", to: "Plus", save: 80, color: "#10b981" },
    { tool: "Copilot", from: "Enterprise", to: "Business", save: 80, color: "#f59e0b" },
  ];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative mockup-tilt w-full rounded-2xl bg-[#0b0b0c] border border-[#1c1c1f] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] cursor-pointer select-none"
      style={{
        transform: `perspective(1000px) rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg) scale(${isHovered ? 1.015 : 1})`,
      }}
    >
      {/* Light glow overlay following the mouse */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle 350px at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
          }}
        />
      )}

      {/* Browser Frame Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c1f] bg-[#080809] relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1f]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1f]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1f]" />
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">
          aispendlens.com/results
        </div>
        <div className="w-10" />
      </div>

      {/* Interactive Mockup Body */}
      <div className="p-5 md:p-6 space-y-5 relative z-10">
        {/* Top Summary Widgets */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#050505] border border-[#1c1c1f] rounded-xl p-3.5">
            <p className="text-[10px] text-zinc-500 font-medium mb-1">CURRENT SPEND</p>
            <p className="text-[17px] font-bold text-white tracking-tight">$1,332<span className="text-[10px] font-normal text-zinc-500">/mo</span></p>
          </div>
          <div className="bg-[#050505] border border-[#1c1c1f] rounded-xl p-3.5">
            <p className="text-[10px] text-zinc-500 font-medium mb-1">OPTIMIZED</p>
            <p className="text-[17px] font-bold text-[#10b981] tracking-tight">$772<span className="text-[10px] font-normal text-zinc-500">/mo</span></p>
          </div>
          <div className="bg-[#050505] border border-[#6366f1]/25 rounded-xl p-3.5 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
            <p className="text-[10px] text-[#6366f1] font-semibold mb-1">SAVINGS</p>
            <p className="text-[17px] font-bold text-[#6366f1] tracking-tight">
              ${savingsCounter.toLocaleString()}
              <span className="text-[10px] font-normal text-zinc-500">/mo</span>
            </p>
          </div>
        </div>

        {/* Floating Tool Cards */}
        <div className="space-y-2">
          {previewRows.map((row, i) => (
            <div
              key={row.tool}
              className={`flex items-center justify-between px-4 py-3 bg-[#050505] border border-[#1c1c1f] rounded-xl transition-all duration-300 ${
                isHovered ? "hover:scale-[1.01] hover:border-[#2c2c30]" : ""
              }`}
              style={{
                transitionDelay: `${i * 40}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ color: row.color, backgroundColor: row.color }}
                />
                <span className="text-[13px] font-semibold text-white">
                  {row.tool}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-zinc-500">{row.from}</span>
                <ChevronRight className="h-3 w-3 text-zinc-700" />
                <span className="text-zinc-300 font-medium">{row.to}</span>
                <span className="text-[#10b981] font-bold ml-2">
                  −${row.save}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Animating Mini-Chart */}
        <div className="h-14 flex items-end gap-1.5 px-3 border-t border-[#1c1c1f] pt-4">
          {[45, 65, 30, 80, 50, 95, 40, 75, 60, 85, 35, 90].map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t-sm transition-all duration-500"
              style={{
                height: `${val}%`,
                background:
                  idx >= 6
                    ? "rgba(16, 185, 129, 0.4)"
                    : "rgba(99, 102, 241, 0.25)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Hero Section
// ============================================================

function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-20 overflow-hidden">
      {/* Background soft glow accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#6366f1]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container-lg relative z-10 w-full py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          
          {/* Left Column (55% weight) */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-[12px] font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Automated AI Cost Intelligence
            </div>

            <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold tracking-tight leading-[0.98] text-white">
              Your AI stack is
              <br />
              probably wasting <span className="text-zinc-500">money.</span>
            </h1>

            <p className="text-[17px] text-zinc-400 leading-relaxed max-w-xl">
              Most startups overpay for tooling because active seats fluctuate, plans mismatch requirements, and overlapping licenses accumulate. Get complete clarity in under 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/audit"
                className="btn-accent text-[14.5px] px-8 py-3.5 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:scale-[1.01]"
              >
                Run free audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#compare"
                className="btn-secondary text-[14.5px] px-8 py-3.5 rounded-xl hover:scale-[1.01]"
              >
                See live report
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-[#1c1c1f] max-w-lg">
              <div>
                <p className="text-[11px] text-zinc-600 font-semibold tracking-widest uppercase">AUDITING COSTS FOR</p>
                <div className="text-[17px] font-bold text-white flex items-center gap-2 mt-1">
                  <AnimatedStackCycle />
                </div>
              </div>
              <div className="w-px h-10 bg-[#1c1c1f]" />
              <div>
                <p className="text-[11px] text-zinc-600 font-semibold tracking-widest uppercase">INTEGRITY</p>
                <p className="text-[13px] text-zinc-400 font-semibold mt-1">No Login · Verified Pricing · Free</p>
              </div>
            </div>
          </div>

          {/* Right Column (45% weight) */}
          <div className="flex items-center justify-center">
            <InteractiveReportPreview />
          </div>

        </div>
      </div>
    </section>
  );
}

// ============================================================
// Current Stack vs Optimized Stack Section (Replaces Stats Row)
// ============================================================

function StackComparison() {
  const [scrolledRight, setScrolledRight] = useState(false);

  return (
    <section id="compare" className="py-20 md:py-24 border-t border-[#1c1c1f] bg-[#070708] relative">
      <div className="container-lg">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Current stack vs. Optimized stack
          </h2>
          <p className="text-[15px] text-zinc-400 leading-relaxed">
            Startups using multiple IDE licenses, team plans, and direct developer APIs routinely accumulate redundant spending. See the typical optimization path for a 10-seat company.
          </p>
        </div>

        {/* Asymmetric Cards Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.1fr] gap-6 lg:gap-8 items-center mb-12">
          
          {/* Current Stack (Redundant) */}
          <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/[0.02] rounded-full blur-2xl" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-red-400 bg-red-400/5 border border-red-500/10 px-2.5 py-1 rounded-full">
                  CURRENT WASTE
                </span>
                <h3 className="text-xl font-bold text-white mt-3">Unmonitored Stack</h3>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-zinc-500 font-semibold uppercase">TOTAL SPEND</p>
                <p className="text-2xl font-bold text-white tracking-tight mt-1">$1,332<span className="text-[12px] font-normal text-zinc-500">/mo</span></p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "Cursor Business", seats: 10, cost: 400, desc: "All developers assigned top tier" },
                { name: "Claude Team Plan", seats: 10, cost: 300, desc: "Redundant with Cursor subscriptions" },
                { name: "ChatGPT Plus", seats: 6, cost: 120, desc: "Individual accounts used in silos" },
                { name: "GitHub Copilot", seats: 8, cost: 160, desc: "Leftover from migrating to Cursor" },
                { name: "OpenAI Direct API", seats: 1, cost: 352, desc: "Raw models billed at generic rates" },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-center p-3 bg-[#050505] border border-[#1c1c1f] rounded-lg">
                  <div>
                    <p className="text-[12.5px] font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] text-zinc-500">{item.seats} active seat{item.seats > 1 ? "s" : ""} · {item.desc}</p>
                  </div>
                  <span className="text-[13px] font-bold text-zinc-400 tabular-nums">${item.cost}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Animated Arrow Connector */}
          <div className="flex lg:flex-col items-center justify-center gap-3 py-4 lg:py-0">
            <div className="w-10 h-[1px] lg:w-[1px] lg:h-16 bg-[#1c1c1f]" />
            <div className="w-10 h-10 rounded-full border border-indigo-500/25 bg-[#6366f1]/5 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <TrendingDown className="h-4 w-4 text-[#6366f1] animate-bounce" />
            </div>
            <div className="w-10 h-[1px] lg:w-[1px] lg:h-16 bg-[#1c1c1f]" />
          </div>

          {/* Optimized Stack */}
          <div className="bg-[#0b0b0c] border border-indigo-500/15 card-glow-purple rounded-2xl p-6 relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-2xl" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/5 border border-[#10b981]/15 px-2.5 py-1 rounded-full">
                  OPTIMIZED STACK
                </span>
                <h3 className="text-xl font-bold text-white mt-3">AISpendLens Optimized</h3>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#10b981] font-semibold uppercase">TOTAL SPEND</p>
                <p className="text-2xl font-bold text-[#10b981] tracking-tight mt-1">$772<span className="text-[12px] font-normal text-zinc-500">/mo</span></p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "Cursor Pro Plan", seats: 10, cost: 200, save: 200, desc: "Downgraded from Business for same usage" },
                { name: "Claude Pro (Consolidated)", seats: 5, cost: 100, save: 200, desc: "Removed overlap; kept active users only" },
                { name: "ChatGPT Plus (Silo removal)", seats: 2, cost: 40, save: 80, desc: "Swapped to direct shared API keys" },
                { name: "GitHub Copilot", seats: 0, cost: 0, save: 160, desc: "Fully canceled redundancy" },
                { name: "OpenAI Direct API (Optimized)", seats: 1, cost: 432, save: -80, desc: "Optimized model caching / Credex rebates" },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-center p-3 bg-[#050505] border border-[#1c1c1f] rounded-lg">
                  <div>
                    <p className="text-[12.5px] font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] text-zinc-500">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-white tabular-nums">${item.cost}</p>
                    {item.save > 0 && (
                      <p className="text-[9px] font-semibold text-[#10b981] mt-0.5">Saved ${item.save}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Detailed Timeline below comparison */}
        <div className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Info className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">How we achieve this for your team</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Calculated instantly using our deterministic optimization audit engine.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-[12px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050505] border border-[#1c1c1f] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
              Downgrade team limits
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050505] border border-[#1c1c1f] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              Remove tooling overlap
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050505] border border-[#1c1c1f] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
              Route direct API traffic
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ============================================================
// Redesigned FAQ Component (Smooth Accordions)
// ============================================================

const FAQ_ITEMS = [
  {
    q: "Is the audit really free and private?",
    a: "Yes. No login, no credit cards, and no user accounts required. The engine runs on the inputs you provide. Results are stored anonymously and can only be accessed using your unique report ID.",
  },
  {
    q: "How accurate are the recommendation calculations?",
    a: "Completely deterministic. We use verified pricing datasets from each respective provider, cross-referenced with your specific seat counts and usage metrics. There's no randomized AI estimation when it comes to the numbers.",
  },
  {
    q: "What is the Credex Optimization rebate?",
    a: "Startups with high AI spend (over $500/month) qualify for our direct partner program with Credex. This unlocks pre-negotiated corporate rates, caching relays, and rebate offers to save you another 15% to 25% directly.",
  },
  {
    q: "Can I generate a public report link to share with our CFO?",
    a: "Absolutely. Our results dashboard allows you to generate a persistent public link immediately. You can share this link directly via email, Slack, Twitter, or copy it directly to your clipboard.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-24 border-t border-[#1c1c1f] bg-[#050505]">
      <div className="container-lg max-w-3xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 mb-2">
            <HelpCircle className="h-5 w-5 text-zinc-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[14.5px] text-zinc-400">
            Everything you need to know about AISpendLens and team cost consolidation.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#0b0b0c] border border-[#1c1c1f] rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-white"
                >
                  <span className="text-[14.5px] font-semibold tracking-tight">
                    {item.q}
                  </span>
                  <div
                    className={`p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isOpen ? "200px" : "0",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 pb-5 pt-1 text-[13.5px] text-zinc-400 leading-relaxed border-t border-[#1c1c1f]/40">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Final CTA (Radial Gradient Glow & Pulsing Button)
// ============================================================

function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 border-t border-[#1c1c1f] overflow-hidden bg-[#050505]">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="container-lg relative z-10 text-center space-y-8 max-w-2xl">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Stop paying for tools
          <br />
          you don&apos;t use.
        </h2>
        
        <p className="text-[16px] text-zinc-400 max-w-md mx-auto leading-relaxed">
          Audit your AI subscriptions today. It takes 2 minutes, requires no account setup, and is 100% free.
        </p>

        <div className="pt-4">
          <Link
            href="/audit"
            className="btn-accent text-[15px] px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:scale-[1.01] relative group"
          >
            {/* Soft pulsing halo ring */}
            <span className="absolute -inset-1 rounded-xl bg-[#6366f1]/20 blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            <span className="relative flex items-center gap-2">
              Start Free Audit Now
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <p className="text-[11.5px] text-zinc-600 font-medium">
          No sign up · PDF report export · Consolidate instantly
        </p>
      </div>
    </section>
  );
}

// ============================================================
// Footer Component
// ============================================================

function Footer() {
  return (
    <footer className="border-t border-[#1c1c1f] py-12 bg-[#050505]">
      <div className="container-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#6366f1] flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <BarChart3 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[13.5px] font-bold text-white tracking-tight">
            AISpendLens
          </span>
        </div>

        <div className="flex gap-8 text-[12.5px]">
          <a href="#compare" className="text-zinc-500 hover:text-white transition-colors">
            Spend Explorer
          </a>
          <a href="#faq" className="text-zinc-500 hover:text-white transition-colors">
            FAQ
          </a>
          <Link href="/audit" className="text-zinc-500 hover:text-white transition-colors">
            Audit Wizard
          </Link>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1">
          <div className="flex items-center gap-3 text-[11px] text-zinc-600">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-zinc-700" />
              Verified vendor pricing
            </span>
            <span className="text-zinc-800">·</span>
            <span>Last refresh: May 2026</span>
          </div>
          <p className="text-[11.5px] text-zinc-700">
            © 2026 AISpendLens. Made with precision for scaling startups.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// Main Landing Page
// ============================================================

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#050505]">
        <Hero />
        <StackComparison />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
