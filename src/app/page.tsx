"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie, Legend,
} from "recharts";

// ── Design tokens ─────────────────────────────────────────────────────────────
const ACCENT = "#1E40AF";
const AMBER  = "#B45309";
const VIOLET = "#6D28D9";
const RED    = "#B91C1C";
const GREEN  = "#059669";

// ── CountUp ───────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1.4, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / (duration * 1000), 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

// ── Interactive dot grid (spring-physics mouse repulsion) ─────────────────────
function useDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPACING  = 28;
    const DOT_R    = 1.5;
    const COLOR    = "#C3C0B9";
    const REPEL    = 90;
    const STRENGTH = 3.5;
    const SPRING   = 0.055;
    const DAMP     = 0.82;

    type Dot = { ox: number; oy: number; x: number; y: number; vx: number; vy: number };
    let dots: Dot[] = [];
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let ox = SPACING / 2; ox < w; ox += SPACING)
        for (let oy = SPACING / 2; oy < h; oy += SPACING)
          dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
    };

    const draw = () => {
      const { x: mx, y: my } = mouseRef.current;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.fillStyle = COLOR;
      for (const d of dots) {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL && dist > 0) {
          const f = (1 - dist / REPEL) * STRENGTH;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
        }
        d.vx += (d.ox - d.x) * SPRING;
        d.vy += (d.oy - d.y) * SPRING;
        d.vx *= DAMP;
        d.vy *= DAMP;
        d.x  += d.vx;
        d.y  += d.vy;
        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

  return { canvasRef, onMouseMove, onMouseLeave };
}

// ── HeroStat ──────────────────────────────────────────────────────────────────
function HeroStat({ target, prefix = "", suffix = "", label }: {
  target: number; prefix?: string; suffix?: string; label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const val = useCountUp(target, 1.5, inView);
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <span className="text-5xl font-bold tracking-tight text-[#12110F]">
        {prefix}{val.toLocaleString()}{suffix}
      </span>
      <span className="text-sm font-semibold uppercase tracking-widest text-[#6B6560]">
        {label}
      </span>
    </div>
  );
}

// ── MiniCountUp ───────────────────────────────────────────────────────────────
function MiniCountUp({ target, prefix = "", suffix = "", active, textClass = "text-[#12110F]" }: {
  target: number; prefix?: string; suffix?: string; active: boolean; textClass?: string;
}) {
  const val = useCountUp(target, 1.2, active);
  return (
    <p className={`text-2xl font-bold tracking-tight ${textClass}`}>
      {prefix}{val.toLocaleString()}{suffix}
    </p>
  );
}

// ── FadeUp ────────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────────
const SKILLS = [
  {
    label: "Marketing Analytics",
    description:
      "Frameworks that scale across hundreds of locations — auditable models with documented assumptions built to outlast the analyst who built them.",
  },
  {
    label: "Revenue Attribution",
    description:
      "Multi-channel attribution architectures transparent enough for a CFO to challenge and still trust. No black boxes, no fragile assumptions.",
  },
  {
    label: "Data Engineering",
    description:
      "Production SQL and pipelines with QA logic, taxonomy normalization, and edge case handling. Built for whoever inherits it, not just the current deadline.",
  },
  {
    label: "AI-Augmented Execution",
    description:
      "LLMs as a velocity multiplier — same-day delivery on analysis that used to take three days, without trading rigor for speed.",
  },
];

function SkillBoxes() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SKILLS.map((skill, i) => (
        <motion.div
          key={skill.label}
          initial={{ opacity: 0, y: 8 }}
          animate={scrolled ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: i * 0.15, ease: "easeOut" }}
          className="rounded-2xl border border-[#E8E4DC] bg-white/90 p-5 shadow-sm backdrop-blur-sm"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">
            {skill.label}
          </p>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={scrolled ? { height: "auto", opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.12 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm leading-relaxed text-[#374151]">{skill.description}</p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Shared tooltip styles ─────────────────────────────────────────────────────
const lightTip = { background: "#fff", border: "1px solid #E8E4DC", borderRadius: 8, fontSize: 12 };
const darkTip  = { background: "#1E293B", border: "1px solid #334155", borderRadius: 8, fontSize: 12, color: "#E2E8F0" };

// ── FSA Charts ────────────────────────────────────────────────────────────────

function BudgetTierChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { tier: "Reduce",  stores: 26, fill: RED    },
    { tier: "Develop", stores: 65, fill: AMBER  },
    { tier: "Invest",  stores: 48, fill: VIOLET },
    { tier: "Protect", stores: 41, fill: ACCENT },
  ];
  if (!mounted || !active) return <div className="h-52 rounded-xl bg-[#F0EDE6] animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        180 Locations by Budget Tier
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 36, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8E4DC" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#9E988F" }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="tier" tick={{ fontSize: 12, fill: "#12110F", fontWeight: 500 }} tickLine={false} axisLine={false} width={58} />
          <Bar dataKey="stores" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out">
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
          <Tooltip cursor={{ fill: "#F7F6F2" }} formatter={(v) => [`${v} locations`, "Count"]} contentStyle={lightTip} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

function ChannelMixChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { channel: "Google Search", pct: 34 },
    { channel: "Meta",          pct: 22 },
    { channel: "Demand Gen",    pct: 18 },
    { channel: "GMB / Local",   pct: 12 },
    { channel: "Display",       pct: 8  },
    { channel: "Other",         pct: 6  },
  ];
  if (!mounted || !active) return <div className="h-64 rounded-xl bg-[#F0EDE6] animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        Paid Media Spend by Channel
      </p>
      <ResponsiveContainer width="100%" height={224}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 44, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8E4DC" />
          <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: "#9E988F" }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="channel" tick={{ fontSize: 11, fill: "#12110F", fontWeight: 500 }} tickLine={false} axisLine={false} width={90} />
          <Bar dataKey="pct" fill={ACCENT} radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          <Tooltip cursor={{ fill: "#F7F6F2" }} formatter={(v) => [`${v}%`, "Share of spend"]} contentStyle={lightTip} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

function ServiceSplitChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { name: "Oil-related",            value: 62, fill: ACCENT    },
    { name: "Non-oil (captured)",     value: 23, fill: "#9CA3AF" },
    { name: "Non-oil (undercounted)", value: 15, fill: AMBER     },
  ];
  if (!mounted || !active) return <div className="h-64 rounded-xl bg-[#F0EDE6] animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        Service View Composition — Before Taxonomy Fix
      </p>
      <ResponsiveContainer width="100%" height={224}>
        <PieChart>
          <Pie data={data} cx="45%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={3}
            dataKey="value" isAnimationActive animationDuration={1000} animationEasing="ease-out">
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Legend iconType="circle" iconSize={8}
            formatter={(v: string) => <span style={{ fontSize: 11, color: "#6B6560" }}>{v}</span>} />
          <Tooltip formatter={(v) => [`${v}%`, "Share"]} contentStyle={lightTip} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

function SEODimensionChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { dim: "Technical",    score: 72 },
    { dim: "Content",      score: 61 },
    { dim: "Local SEO",    score: 55 },
    { dim: "Link Profile", score: 43 },
    { dim: "Site Speed",   score: 68 },
    { dim: "Schema",       score: 38 },
  ];
  if (!mounted || !active) return <div className="h-52 rounded-xl bg-[#F0EDE6] animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        Audit Dimension Scores (0–100)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 36, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8E4DC" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#9E988F" }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="dim" tick={{ fontSize: 11, fill: "#12110F", fontWeight: 500 }} tickLine={false} axisLine={false} width={82} />
          <Bar dataKey="score" fill={VIOLET} radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          <Tooltip cursor={{ fill: "#F7F6F2" }} formatter={(v) => [`${v}/100`, "Score"]} contentStyle={lightTip} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

function CMOChannelChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { ch: "SEM",  pct: 95 },
    { ch: "Meta", pct: 90 },
    { ch: "DG",   pct: 88 },
    { ch: "YT",   pct: 82 },
    { ch: "GMB",  pct: 92 },
    { ch: "EM",   pct: 78 },
    { ch: "DM",   pct: 60 },
    { ch: "SEO",  pct: 75 },
    { ch: "Aff",  pct: 65 },
    { ch: "CTV",  pct: 70 },
    { ch: "Geo",  pct: 72 },
    { ch: "Dsp",  pct: 85 },
  ];
  if (!mounted || !active) return <div className="h-48 rounded-xl bg-[#F0EDE6] animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        Data Coverage by Channel (%)
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ left: 0, right: 4, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DC" />
          <XAxis dataKey="ch" tick={{ fontSize: 9, fill: "#9E988F" }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} hide />
          <Bar dataKey="pct" fill={GREEN} radius={[3, 3, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          <Tooltip formatter={(v) => [`${v}%`, "Coverage"]} contentStyle={lightTip} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

function GA4CVRChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { label: "Prior CVR", value: 70, fill: RED    },
    { label: "Empirical", value: 38, fill: ACCENT },
  ];
  if (!mounted || !active) return <div className="h-44 rounded-xl bg-[#F0EDE6] animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        CVR Assumption — Before vs. After Audit
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ left: 16, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4DC" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#12110F", fontWeight: 500 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9E988F" }} tickLine={false} axisLine={false} unit="%" />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out">
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
          <Tooltip formatter={(v) => [`${v}%`, "CVR"]} contentStyle={lightTip} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

// ── AI Charts (dark theme) ────────────────────────────────────────────────────

function WorkflowAgentChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { domain: "Analytics",  agents: 3 },
    { domain: "Content",    agents: 3 },
    { domain: "Dev",        agents: 2 },
    { domain: "Creative",   agents: 2 },
    { domain: "General",    agents: 1 },
  ];
  if (!mounted || !active) return <div className="h-52 rounded-xl bg-white/5 animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Agents by Domain
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 36, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="domain" tick={{ fontSize: 12, fill: "#CBD5E1", fontWeight: 500 }} tickLine={false} axisLine={false} width={68} />
          <Bar dataKey="agents" fill="#60A5FA" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} formatter={(v) => [`${v} agents`, "Count"]} contentStyle={darkTip} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

function FitScoringChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { dim: "Role Level",  weight: 20 },
    { dim: "Tech Stack",  weight: 18 },
    { dim: "Industry",    weight: 15 },
    { dim: "Comp Range",  weight: 15 },
    { dim: "Location",    weight: 12 },
    { dim: "Culture",     weight: 12 },
    { dim: "Growth Path", weight: 8  },
  ];
  if (!mounted || !active) return <div className="h-52 rounded-xl bg-white/5 animate-pulse" />;
  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Fit Score Dimension Weights
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 44, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="dim" tick={{ fontSize: 11, fill: "#CBD5E1", fontWeight: 500 }} tickLine={false} axisLine={false} width={82} />
          <Bar dataKey="weight" fill="#818CF8" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} formatter={(v) => [`${v}%`, "Weight"]} contentStyle={darkTip} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

// ── Project types ─────────────────────────────────────────────────────────────
type MiniStat =
  | { target: number; prefix?: string; suffix?: string; label: string }
  | { display: string; label: string };

type FSAProject = {
  number: string;
  title: string;
  subtitle: string;
  company: string;
  headlinePrefix: string;
  headlineNumber: number;
  headlineSuffix: string;
  headlineLabel: string;
  tags: string[];
  role: string;
  problem: string;
  action: string;
  result: string;
  miniStats: MiniStat[];
  Chart: React.FC<{ active: boolean }>;
};

type AIProject = FSAProject & { reversed: boolean };

// ── FSA project data ──────────────────────────────────────────────────────────
const fsaProjects: FSAProject[] = [
  {
    number: "01",
    title: "Paid Media Budget Optimization",
    subtitle: "BDI/CDI Store-Level Reallocation Model",
    company: "National Automotive Franchise Group",
    headlinePrefix: "$",
    headlineNumber: 280,
    headlineSuffix: "K",
    headlineLabel: "reallocation opportunity identified",
    tags: ["Snowflake SQL", "Excel", "Google Ads", "Franchise POS Data", "AI-assisted analysis"],
    role: "Designed the framework, built the analysis model, and translated findings into executive-ready recommendations.",
    problem: "Budgets spread evenly across 180 locations. Market-level estimates were too blunt for store-by-store decisions.",
    action: "Rebuilt around store-level BDI/CDI using ~1.1M POS transactions. Added ghost location correction, seasonality check, and a four-tier prioritization map.",
    result: "Surfaced a defensible $280K reallocation opportunity with a clear per-store action map.",
    miniStats: [
      { target: 180, label: "locations analyzed" },
      { display: "~1.1M", label: "POS transactions modeled" },
    ],
    Chart: BudgetTierChart,
  },
  {
    number: "02",
    title: "Multi-Channel Attribution Architecture",
    subtitle: "Store-Month Marketing Attribution Layer",
    company: "National Automotive Franchise Group",
    headlinePrefix: "",
    headlineNumber: 6900,
    headlineSuffix: "",
    headlineLabel: "store-month rows modeled across 8 channels",
    tags: ["Excel modeling", "SharePoint", "Attribution design", "Executive reporting"],
    role: "Architected the model, codified assumptions, and aligned delivery with CMO/CEO planning workflows.",
    problem: "Attribution logic scattered across files with inconsistent assumptions — impossible to reconcile at 286 locations × 8 channels.",
    action: "Designed an auditable Excel model with channel-specific rules, a CEO planning lever, and hard separation between scenarios and actuals.",
    result: "Single trusted attribution layer across 286 locations × 24 months. Monthly decisions no longer require file archaeology.",
    miniStats: [
      { target: 286, label: "franchise locations covered" },
      { target: 8, label: "channels unified" },
    ],
    Chart: ChannelMixChart,
  },
  {
    number: "03",
    title: "Store Service Intelligence System",
    subtitle: "Demand Analysis + CRM Journey Suppression",
    company: "National Automotive Franchise Group",
    headlinePrefix: "up to ",
    headlineNumber: 40,
    headlineSuffix: "%",
    headlineLabel: "non-oil activity undercounted before taxonomy fix",
    tags: ["Snowflake SQL", "Python", "Excel pipeline", "Franchise CRM", "Dashboard logic"],
    role: "Led query design, data QA, translation of technical caveats, and stakeholder-facing delivery.",
    problem: "Taxonomy logic was undercounting non-oil service activity by 25–40%, making demand signals unreliable for marketing decisions.",
    action: "Built SQL + Excel pipeline with fleet filtering, oil/non-oil toggles, and taxonomy normalization. Added CRM suppression query to cut irrelevant follow-up messaging.",
    result: "Cleaner targeting logic and credible demand signals across ~285 locations. Less noise in retention, better service marketing prioritization.",
    miniStats: [
      { target: 285, prefix: "~", label: "locations analyzed" },
      { display: "25–40%", label: "undercount gap corrected" },
    ],
    Chart: ServiceSplitChart,
  },
  {
    number: "04",
    title: "SEO Audit Skill",
    subtitle: "Claude API-Powered 6-Dimension Audit System",
    company: "National Automotive Franchise Group",
    headlinePrefix: "",
    headlineNumber: 6,
    headlineSuffix: "",
    headlineLabel: "audit dimensions systematized",
    tags: ["Claude API", "Prompt Engineering", "Excel automation", "SEO strategy"],
    role: "Designed the prompt architecture, dimension framework, and output format. Deployed and iterated in production.",
    problem: "SEO audits were manual, inconsistent, and impossible to scale across a multi-location franchise system.",
    action: "Built a Claude API skill evaluating 6 structured dimensions, outputting a scored 8-tab Excel workbook with prioritized action items per location.",
    result: "Day-long audits now complete in under 5 minutes with consistent, auditable output. Deployed in production.",
    miniStats: [
      { display: "8-tab", label: "scored Excel output" },
      { display: "< 5 min", label: "per location audit" },
    ],
    Chart: SEODimensionChart,
  },
  {
    number: "05",
    title: "Marketing Omnichannel Dashboard",
    subtitle: "Auto-Updating CMO-Facing Web Application",
    company: "National Automotive Franchise Group",
    headlinePrefix: "",
    headlineNumber: 12,
    headlineSuffix: "",
    headlineLabel: "channels unified in one live view",
    tags: ["JavaScript", "GitHub Pages", "Data architecture", "Paid media"],
    role: "Designed the architecture, built the application, and eliminated manual upload dependency from the reporting cycle.",
    problem: "Exec reporting ran through one person uploading CSVs manually. One missed upload broke visibility for the whole org.",
    action: "Built a GitHub Pages web app that auto-fetches all 12 channels and stays current with no manual input.",
    result: "CMO-facing cross-channel view that updates itself. No uploads, no bottleneck, no single point of failure.",
    miniStats: [
      { target: 0, label: "manual uploads required" },
      { target: 12, label: "channels tracked" },
    ],
    Chart: CMOChannelChart,
  },
  {
    number: "06",
    title: "GA4 Attribution Methodology Audit",
    subtitle: "CVR Assumption Validation + Model Rebuild",
    company: "National Automotive Franchise Group",
    headlinePrefix: "",
    headlineNumber: 3,
    headlineSuffix: "",
    headlineLabel: "critical attribution flaws documented",
    tags: ["GA4", "Attribution methodology", "Data QA", "Executive reporting"],
    role: "Conducted the full audit, documented findings, and rebuilt the methodology with external validation backing.",
    problem: "Attribution relied on a self-cited 70% CVR assumption — never externally validated, embedded in exec-facing financial projections.",
    action: "Audited the full assumption chain, documented 3 critical flaws, and derived an empirical CVR of ~38% from observed data.",
    result: "Defensible methodology replacing a number that was inflating reported conversions across the entire model.",
    miniStats: [
      { display: "70% → 38%", label: "CVR assumption corrected" },
      { display: "3", label: "critical flaws documented" },
    ],
    Chart: GA4CVRChart,
  },
];

// ── AI project data ───────────────────────────────────────────────────────────
const aiProjects: AIProject[] = [
  {
    number: "AI-01",
    title: "Multi-Agent Autonomous Task System",
    subtitle: "PC-Hosted Persistent Execution Pipeline",
    company: "Personal Project",
    reversed: false,
    headlinePrefix: "",
    headlineNumber: 11,
    headlineSuffix: "",
    headlineLabel: "specialist agents deployed",
    tags: ["Python / Flask", "n8n", "SQLite", "Claude API", "Tailscale", "Model routing"],
    role: "Designed the full architecture, built all components, and deployed on dedicated hardware with remote access via secure tunnel.",
    problem: "Every complex task required starting a fresh Claude session — no persistent history, no automation, no running while unattended.",
    action: "Built a PC-hosted pipeline: Flask dashboard, n8n orchestration, SQLite task DB, 11 domain-specific agents, and model routing (Haiku / Sonnet / Opus by task type). Remote access via Tailscale.",
    result: "Autonomous multi-step work runs in the background across 11 domains while I'm doing other things.",
    miniStats: [
      { target: 11, label: "specialist agents" },
      { display: "3-pass", label: "plan / execute / verify" },
    ],
    Chart: WorkflowAgentChart,
  },
  {
    number: "AI-02",
    title: "Job Application Automation Pipeline",
    subtitle: "Multi-Agent ATS Research + Submission System",
    company: "Personal Project",
    reversed: true,
    headlinePrefix: "",
    headlineNumber: 6,
    headlineSuffix: "",
    headlineLabel: "ATS platforms supported",
    tags: ["Playwright", "Python", "Claude API", "SQLite", "Multi-agent pipeline"],
    role: "Designed the agent chain, built the ATS detection logic, and wired the full pipeline from discovery to submission.",
    problem: "Manual job searching doesn't scale — repetitive research, inconsistent tailoring, no tracking, no way to filter bad-fit roles before writing anything.",
    action: "3-agent chain: research → 7-dimension fit scoring → application generation. Playwright handles ATS form completion across 6 platforms. SQLite tracks state end-to-end.",
    result: "Materials only get generated for high-fit roles. The rest is filtered before any time is spent.",
    miniStats: [
      { target: 6, label: "ATS platforms" },
      { display: "7-dim", label: "fit scoring model" },
    ],
    Chart: FitScoringChart,
  },
];

// ── Project Card (compact, 2×3 grid) ─────────────────────────────────────────
function ProjectCard({ project, index }: { project: FSAProject; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 2) * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col overflow-hidden rounded-2xl border border-[#E8E4DC] bg-white p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">
          Case Study {project.number}
        </span>
        <span className="text-xs text-[#9E988F]">{project.company}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold leading-tight tracking-tight">{project.title}</h3>
      <p className="mt-1 text-xs text-[#6B6560]">{project.subtitle}</p>

      {/* Headline metric */}
      <div className="mt-4">
        <p
          className="font-black leading-none tracking-tight text-[#1E40AF]"
          style={{ fontSize: "clamp(2.4rem, 5vw, 3.2rem)" }}
        >
          {project.headlinePrefix}{project.headlineNumber.toLocaleString()}{project.headlineSuffix}
        </p>
        <p className="mt-1 text-xs text-[#6B6560]">{project.headlineLabel}</p>
      </div>

      {/* Chart */}
      <div className="mt-5">
        <project.Chart active={inView} />
      </div>

      {/* PAR blocks */}
      <div className="mt-4 flex-1">
        {(["problem", "action", "result"] as const).map((key) => (
          <div key={key} className="border-t border-[#E8E4DC] py-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9E988F]">{key}</p>
            <p className="text-xs leading-relaxed text-[#374151]">{project[key]}</p>
          </div>
        ))}
      </div>

      {/* Mini stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#E8E4DC] pt-4">
        {project.miniStats.map((s, i) => (
          <div key={i}>
            {"target" in s ? (
              <MiniCountUp target={s.target} prefix={s.prefix} suffix={s.suffix} active={inView} />
            ) : (
              <p className="text-2xl font-bold tracking-tight text-[#12110F]">{s.display}</p>
            )}
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[#6B6560]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1 border-t border-[#E8E4DC] pt-4">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs font-medium text-[#9E988F]">{tag}</span>
        ))}
      </div>
    </motion.div>
  );
}

// ── AI Project Section (dark editorial) ──────────────────────────────────────
function AIProjectSection({ project }: { project: AIProject }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0F172A] px-6 py-20 sm:px-12 lg:px-24">
      {/* Watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 top-2 select-none font-black leading-none text-white/[0.04]"
        style={{ fontSize: "clamp(100px, 16vw, 180px)" }}
      >
        {project.number}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 44 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-5xl"
      >
        {/* Label row */}
        <div className="mb-10 flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
            {project.number}
          </span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-slate-500">{project.company}</span>
        </div>

        {/* Content grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Info column */}
          <div className={project.reversed ? "lg:order-last" : ""}>
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {project.title}
            </h3>
            <p className="mt-2 text-slate-400">{project.subtitle}</p>

            <div className="mt-10">
              {(["problem", "action", "result"] as const).map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
                  className="border-t border-white/10 py-5"
                >
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    {key}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300">{project[key]}</p>
                </motion.div>
              ))}
              <div className="border-t border-white/10 pt-5">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-slate-500">{tag}</span>
                  ))}
                </div>
                <p className="mt-2 text-xs italic text-slate-500">{project.role}</p>
              </div>
            </div>
          </div>

          {/* Data column */}
          <div className={project.reversed ? "lg:order-first" : ""}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="font-black leading-none tracking-tight text-blue-400"
                style={{ fontSize: "clamp(3.5rem, 8vw, 5.5rem)" }}
              >
                {project.headlinePrefix}{project.headlineNumber.toLocaleString()}{project.headlineSuffix}
              </p>
              <p className="mt-3 text-sm text-slate-400">{project.headlineLabel}</p>
            </motion.div>

            <div className="mt-10">
              <project.Chart active={inView} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
              {project.miniStats.map((s, i) => (
                <div key={i}>
                  {"target" in s ? (
                    <MiniCountUp
                      target={s.target}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      active={inView}
                      textClass="text-white"
                    />
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-white">{s.display}</p>
                  )}
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { canvasRef, onMouseMove, onMouseLeave } = useDotGrid();

  return (
    <main className="bg-[#FAFAF8] text-[#12110F]">
      <div className="scroll-progress" aria-hidden />

      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-[#FAFAF8]/80 px-6 py-4 backdrop-blur-sm sm:px-12">
        <span className="text-sm font-bold tracking-wide">Sam Evans</span>
        <a
          href="https://github.com/SKE-creator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#6B6560] transition-colors hover:text-[#12110F]"
        >
          GitHub ↗
        </a>
      </nav>

      {/* Hero with interactive dot grid */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-20 pt-32 sm:px-12 lg:px-20"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#1E40AF]"
          >
            AI + Analytics Portfolio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl"
          >
            I build analytics systems that turn ambiguity into decisions.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-[#6B6560]"
          >
            Senior marketing analyst at a national automotive franchise group. 8+ years
            translating fragmented data, shifting priorities, and ambiguous business
            questions into evidence-based recommendations executives can act on.
          </motion.p>

          <SkillBoxes />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-14 flex items-center gap-2 text-sm text-[#9E988F]"
          >
            <span>Scroll to explore</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[#E8E4DC] bg-white px-6 py-14 sm:px-12 lg:px-20">
        <div className="mx-auto grid w-full max-w-5xl gap-10 sm:grid-cols-3">
          <HeroStat target={8} suffix="+" label="Years in marketing analytics" />
          <HeroStat target={15} prefix="$" suffix="M+" label="In annual paid media managed" />
          <HeroStat target={4} prefix="$" suffix="M+" label="In optimization impact identified" />
        </div>
      </section>

      {/* FSA section header */}
      <div className="px-6 pb-4 pt-20 sm:px-12 lg:px-20">
        <FadeUp className="mx-auto w-full max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E40AF]">
            Selected Work — Marketing Analytics
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight">Six case studies.</h2>
          <p className="mt-3 max-w-xl text-[#6B6560]">
            Real business problems at a national franchise automotive group — each written for fast
            scan: problem, action, result.
          </p>
        </FadeUp>
      </div>

      {/* FSA 2×3 card grid */}
      <div className="mt-10 px-6 pb-20 sm:px-12 lg:px-20">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {fsaProjects.map((p, i) => (
            <ProjectCard key={p.number} project={p} index={i} />
          ))}
        </div>
      </div>

      {/* AI Systems — dark section header */}
      <div className="bg-[#0F172A] px-6 pb-4 pt-20 sm:px-12 lg:px-20">
        <FadeUp className="mx-auto w-full max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-400">
            AI Systems + Automation
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
            Built outside of work.
          </h2>
          <p className="mt-3 max-w-xl text-slate-400">
            Autonomous AI infrastructure designed and deployed on personal hardware —
            production systems, not prototypes.
          </p>
        </FadeUp>
      </div>

      {/* AI editorial sections */}
      {aiProjects.map((p) => (
        <AIProjectSection key={p.number} project={p} />
      ))}

      {/* Methodology */}
      <section className="bg-[#EEF2FF] px-6 py-20 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-5xl">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E40AF]">How I Work</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">The process behind the output.</h2>
          </FadeUp>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", step: "Frame the business question clearly enough that the answer is unambiguous." },
              { n: "02", step: "Build an analysis system that holds up under scrutiny, not just under deadline." },
              { n: "03", step: "Translate technical work into executive decisions, not just findings." },
              { n: "04", step: "Tie every recommendation to a measurable business impact." },
            ].map((item, i) => (
              <FadeUp key={item.n} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-[#C7D2FE] bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">{item.n}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#374151]">{item.step}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DC] px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6B6560]">Sam Evans · Denver, CO · Marketing Analytics</p>
          <a
            href="https://github.com/SKE-creator/professional-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#1E40AF] hover:underline"
          >
            View source on GitHub ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
