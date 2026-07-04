import { Logo } from "@/components/Logo";
import { siteConfig } from "@/siteconfig";

const checks = [
  "Sensitive files changed",
  "Out-of-scope edits",
  "Dependency changes",
  "Missing AI rules",
  "Env/config exposure",
];

const toolkit = [
  {
    name: "Check",
    label: "Free scan",
    description:
      "Scan your repo for missing AI rules, risky config patterns, env exposure, weak git hygiene, and setup gaps.",
    command: "npx aioengine check",
  },
  {
    name: "Review",
    label: "Core product",
    description:
      "Review AI-generated changes before commit. Flag risky files, sensitive areas, dependency changes, and missing tests.",
    command: "npx aioengine review",
  },
  {
    name: "Scope",
    label: "Change control",
    description:
      "Compare the requested task to the files changed and catch when AI wanders into auth, billing, database, or config.",
    command: 'npx aioengine scope "fix pricing page"',
  },
  {
    name: "Rules",
    label: "Agent setup",
    description:
      "Generate Claude Code and Cursor rules that keep AI edits narrow, safer, and easier to review.",
    command: "npx aioengine rules",
  },
];

const problems = [
  {
    title: "AI changes too much",
    description:
      "A simple UI request can turn into edits across auth, billing, config, database, and package files.",
  },
  {
    title: "Review becomes the bottleneck",
    description:
      "AI makes code fast, but developers still need to know which changes deserve human attention.",
  },
  {
    title: "Repos need boundaries",
    description:
      "Claude, Cursor, Codex, and MCP tools work better when your project has clear rules and risky areas are visible.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Run a local check",
    description:
      "Start with a free repo scan that highlights missing AI coding rules, risky setup patterns, and common guardrail gaps.",
  },
  {
    step: "02",
    title: "Review AI changes",
    description:
      "Before committing, aioengine checks your diff for sensitive files, dependency changes, scope drift, and missing test signals.",
  },
  {
    step: "03",
    title: "Add PR protection",
    description:
      "Upgrade to run aioengine in GitHub so AI-generated changes get reviewed before they merge.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "For trying aioengine locally.",
    features: [
      "Local setup check",
      "Basic repo risk signals",
      "AI safety checklist",
      "Starter command output",
    ],
  },
  {
    name: "Solo",
    price: "$12/mo",
    description: "For solo builders using AI coding tools.",
    features: [
      "Full local reports",
      "Generated Claude/Cursor rules",
      "Risky file detection",
      "Scope warnings",
    ],
    featured: true,
  },
  {
    name: "Pro",
    price: "$29/mo",
    description: "For serious indie devs and small SaaS builders.",
    features: [
      "GitHub PR checks",
      "Saved project rules",
      "AI change reports",
      "Up to 3 repos",
    ],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#061211] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_78%_14%,rgba(45,212,191,0.12),transparent_30%),radial-gradient(circle_at_52%_88%,rgba(52,211,153,0.12),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%,transparent_82%,rgba(34,211,238,0.04))]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061211]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
          <a href="#" className="flex items-center">
            <Logo className="h-11 w-auto" />
          </a>

          <nav className="hidden items-center rounded-2xl border border-white/10 bg-white/[0.04] p-1 md:flex">
            <a
              href="#toolkit"
              className="rounded-xl px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Toolkit
            </a>
            <a
              href="#workflow"
              className="rounded-xl px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Workflow
            </a>
            <a
              href="#pricing"
              className="rounded-xl px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Pricing
            </a>
          </nav>

          <a
            href="#start"
            className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-emerald-300/40 hover:bg-emerald-300/10 hover:text-white"
          >
            Start free
          </a>
        </div>
      </header>
            <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10">
        <section className="grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-gradient-to-r from-cyan-300/10 via-sky-300/10 to-emerald-300/10 px-4 py-2 text-sm text-cyan-100">
              AI change control for developers
            </div>

            <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Review AI-generated code before you trust it.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              {siteConfig.name} helps developers using Claude Code, Cursor,
              Codex, Copilot, and MCP tools catch risky, out-of-scope, and
              sensitive code changes before they commit or merge.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#start"
                className="rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 px-6 py-3 text-center text-sm font-semibold text-[#061211] shadow-lg shadow-cyan-950/30 transition hover:brightness-110"
              >
                Run the free check
              </a>
              <a
                href="#toolkit"
                className="rounded-2xl border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white/85 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-white"
              >
                Explore the toolkit
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <MiniStat value="Local" label="starts in your repo" />
              <MiniStat value="PR" label="paid workflow later" />
              <MiniStat value="MRR" label="built for SaaS" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-4 shadow-2xl shadow-black/30">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#071817] p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-white/45">aioengine report</p>
                  <p className="mt-1 font-mono text-sm text-cyan-200">
                    $ npx aioengine review
                  </p>
                </div>

                <div className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs text-yellow-100">
                  High risk
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/45">Review score</p>
                  <div className="mt-4 flex h-28 w-28 items-center justify-center rounded-full border border-yellow-300/30 bg-yellow-300/10 text-3xl font-semibold text-yellow-100">
                    62
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/55">
                    AI touched sensitive files during a small UI task.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/45">
                    Task: update pricing card layout
                  </p>

                  <div className="mt-4 space-y-3 font-mono text-sm">
                    <div className="rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-red-100">
                      ✗ app/api/stripe/webhook.ts
                    </div>
                    <div className="rounded-2xl border border-red-300/20 bg-red-300/10 p-3 text-red-100">
                      ✗ supabase/migrations/update_rls.sql
                    </div>
                    <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-yellow-100">
                      ! package.json changed
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="font-semibold text-cyan-100">Recommendation</p>
                <p className="mt-2 leading-7 text-white/65">
                  Do not commit yet. Review billing, database, and dependency
                  changes before trusting this AI-generated diff.
                </p>
              </div>
            </div>
          </div>
        </section>
                <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="rounded-3xl border border-white/10 bg-[#071817]/70 p-6"
            >
              <h3 className="text-lg font-semibold text-white">
                {problem.title}
              </h3>
              <p className="mt-3 leading-7 text-white/60">
                {problem.description}
              </p>
            </div>
          ))}
        </section>

        <section id="toolkit" className="py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              The aioengine toolkit
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              One CLI for safer AI-assisted development.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/60">
              aioengine is not another coding assistant. It is the review layer
              for developers already using AI to build faster.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {toolkit.map((tool) => (
              <div
                key={tool.name}
                className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{tool.name}</h3>
                    <p className="mt-2 text-sm text-cyan-100">{tool.label}</p>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">
                    aioengine
                  </div>
                </div>

                <p className="mt-5 min-h-20 leading-7 text-white/60">
                  {tool.description}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-[#061211] p-4 font-mono text-sm text-cyan-100">
                  {tool.command}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Workflow
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Start local. Grow into PR protection.
            </h2>
            <p className="mt-5 leading-7 text-white/60">
              The first version is simple: run a command, get a clear report,
              fix the risky parts. The SaaS layer adds saved rules, GitHub PR
              checks, and team-ready reports.
            </p>
          </div>

          <div className="space-y-4">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-white/10 bg-[#071817]/70 p-5"
              >
                <div className="text-sm font-semibold text-cyan-200">
                  {item.step}
                </div>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-white/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
               <section id="start" className="py-24">
          <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-r from-cyan-300/10 via-sky-300/10 to-emerald-300/10 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">
                  Start free
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                  Run your first check locally.
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-white/70">
                  The first aioengine command will scan your repo for AI coding
                  setup risks. Review and Scope become the paid workflow once PR
                  checks and saved reports are available.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#061211] p-5">
                <div className="font-mono text-sm text-cyan-100">
                  $ npx aioengine check
                </div>

                <div className="mt-5 space-y-3">
                  {checks.map((check) => (
                    <div
                      key={check}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70"
                    >
                      <span>{check}</span>
                      <span className="text-cyan-200">scan</span>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-sm leading-6 text-white/45">
                  Coming soon — join early access for first access.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="pb-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Pricing
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Monthly pricing for AI-assisted builders.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/60">
              Start free with a local check. Upgrade when you want full reports,
              generated rules, saved history, and pull request protection.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[2rem] border p-6 ${
                  plan.featured
                    ? "border-cyan-300/35 bg-cyan-300/10 shadow-2xl shadow-cyan-950/30"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-5 text-4xl font-semibold">{plan.price}</div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-white/60">
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3 text-sm text-white/72">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="text-cyan-200">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#start"
                  className={`mt-8 block rounded-2xl px-5 py-3 text-center text-sm font-semibold transition ${
                    plan.featured
                      ? "bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 text-[#061211] hover:brightness-110"
                      : "border border-white/15 text-white/80 hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-white"
                  }`}
                >
                  {plan.name === "Free" ? "Start free" : "Join early access"}
                </a>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-white/45">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}. AI change control
              for developers.
            </p>
            <p>{siteConfig.tagline}</p>
          </div>
        </footer>
      </section>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-lg font-semibold text-cyan-100">{value}</div>
      <div className="mt-1 text-xs leading-5 text-white/45">{label}</div>
    </div>
  );
} 