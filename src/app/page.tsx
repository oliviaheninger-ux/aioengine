import { Logo } from "@/components/Logo";
import { siteConfig } from "@/siteconfig";

const checks = [
  "Detect missing AI coding rules",
  "Flag risky files before commit",
  "Catch scope drift from AI edits",
  "Review dependency and config changes",
];

const toolkit = [
  {
    title: "Check",
    command: "npx aioengine check",
    description:
      "Scan a repo for AI coding guardrails like project rules, config files, env safety, tests, and Git setup.",
  },
  {
    title: "Init",
    command: "npx aioengine init",
    description:
      "Create starter AI coding boundaries with .aioengine config, CLAUDE.md, and Cursor rules.",
  },
  {
    title: "Scope",
    command: 'npx aioengine scope "update dashboard header"',
    description:
      "Compare the task you gave your AI coding tool against the files it actually changed.",
  },
  {
    title: "Review",
    command: "npx aioengine review",
    description:
      "Review current Git changes for sensitive files, dependency edits, config changes, and risky areas.",
  },
];

const problems = [
  "AI touched auth when you asked for a UI change",
  "A package file changed and you didn’t notice",
  "Cursor or Claude edited files outside the task",
  "Your repo has no AI coding rules or review boundaries",
];

const workflow = [
  {
    step: "01",
    title: "Run a setup check",
    description:
      "Start with a quick scan to see whether your repo has basic AI coding guardrails.",
    command: "npx aioengine check",
  },
  {
    step: "02",
    title: "Make AI-generated changes",
    description:
      "Use Claude Code, Cursor, Codex, Copilot, or another AI coding tool like normal.",
    command: "Ask your AI coding tool to make a change",
  },
  {
    step: "03",
    title: "Check scope before commit",
    description:
      "Tell aioengine what the task was and it will flag files that may be out of scope.",
    command: 'npx aioengine scope "update landing page headline"',
  },
  {
    step: "04",
    title: "Review risky files",
    description:
      "Run a final local review before committing or opening a pull request.",
    command: "npx aioengine review",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "Local AI coding checks for solo developers.",
    features: [
      "Run aioengine locally",
      "Setup score",
      "Scope checks",
      "Risky file review",
      "Claude and Cursor rule generation",
    ],
    cta: "Run npx aioengine check",
  },
  {
    name: "Solo",
    price: "$12/mo",
    description: "For developers who use AI coding tools every week.",
    features: [
      "Saved local reports",
      "Custom risk rules",
      "Better scope profiles",
      "Release checks",
      "Priority CLI updates",
    ],
    cta: "Coming soon",
  },
  {
    name: "Pro",
    price: "$29/mo",
    description: "For teams and agencies that want AI review on PRs.",
    features: [
      "GitHub PR checks",
      "Team rules",
      "Report history",
      "Sensitive file policies",
      "CI/CD guardrails",
    ],
    cta: "Coming soon",
  },
];
export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#061211] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-160px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl sm:h-[560px] sm:w-[560px]" />
        <div className="absolute left-[-220px] top-1/3 h-[360px] w-[360px] rounded-full bg-sky-400/10 blur-3xl sm:h-[520px] sm:w-[520px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#061211]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex min-w-0 items-center">
            <Logo className="h-8 w-auto max-w-[150px] sm:h-10 sm:max-w-[180px]" />
          </a>

          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#toolkit" className="transition hover:text-white">
              Toolkit
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </nav>

          <a
            href="#start"
            className="hidden rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/30 hover:bg-white/10 sm:inline-flex"
          >
            Start free
          </a>
        </div>
      </header>

      <section className="relative z-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="min-w-0">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100 sm:text-sm">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
              <span className="truncate">Now live on npm</span>
            </div>

            <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI change control for developers.
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
              {siteConfig.tagline} aioengine helps you catch risky,
              sensitive, or out-of-scope AI-generated code before you commit.
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#start"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 px-5 py-3 text-sm font-semibold text-[#061211] shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] sm:w-auto"
              >
                Start with npx
              </a>
              <a
                href="#toolkit"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 hover:bg-white/10 sm:w-auto"
              >
                See commands
              </a>
            </div>

            <div
              id="start"
              className="mt-8 w-full max-w-full overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-2xl shadow-black/20"
            >
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-300/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-300/80" />
                <span className="ml-2 truncate text-xs text-white/45">
                  terminal
                </span>
              </div>

              <div className="space-y-3 p-4 text-sm sm:p-5">
                <div className="flex min-w-0 items-start gap-2 rounded-2xl bg-white/[0.04] p-3">
                  <span className="shrink-0 text-emerald-300">$</span>
                  <code className="block min-w-0 overflow-x-auto whitespace-nowrap text-cyan-100">
                    npx aioengine check
                  </code>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#071b19] p-4">
                  <p className="text-sm font-semibold text-white">
                    aioengine Check
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    AI change control for developers
                  </p>

                  <div className="mt-4 grid gap-2 text-xs text-white/70 sm:grid-cols-2">
                    <MiniStat value="96/100" label="Setup score" />
                    <MiniStat value="2" label="Warnings found" />
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <p className="break-words text-yellow-200">
                      ! No GitHub Actions folder detected.
                    </p>
                    <p className="break-words text-yellow-200">
                      ! No obvious tests detected.
                    </p>
                    <p className="break-words text-emerald-200">
                      ✓ Claude rules detected
                    </p>
                    <p className="break-words text-emerald-200">
                      ✓ Cursor rules detected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
                    <div className="min-w-0">
            <div className="mx-auto w-full max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#071b19] p-4 sm:p-5">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      AI change report
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Generated before commit
                    </p>
                  </div>
                  <StatusPill label="Local only" />
                </div>

                <div className="mt-5 space-y-3">
                  {checks.map((check) => (
                    <div
                      key={check}
                      className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-xs text-emerald-200">
                        ✓
                      </span>
                      <span className="min-w-0 break-words text-sm text-white/75">
                        {check}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
                    Scope result
                  </p>
                  <p className="mt-3 text-sm font-medium text-white">
                    No obvious scope drift detected.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Still review the diff normally before committing
                    AI-generated code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="toolkit"
        className="relative z-10 border-y border-white/10 bg-white/[0.025] px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-cyan-200">
              The local AI review toolkit
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Start with one command. Add guardrails as you go.
            </h2>
            <p className="mt-4 text-pretty leading-7 text-white/65">
              aioengine is built for the moment after AI changes your code and
              before you trust it enough to commit.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {toolkit.map((item) => (
              <div
                key={item.title}
                className="min-w-0 rounded-3xl border border-white/10 bg-[#071b19] p-5"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>

                <div className="mt-4 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                  <code className="block overflow-x-auto whitespace-nowrap text-xs text-cyan-100">
                    {item.command}
                  </code>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-200">
              Why it matters
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              AI makes code faster. Review gets harder.
            </h2>
            <p className="mt-4 text-pretty leading-7 text-white/65">
              A small prompt can create a big diff. aioengine gives you a
              simple safety pass before you commit changes from AI coding tools.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {problems.map((problem) => (
              <div
                key={problem}
                className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-yellow-300/10 text-yellow-200">
                  !
                </span>
                <p className="mt-4 break-words text-sm leading-6 text-white/70">
                  {problem}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
            <section
        id="workflow"
        className="relative z-10 border-y border-white/10 bg-white/[0.025] px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-cyan-200">
              Simple workflow
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Review AI-generated code before it lands.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="min-w-0 rounded-3xl border border-white/10 bg-[#071b19] p-5"
              >
                <p className="text-sm font-semibold text-cyan-200">
                  {item.step}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  {item.description}
                </p>
                <div className="mt-5 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                  <code className="block overflow-x-auto whitespace-nowrap text-xs text-cyan-100">
                    {item.command}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative z-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-emerald-200">
              Pricing direction
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Free locally. Paid when teams need CI and PR guardrails.
            </h2>
            <p className="mt-4 text-pretty leading-7 text-white/65">
              The public CLI starts free. Paid features will focus on saved
              reports, GitHub checks, team rules, and continuous AI change
              control.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className="flex min-w-0 flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"
              >
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-3 text-3xl font-semibold">{plan.price}</p>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-white/70">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex min-w-0 gap-3">
                      <span className="shrink-0 text-emerald-200">✓</span>
                      <span className="min-w-0 break-words">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <div className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/80">
                    {plan.cta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/10 via-white/[0.04] to-emerald-300/10 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cyan-100">
                Try the public CLI
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Run aioengine in your repo now.
              </h2>
              <p className="mt-4 text-pretty leading-7 text-white/70">
                No account required. No dashboard required. Start with a local
                check and see what AI coding guardrails your project is missing.
              </p>
            </div>

            <div className="min-w-0 rounded-3xl border border-white/10 bg-black/35 p-4">
              <div className="flex min-w-0 items-start gap-2 rounded-2xl bg-white/[0.04] p-3 text-sm">
                <span className="shrink-0 text-emerald-300">$</span>
                <code className="block min-w-0 overflow-x-auto whitespace-nowrap text-cyan-100">
                  npx aioengine check
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Logo className="h-8 w-auto max-w-[150px]" />
          </div>
          <p className="break-words">
            AI change control for developers using AI coding tools.
          </p>
        </div>
      </footer>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="break-words text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 break-words text-[11px] uppercase tracking-[0.16em] text-white/40">
        {label}
      </p>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
      {label}
    </span>
  );
}