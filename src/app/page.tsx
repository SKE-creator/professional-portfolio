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
function MiniCountUp({ target, prefix = "", suffix = "", active }: {
  target: number; prefix?: string; suffix?: string; active: boolean;
}) {
  const val = useCountUp(target, 1.2, active);
  return (
    <p className="text-2xl font-bold tracking-tight text-[#12110F]">
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

// ── Skills — 4 side-by-side boxes that cascade open on scroll ─────────────────
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SKILLS.map((skill, i) => (
        <motion.div
          key={skill.label}
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.8 + i * 0.15, ease: "easeOut" }}
          className="rounded-2xl border border-[#E8E4DC] bg-white/90 p-5 shadow-sm backdrop-blur-sm"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">
            {skill.label}
          </p>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={inView ? { height: "auto", opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.92 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm leading-relaxed text-[#374151]">{skill.description}</p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Charts — only mount recharts when in-viewport so animation always fires ───

function BudgetTierChart({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { tier: "Reduce",  stores: 26, fill: RED    },
    { tier: "Develop", stores: 65, fill: AMBER  },
    { tier: "Invest",  stores: 48, fill: VIOLET },
    { tier: "Protect", stores: 41, fill: ACCENT },
  ];
  if (!mounted || !active)
    return <div className="h-52 rounded-xl bg-[#F0EDE6] animate-pulse" />;
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
          <Tooltip cursor={{ fill: "#F7F6F2" }} formatter={(v) => [`${v} locations`, "Count"]}
            contentStyle={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 8, fontSize: 12 }} />
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
  if (!mounted || !active)
    return <div className="h-64 rounded-xl bg-[#F0EDE6] animate-pulse" />;
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
          <Tooltip cursor={{ fill: "#F7F6F2" }} formatter={(v) => [`${v}%`, "Share of spend"]}
            contentStyle={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 8, fontSize: 12 }} />
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
  if (!mounted || !active)
    return <div className="h-64 rounded-xl bg-[#F0EDE6] animate-pulse" />;
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
          <Tooltip formatter={(v) => [`${v}%`, "Share"]}
            contentStyle={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 8, fontSize: 12 }} />
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
  bg: string;
  reversed: boolean;
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
    company: "National Automotive Franchise Group",
    bg: "#FFFFFF",
    reversed: false,
    headlinePrefix: "$",
    headlineNumber: 280,
    headlineSuffix: "K",
    headlineLabel: "reallocation opportunity identified",
    tags: ["Snowflake SQL", "Excel", "Google Ads", "Franchise POS Data", "AI-assisted analysis"],
    role: "Designed the framework, built the analysis model, and translated findings into executive-ready recommendations.",
    problem: "Paid media budgets were spread too evenly across 180 corporate locations. Prior analysis relied on market-level estimates — too blunt for store-by-store decisions and unable to account for seasonal exceptions.",
    action: "Rebuilt the model around store-level BDI/CDI using ~1.1M point-of-sale transactions. Corrected ghost location IDs, added a seasonality checkpoint, and built a four-tier (Protect / Invest / Develop / Reduce) prioritization map with immediate-action tiers.",
    result: "Leadership received a defensible $280K reallocation opportunity with a clear store-level action map — making budget conversations faster and more evidence-based.",
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
    bg: "#F5F3EE",
    reversed: true,
    headlinePrefix: "",
    headlineNumber: 6900,
    headlineSuffix: "",
    headlineLabel: "store-month rows modeled across 8 channels",
    tags: ["Excel modeling", "SharePoint", "Attribution design", "Executive reporting"],
    role: "Architected the model, codified assumptions, and aligned delivery with CMO/CEO planning workflows.",
    problem: "Attribution logic lived across fragmented files and inconsistent assumptions — creating reconciliation risk and slowing executive reporting across 286 locations and 8 channels.",
    action: "Designed an auditable Excel architecture with channel-specific allocation rules, clear input boundaries, and a dedicated CEO planning lever. Kept scenario planning separate from historical actuals to prevent version drift.",
    result: "The organization gained a single trusted attribution layer covering 286 locations × 24 months. Monthly decision-making became more consistent across marketing leadership.",
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
    bg: "#FFFFFF",
    reversed: false,
    headlinePrefix: "up to ",
    headlineNumber: 40,
    headlineSuffix: "%",
    headlineLabel: "non-oil activity undercounted before taxonomy fix",
    tags: ["Snowflake SQL", "Python", "Excel pipeline", "Franchise CRM", "Dashboard logic"],
    role: "Led query design, data QA, translation of technical caveats, and stakeholder-facing delivery.",
    problem: "Operations and marketing needed a reliable view of what services locations actually sell — but existing taxonomy logic was undercounting non-oil service activity by 25–40%.",
    action: "Built unified SQL and Excel outputs with fleet filtering, oil/non-oil toggles, and service taxonomy normalization across ~285 locations. Also designed a CRM journey suppression query to reduce irrelevant follow-up messaging.",
    result: "Teams got cleaner targeting logic and a more credible view of location demand — enabling better service marketing prioritization and less noise in retention workflows.",
    miniStats: [
      { target: 285, prefix: "~", label: "locations analyzed" },
      { display: "25–40%", label: "undercount gap corrected" },
    ],
    Chart: ServiceSplitChart,
  },
];

// ── Project section — editorial, no card borders ──────────────────────────────
function ProjectSection({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{ background: project.bg }} className="relative overflow-hidden px-6 py-20 sm:px-12 lg:px-24">
      {/* Watermark number */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 top-2 select-none font-black leading-none text-[#12110F]/[0.04]"
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
          <span className="text-xs font-bold uppercase tracking-widest text-[#1E40AF]">
            Case Study {project.number}
          </span>
          <span className="h-px flex-1 bg-[#E8E4DC]" />
          <span className="text-xs text-[#9E988F]">{project.company}</span>
        </div>

        {/* Content grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Info column */}
          <div className={project.reversed ? "lg:order-last" : ""}>
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h3>
            <p className="mt-2 text-[#6B6560]">{project.subtitle}</p>

            <div className="mt-10">
              {(["problem", "action", "result"] as const).map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
                  className="border-t border-[#E8E4DC] py-5"
                >
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#9E988F]">
                    {key}
                  </p>
                  <p className="text-sm leading-relaxed text-[#374151]">{project[key]}</p>
                </motion.div>
              ))}
              <div className="border-t border-[#E8E4DC] pt-5">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-[#9E988F]">{tag}</span>
                  ))}
                </div>
                <p className="mt-2 text-xs italic text-[#9E988F]">{project.role}</p>
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
              <p className="font-black leading-none tracking-tight text-[#1E40AF] sm:text-8xl"
                style={{ fontSize: "clamp(3.5rem, 8vw, 5.5rem)" }}>
                {project.headlinePrefix}{project.headlineNumber.toLocaleString()}{project.headlineSuffix}
              </p>
              <p className="mt-3 text-sm text-[#6B6560]">{project.headlineLabel}</p>
            </motion.div>

            <div className="mt-10">
              <project.Chart active={inView} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-[#E8E4DC] pt-6">
              {project.miniStats.map((s, i) => (
                <div key={i}>
                  {"target" in s ? (
                    <MiniCountUp target={s.target} prefix={s.prefix} suffix={s.suffix} active={inView} />
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-[#12110F]">{s.display}</p>
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
        <a href="https://github.com/SKE-creator" target="_blank" rel="noopener noreferrer"
          className="text-sm text-[#6B6560] transition-colors hover:text-[#12110F]">
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
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#1E40AF]"
          >
            AI + Analytics Portfolio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl"
          >
            I build analytics systems that turn ambiguity into decisions.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-[#6B6560]"
          >
            Senior marketing analyst at a national automotive franchise group. 8+ years
            translating fragmented data, shifting priorities, and ambiguous business
            questions into evidence-based recommendations executives can act on.
          </motion.p>

          <SkillBoxes />

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-14 flex items-center gap-2 text-sm text-[#9E988F]"
          >
            <span>Scroll to explore</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
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

      {/* Section header */}
      <div className="px-6 pb-4 pt-20 sm:px-12 lg:px-20">
        <FadeUp className="mx-auto w-full max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#1E40AF]">Selected Work</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight">Three case studies.</h2>
          <p className="mt-3 max-w-xl text-[#6B6560]">
            Each built around a real business problem at a national franchise automotive
            group — written for fast scan: problem, action, result.
          </p>
        </FadeUp>
      </div>

      {/* Projects — full-width editorial sections */}
      <div className="mt-10">
        {projects.map((p) => <ProjectSection key={p.number} project={p} />)}
      </div>

      {/* Methodology */}
      <section className="border-t border-[#E8E4DC] bg-[#EEF2FF] px-6 py-20 sm:px-12 lg:px-20">
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
          <a href="https://github.com/SKE-creator/professional-portfolio" target="_blank" rel="noopener noreferrer"
            className="text-sm text-[#1E40AF] hover:underline">
            View source on GitHub ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
