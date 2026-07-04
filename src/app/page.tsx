import { siteConfig } from "@/siteconfig";

const tools = [
  {
    name: "Check",
    label: "Free setup scan",
    description:
      "Scan your repo for missing AI coding rules, risky config patterns, env exposure, weak git hygiene, and setup gaps.",
  },
  {
    name: "Review",
    label: "AI change review",
    description:
      "Review AI-generated diffs before commit. Flag risky files, dependency changes, missing tests, and sensitive areas.",
  },
  {
    name: "Scope",
    label: "Out-of-scope detection",
    description:
      "Compare the requested task to the files changed and spot when AI wandered into auth, billing, database, or config.",
  },
  {
    name: "Rules",
    label: "Agent instructions",
    description:
      "Generate practical Claude Code and Cursor rules that keep AI changes narrow, safer, and easier to review.",
  },
];

const risks = [
  "AI changed auth, billing, database, or env files during a small UI task.",
  "A coding agent added a dependency you did not ask for.",
  "Claude or Cursor edited too many unrelated files.",
  "Your repo has no clear AI rules, boundaries, or review checklist.",
  "MCP tools or local config may expose more access than you realize.",
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "For trying aioengine locally.",
    features: [
      "Run aioengine Check",
      "Basic setup warnings",
      "Top repo risk signals",
      "Starter AI safety checklist",
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
      "Out-of-scope change warnings",
    ],
    highlighted: true,
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
    <main className="min-h-screen bg-[#071312] text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-sm font-bold text-cyan-200">
              aio
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </div>

          <a
            href="#pricing"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-300/50 hover:text-white"
          >
            Pricing
          </a>
        </nav>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              AI change control for developers
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Review AI-generated code before you trust it.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              aioengine helps developers using Claude Code, Cursor, Codex,
              Copilot, and MCP tools catch risky, out-of-scope, and sensitive
              code changes before they commit or merge.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#start"
                className="rounded-full bg-cyan-300 px-6 py-3 text-center text-sm font-semibold text-[#071312] transition hover:bg-cyan-200"
              >
                Start with a free check
              </a>
              <a
                href="#tools"
                className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white/85 transition hover:border-white/30 hover:text-white"
              >
                See the toolkit
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/40">
            <div className="rounded-2xl border border-white/10 bg-[#081817] p-5 font-mono text-sm text-white/80">
              <div className="text-cyan-200">$ npx aioengine check</div>
              <div className="mt-5 text-white">aioengine Check</div>
              <div className="mt-2 text-white/50">
                AI coding setup score:{" "}
                <span className="text-yellow-200">68/100</span>
              </div>

              <div className="mt-6 text-red-200">Critical</div>
              <div className="mt-2 text-white/65">
                ✗ Env files detected at repo root
              </div>
              <div className="text-white/65">
                ✗ No AI rules found for Claude or Cursor
              </div>

              <div className="mt-5 text-yellow-200">Review recommended</div>
              <div className="mt-2 text-white/65">
                ! package.json changed during a UI task
              </div>
              <div className="text-white/65">
                ! Auth files changed outside requested scope
              </div>

              <div className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-100">
                Next: run aioengine Review before committing.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-3">
          <Metric value="84%" label="of developers use or plan to use AI tools" />
          <Metric value="85%" label="say review and validation are now the bottleneck" />
          <Metric value="1 goal" label="move fast with AI without losing repo control" />
        </section>

        <section id="tools" className="py-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              The toolkit
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              One CLI. Multiple safety layers.
            </h2>
            <p className="mt-4 text-white/65">
              aioengine is not another coding assistant. It is the review layer
              for developers already using AI coding tools.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-semibold">{tool.name}</h3>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                    {tool.label}
                  </span>
                </div>
                <p className="mt-4 leading-7 text-white/65">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Why it exists
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              AI can write code faster than you can review it.
            </h2>
            <p className="mt-4 leading-7 text-white/65">
              That is the new bottleneck. aioengine helps you quickly identify
              the parts of an AI-generated change that deserve human attention.
            </p>
          </div>

          <div className="space-y-3">
            {risks.map((risk) => (
              <div
                key={risk}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white/75"
              >
                {risk}
              </div>
            ))}
          </div>
        </section>

        <section
          id="start"
          className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
            Start free
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Run your first check locally.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/70">
            The first aioengine command will scan your repo for AI coding setup
            risks. Review and Scope become the paid workflow once PR checks and
            saved reports are available.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#071312] p-5 font-mono text-sm text-cyan-100">
            npx aioengine check
          </div>
        </section>

        <section id="pricing" className="py-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Pricing direction
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple monthly pricing for AI-assisted builders.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 ${
                  plan.highlighted
                    ? "border-cyan-300/40 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 text-4xl font-semibold">{plan.price}</div>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3 text-sm text-white/75">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-white/45">
          © {new Date().getFullYear()} aioengine. AI change control for
          developers.
        </footer>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071312]/50 p-5">
      <div className="text-3xl font-semibold text-cyan-200">{value}</div>
      <div className="mt-2 text-sm leading-6 text-white/60">{label}</div>
    </div>
  );
}