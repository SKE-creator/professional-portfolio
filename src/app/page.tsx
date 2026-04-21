export default function Home() {
  const featuredProjects = [
    {
      title: "Grease Monkey Paid Media Optimization (BDI/CDI)",
      headlineMetric: "$280K reallocation opportunity",
      outcome:
        "Built a store-level prioritization model for 180 corporate stores and identified a defensible reallocation opportunity of about $280K while preserving seasonal exceptions.",
      challenge:
        "Paid media budgets were being spread too evenly, and prior analysis relied on market-level estimates that were too blunt for store-by-store decisions.",
      solution:
        "I rebuilt the model around store-level BDI/CDI using about 1.1M Cinch transactions, corrected ghost location IDs, and added a seasonality checkpoint before recommending any budget shifts.",
      stack: ["Snowflake SQL", "Excel", "Google Ads data", "Cinch POS", "AI-assisted analysis"],
      role: "My role: Designed framework, built analysis model, and translated findings into executive-ready recommendations.",
      impact:
        "Result: leadership got a clear protect / invest / develop / reduce map with immediate-action tiers, making budget conversations faster and more evidence-based.",
    },
    {
      title: "FSA Attribution Layer (Store-Month Marketing Model)",
      headlineMetric: "286 stores x 24 months",
      outcome:
        "Created a single source of truth covering 286 stores across 24 months, about 6,900 store-month rows, and 8 channels to unify budget and actuals reporting.",
      challenge:
        "Attribution logic lived across fragmented files and assumptions, which created reconciliation risk and slowed executive reporting.",
      solution:
        "I designed an auditable Excel architecture with channel-specific allocation rules, clear input boundaries, and a dedicated CEO planning lever while keeping scenario planning separate from historical actuals.",
      stack: ["Excel modeling", "SharePoint data", "Attribution design", "Executive reporting"],
      role: "My role: Architected the model, codified assumptions, and aligned delivery with CMO/CEO planning workflows.",
      impact:
        "Result: FSA gained one trusted attribution layer that reduced version drift and made monthly decision-making more consistent across marketing leadership.",
    },
    {
      title: "FSA Store Service Intelligence (plus Journey Wizard Suppression)",
      headlineMetric: "~285 locations analyzed",
      outcome:
        "Delivered a store-level service demand intelligence system for about 285 locations and clarified a major segmentation blind spot where non-oil views can undercount activity by roughly 25-40%.",
      challenge:
        "Operations and marketing needed a reliable view of what services stores actually sell, but existing logic and taxonomy assumptions were creating confusion.",
      solution:
        "I built unified Snowflake SQL and Excel outputs with fleet filtering, oil/non-oil toggles, and service taxonomy normalization. I also built the Journey Wizard YES-path suppression query to reduce irrelevant follow-up messaging.",
      stack: ["Snowflake SQL", "Python", "Excel pipeline", "Dashboard logic", "Cinch CRM"],
      role: "My role: Led query design, data QA, translation of technical caveats, and stakeholder-facing delivery.",
      impact:
        "Result: teams got cleaner targeting logic and a more credible view of store demand, enabling better service marketing prioritization and less noise in retention workflows.",
    },
  ];

  return (
    <main className="bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-500"
        style={{ animation: "timeline-progress linear", animationTimeline: "scroll()" }}
      />

      <section className="relative overflow-hidden px-6 pb-24 pt-28 sm:px-12 lg:px-20">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="hero-glow absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/30 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-cyan-300">
            Sam Evans - AI Builder Portfolio
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Senior marketing analytics leader building AI-assisted systems that turn ambiguity into decisions.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            I work at the intersection of analytics, strategy, and execution. These case
            studies show how I translate messy operating problems into clearer budget
            decisions, better targeting, and stronger business visibility.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            {["Marketing Analytics", "AI-Assisted Execution", "Attribution", "Business Impact"].map(
              (pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-slate-200"
                >
                  {pill}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/40 px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-3">
          {[
            { label: "Featured AI Projects", value: "3+" },
            { label: "Years of Experience", value: "8+" },
            { label: "Career Proof Points", value: "$250K + $4M identified" },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className="mt-1 text-sm text-slate-300">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Project Journey
          </h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            Each project is written for fast hiring-manager scan: problem, action, result.
          </p>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-5xl gap-8">
          {featuredProjects.map((project, index) => (
            <article
              key={project.title}
              className="story-card grid gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="lg:sticky lg:top-24 lg:h-fit">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Case Study {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{project.title}</h3>
                <p className="mt-4 text-3xl font-semibold text-cyan-200">
                  {project.headlineMetric}
                </p>
                <p className="mt-4 text-sm text-slate-300">{project.outcome}</p>
                <p className="mt-4 text-sm text-cyan-100/90">{project.role}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-5 text-slate-200">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Problem
                  </p>
                  <p className="mt-2">{project.challenge}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Action
                  </p>
                  <p className="mt-2">{project.solution}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Result
                  </p>
                  <p className="mt-2">{project.impact}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-12 lg:px-20">
        <div className="mx-auto grid w-full max-w-5xl gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-cyan-500/10 p-8 sm:grid-cols-3">
          {[
            "Frame the business question",
            "Build an analysis system that holds up under scrutiny",
            "Translate technical work into executive decisions",
            "Tie recommendations back to measurable business impact",
          ].map((step, idx) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                Step {idx + 1}
              </p>
              <p className="mt-2 text-slate-100">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-28 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-slate-900 p-8 sm:p-12">
          <h2 className="text-3xl font-semibold">What this portfolio shows</h2>
          <p className="mt-4 max-w-2xl text-slate-300">
            My best work sits between analytics depth and business judgment. I build
            systems leaders can trust, then turn them into recommendations that are
            easy to act on.
          </p>
        </div>
      </section>
    </main>
  );
}
