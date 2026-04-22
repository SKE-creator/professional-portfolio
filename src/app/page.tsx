"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// ── Design tokens ─────────────────────────────────────────────────────────────
const ACCENT = "#1E40AF";
const AMBER  = "#B45309";
const VIOLET = "#6D28D9";
const RED    = "#B91C1C";

// ── CountUp hook ──────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1.4, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

// ── Hero stat with countup ────────────────────────────────────────────────────
function HeroStat({
  target,
  prefix = "",
  suffix = "",
  label,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const val = useCountUp(target, 1.5, inView);
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <span className="text-5xl font-bold tracking-tight text-[#12110F]">
        {prefix}
        {val.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm font-semibold uppercase tracking-widest text-[#6B6560]">
        {label}
      </span>
    </div>
  );
}

// ── Mini countup (inside project cards) ──────────────────────────────────────
function MiniCountUp({
  target,
  prefix = "",
  suffix = "",
  active,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  active: boolean;
}) {
  const val = useCountUp(target, 1.2, active);
  return (
    <p className="text-3xl font-bold tracking-tight text-[#12110F]">
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </p>
  );
}

// ── Fade-up animation wrapper ─────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
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

// ── Chart: Budget Tier (Project 01) ───────────────────────────────────────────
function BudgetTierChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = [
    { tier: "Reduce",  stores: 26, fill: RED    },
    { tier: "Develop", stores: 65, fill: AMBER  },
    { tier: "Invest",  stores: 48, fill: VIOLET },
    { tier: "Protect", stores: 41, fill: ACCENT },
  ];

  if (!mounted)
    return <div className="h-52 rounded-xl bg-[#F0EDE6] animate-pulse" />;

  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        180 Corporate Stores by Budget Tier
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 36, top: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8E4DC" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9E988F" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="tier"
            tick={{ fontSize: 12, fill: "#12110F", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={58}
          />
          <Bar
            dataKey="stores"
            radius={[0, 6, 6, 0]}
            isAnimationActive={active}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
          <Tooltip
            cursor={{ fill: "#F7F6F2" }}
            formatter={(v) => [`${v} stores`, "Count"]}
            contentStyle={{
              background: "#fff",
              border: "1px solid #E8E4DC",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

// ── Chart: Channel Mix (Project 02) ──────────────────────────────────────────
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

  if (!mounted)
    return <div className="h-64 rounded-xl bg-[#F0EDE6] animate-pulse" />;

  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        Paid Media Spend Distribution by Channel
      </p>
      <ResponsiveContainer width="100%" height={224}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 44, top: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8E4DC" />
          <XAxis
            type="number"
            unit="%"
            tick={{ fontSize: 11, fill: "#9E988F" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="channel"
            tick={{ fontSize: 11, fill: "#12110F", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Bar
            dataKey="pct"
            fill={ACCENT}
            radius={[0, 6, 6, 0]}
            isAnimationActive={active}
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Tooltip
            cursor={{ fill: "#F7F6F2" }}
            formatter={(v) => [`${v}%`, "Share of spend"]}
            contentStyle={{
              background: "#fff",
              border: "1px solid #E8E4DC",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

// ── Chart: Service Split (Project 03) ────────────────────────────────────────
function ServiceSplitChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = [
    { name: "Oil-related",            value: 62, fill: ACCENT     },
    { name: "Non-oil (captured)",     value: 23, fill: "#9CA3AF"  },
    { name: "Non-oil (undercounted)", value: 15, fill: AMBER      },
  ];

  if (!mounted)
    return <div className="h-64 rounded-xl bg-[#F0EDE6] animate-pulse" />;

  return (
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#6B6560]">
        Service View Composition — Before Taxonomy Fix
      </p>
      <ResponsiveContainer width="100%" height={224}>
        <PieChart>
          <Pie
            data={data}
            cx="45%"
            cy="50%"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={3}
            dataKey="value"
            isAnimationActive={active}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v: string) => (
              <span style={{ fontSize: 11, color: "#6B6560" }}>{v}</span>
            )}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, "Share"]}
            contentStyle={{
              background: "#fff",
              border: "1px solid #E8E4DC",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

// ── Project data ──────────────────────────────────────────────────────────────
type MiniStat =
  | { target: number; prefix?: string; suffix?: string; label: string }
  | { display: string; label: string };

type Project = {
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

const projects: Project[] = [
  {
    number: "01",
    title: "Paid Media Budget Optimization",
    subtitle: "BDI/CDI Store-Level Reallocation Model",
    company: "Grease Monkey / FullSpeed Automotive",
    headlinePrefix: "$",
    headlineNumber: 280,
    headlineSuffix: "K",
    headlineLabel: "reallocation opportunity identified",
    tags: ["Snowflake SQL", "Excel", "Google Ads", "Cinch POS", "AI-assisted analysis"],
    role: "Designed the framework, built the analysis model, and translated findings into executive-ready recommendations.",
    problem:
      "Paid media budgets were spread too evenly across 180 corporate stores. Prior analysis relied on market-level estimates — too blunt for store-by-store decisions and unable to account for seasonal exceptions.",
    action:
      "Rebuilt the model around store-level BDI/CDI using ~1.1M Cinch transactions. Corrected ghost location IDs, added a seasonality checkpoint, and built a four-tier (Protect / Invest / Develop / Reduce) prioritization map with immediate-action tiers.",
    result:
      "Leadership received a defensible $280K reallocation opportunity with a clear store-level action map — making budget conversations faster and more evidence-based.",
    miniStats: [
      { target: 180, label: "stores analyzed" },
      { display: "~1.1M", label: "Cinch transactions modeled" },
    ],
    Chart: BudgetTierChart,
  },
  {
    number: "02",
    title: "Multi-Channel Attribution Architecture",
    subtitle: "Store-Month Marketing Attribution Layer",
    company: "FullSpeed Automotive (FSA)",
    headlinePrefix: "",
    headlineNumber: 6900,
    headlineSuffix: "",
    headlineLabel: "store-month rows modeled across 8 channels",
    tags: ["Excel modeling", "SharePoint", "Attribution design", "Executive reporting"],
    role: "Architected the model, codified assumptions, and aligned delivery with CMO/CEO planning workflows.",
    problem:
      "Attribution logic lived across fragmented files and inconsistent assumptions — creating reconciliation risk and slowing executive reporting across 286 stores and 8 channels.",
    action:
      "Designed an auditable Excel architecture with channel-specific allocation rules, clear input boundaries, and a dedicated CEO planning lever. Kept scenario planning separate from historical actuals to prevent version drift.",
    result:
      "FSA gained a single trusted attribution layer covering 286 stores × 24 months. Monthly decision-making became more consistent across marketing leadership.",
    miniStats: [
      { target: 286, label: "franchise stores covered" },
      { target: 8, label: "channels unified" },
    ],
    Chart: ChannelMixChart,
  },
  {
    number: "03",
    title: "Store Service Intelligence System",
    subtitle: "Demand Analysis + Journey Wizard Suppression",
    company: "FullSpeed Automotive (FSA)",
    headlinePrefix: "up to ",
    headlineNumber: 40,
    headlineSuffix: "%",
    headlineLabel: "non-oil activity undercounted before taxonomy fix",
    tags: ["Snowflake SQL", "Python", "Excel pipeline", "Cinch CRM", "Dashboard logic"],
    role: "Led query design, data QA, translation of technical caveats, and stakeholder-facing delivery.",
    problem:
      "Operations and marketing needed a reliable view of what services stores actually sell — but existing taxonomy logic was creating confusion and undercounting non-oil service activity by 25–40%.",
    action:
      "Built unified Snowflake SQL and Excel outputs with fleet filtering, oil/non-oil toggles, and service taxonomy normalization across ~285 locations. Also designed the Journey Wizard YES-path suppression query to reduce irrelevant follow-up messaging.",
    result:
      "Teams got cleaner targeting logic and a more credible view of store demand — enabling better service marketing prioritization and less noise in retention workflows.",
    miniStats: [
      { target: 285, prefix: "~", label: "locations analyzed" },
      { display: "25–40%", label: "undercount gap corrected" },
    ],
    Chart: ServiceSplitChart,
  },
];

// ── Project section component ─────────────────────────────────────────────────
function ProjectSection({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 52 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 52 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl border border-[#E8E4DC] bg-white shadow-sm"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#E8E4DC] px-6 py-4 sm:px-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">
          Case Study {project.number}
        </span>
        <span className="text-xs text-[#9E988F]">{project.company}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr]">
        {/* Left: title, metric, PAR */}
        <div className="border-b border-[#E8E4DC] p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <h3 className="text-2xl font-bold tracking-tight">{project.title}</h3>
          <p className="mt-1 text-sm text-[#6B6560]">{project.subtitle}</p>

          {/* Headline metric callout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 rounded-2xl bg-[#EEF2FF] px-6 py-5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1E40AF]">
              Key outcome
            </p>
            <p className="mt-2 text-5xl font-bold tracking-tight text-[#1E3A8A]">
              {project.headlinePrefix}
              {project.headlineNumber.toLocaleString()}
              {project.headlineSuffix}
            </p>
            <p className="mt-1 text-sm text-[#374151]">{project.headlineLabel}</p>
          </motion.div>

          {/* Tech stack pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#E8E4DC] bg-[#FAFAF8] px-3 py-1 text-xs font-medium text-[#6B6560]"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-4 text-xs italic text-[#9E988F]">{project.role}</p>

          {/* PAR blocks */}
          <div className="mt-6 space-y-3">
            {[
              { label: "Problem", text: project.problem },
              { label: "Action",  text: project.action  },
              { label: "Result",  text: project.result  },
            ].map((block, i) => (
              <motion.div
                key={block.label}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.45 }}
                className="rounded-xl border border-[#E8E4DC] bg-[#FAFAF8] p-4"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-[#9E988F]">
                  {block.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#374151]">
                  {block.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: chart + mini stats */}
        <div className="p-6 sm:p-8">
          <project.Chart active={inView} />

          <div className="mt-6 grid grid-cols-2 gap-4">
            {project.miniStats.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E8E4DC] bg-[#FAFAF8] px-4 py-4"
              >
                {"target" in s ? (
                  <MiniCountUp
                    target={s.target}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    active={inView}
                  />
                ) : (
                  <p className="text-3xl font-bold tracking-tight text-[#12110F]">
                    {s.display}
                  </p>
                )}
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#6B6560]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="bg-[#FAFAF8] text-[#12110F]">
      {/* Scroll progress line */}
      <div className="scroll-progress" aria-hidden />

      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-[#FAFAF8]/80 px-6 py-4 backdrop-blur-sm sm:px-12">
        <span className="text-sm font-bold tracking-wide text-[#12110F]">
          Sam Evans
        </span>
        <a
          href="https://github.com/SKE-creator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#6B6560] transition-colors hover:text-[#12110F]"
        >
          GitHub ↗
        </a>
      </nav>

      {/* Hero */}
      <section className="dot-grid relative flex min-h-screen flex-col justify-center px-6 pb-20 pt-32 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-5xl">
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
            Senior marketing analyst at FullSpeed Automotive. 8+ years translating messy
            data, fragmented attribution, and unclear briefs into evidence-based
            recommendations executives can act on.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {[
              "Paid Media Analytics",
              "Attribution Modeling",
              "SQL / Data Systems",
              "AI-Assisted Workflows",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#E8E4DC] bg-white px-4 py-1.5 text-sm font-medium text-[#12110F] shadow-sm"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-16 flex items-center gap-2 text-sm text-[#9E988F]"
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
          <HeroStat target={280} prefix="$" suffix="K" label="Reallocation opportunity identified" />
          <HeroStat target={286} label="Franchise stores modeled" />
        </div>
      </section>

      {/* Projects */}
      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-5xl">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E40AF]">
              Selected Work
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              Three case studies.
            </h2>
            <p className="mt-3 max-w-xl text-[#6B6560]">
              Each built around a real business problem at FullSpeed Automotive —
              written for fast scan: problem, action, result.
            </p>
          </FadeUp>
        </div>

        <div className="mx-auto mt-14 w-full max-w-5xl space-y-16">
          {projects.map((project, idx) => (
            <ProjectSection key={project.number} project={project} index={idx} />
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="border-t border-[#E8E4DC] bg-[#EEF2FF] px-6 py-20 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-5xl">
          <FadeUp>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E40AF]">
              How I Work
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              The process behind the output.
            </h2>
          </FadeUp>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                step: "Frame the business question clearly enough that the answer is unambiguous.",
              },
              {
                n: "02",
                step: "Build an analysis system that holds up under scrutiny, not just under deadline.",
              },
              {
                n: "03",
                step: "Translate technical work into executive decisions, not just findings.",
              },
              {
                n: "04",
                step: "Tie every recommendation to a measurable business impact.",
              },
            ].map((item, i) => (
              <FadeUp key={item.n} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-[#C7D2FE] bg-white p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">
                    {item.n}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#374151]">
                    {item.step}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DC] px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6B6560]">
            Sam Evans · Denver, CO · Marketing Analytics
          </p>
          <a
            href="https://github.com/SKE-creator/ai-brag-site"
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
