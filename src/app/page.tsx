"use client";

import { useEffect, useState } from "react";

import { CopyCommand } from "@/components/CopyCommand";
import { Logo } from "@/components/Logo";
import { report } from "process";

const npmUrl = "https://www.npmjs.com/package/aioengine";
const issuesUrl = "https://github.com/oliviaheninger-ux/aioengine/issues";
const repoUrl = "https://github.com/oliviaheninger-ux/aioengine";

const reportFiles = [
  {
    path: "README.md",
    status: "in scope",
    tone: "green",
  },
  {
    path: "packages/cli/package.json",
    status: "possible scope drift",
    tone: "yellow",
  },
  {
    path: ".github/workflows/aioengine.yml",
    status: "possible scope drift",
    tone: "yellow",
  },
];

const toolkit = [
  {
    title: "Init",
    command: "npx -y aioengine@latest init --github",
    description:
      "Set up local AI coding boundaries, Claude/Cursor rules, and GitHub PR reports in one command.",
  },
  {
    title: "Check",
    command: "npx -y aioengine@latest check",
    description:
      "Review your repo setup for missing guardrails, risky files, missing GitHub Actions, and weak review signals.",
  },
  {
    title: "Snapshot",
    command: "npx -y aioengine@latest snapshot --name checkpoint",
    description:
      "Save Git HEAD, file hashes, and repo context before a larger AI-assisted change.",
  },
  {
    title: "Scope",
    command: 'npx -y aioengine@latest scope "example: update README docs" --profile <profile>',
    description:
      "Tell aioengine what kind of task AI was supposed to do, then flag files outside that scope. Available profiles: ui, docs, cli, ci, backend, marketing",
  },
  {
    title: "Review",
    command: "npx -y aioengine@latest review",
    description:
      "Review current Git changes for sensitive files, dependency edits, config changes, and risky areas.",
  },
  {
    title: "Open a PR or local CI report",
    command: "npx -y aioengine@latest ci --report aioengine-report.md",
    description:
      "Generate a Markdown report for GitHub Actions, PR comments, and review artifacts.",
  },
];

const problems = [
  {
    title: "AI can drift outside the prompt",
    description:
      "A docs request can turn into package, workflow, auth, or config changes if you are not watching the diff closely.",
  },
  {
    title: "Bigger diffs are harder to trust",
    description:
      "AI tools move fast, but reviewing a wide diff across unrelated files still takes real human attention.",
  },
  {
    title: "Risky files need extra attention",
    description:
      "Package files, workflows, auth, billing, env files, and backend config should not slip through as casual edits.",
  },
  {
    title: "Snapshots make reviews easier",
    description:
      "A snapshot records Git HEAD, tracked file hashes, and repo context before AI changes code, giving you a known checkpoint.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Install guardrails",
    description:
      "Create local AI coding rules, a root .gitignore, snapshot safety files, and optional GitHub Actions.",
    command: "npx -y aioengine@latest init --github",
  },
  {
    step: "02",
    title: "Snapshot first",
    description:
      "Save a checkpoint before a larger AI edit so the review starts from a known repo state.",
    command: "npx -y aioengine@latest snapshot --name checkpoint",
  },
  {
    step: "03",
    title: "Keep one task type",
    description:
      "Use one focused branch or PR when possible. Choose a profile like ui, docs, cli, ci, backend, or marketing.",
    command: 'npx -y aioengine@latest scope "example: update README docs" --profile <profile>',
  },
  {
    step: "04",
    title: "Review the diff",
    description:
      "Run review before committing so risky files, dependency edits, and config changes are easier to notice.",
    command: "npx -y aioengine@latest review",
  },
  {
    step: "05",
    title: "Open a PR or save the results as a Markdown report",
    description:
      "aioengine runs in GitHub Actions and posts the change-control report directly on the pull request. Use the command below to save the results as a Markdown report for local review or CI artifacts.",
    command: "npx -y aioengine@latest ci --report aioengine-report.md",
  },
];

const freeFeatures = [
  "Local repo setup checks",
  "Root .gitignore creation",
  "Claude Code guardrails",
  "Cursor rules",
  "Snapshot checkpoints",
  "Scope profiles",
  "Risky file review",
  "GitHub Actions workflow",
  "Pinned workflow version",
  "Markdown CI reports",
  "GitHub PR comments",
];

const comingSoonFeatures = [
  "Saved report history",
  "Custom project rules",
  "Team policy presets",
  "Dashboard summaries",
  "Multiple repo views",
  "Slack or email alerts",
  "Upgrade workflow helper",
  "More AI tool-specific integrations",
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
            <Logo className="h-10 w-auto sm:h-12" />
          </a>

          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#toolkit" className="transition hover:text-white">
              Toolkit
            </a>
            <a href="#workflow" className="transition hover:text-white">
              Workflow
            </a>
            <a href="#free" className="transition hover:text-white">
              Start Free
            </a>
          </nav>

          <a
            href={npmUrl}
            target="_blank"
            rel="noreferrer"
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
              Catch AI scope drift before it merges.
            </h1>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
              aioengine adds AI change-control guardrails to your repo. Run it
              locally, in CI, or on GitHub pull requests to catch risky or
              out-of-scope AI-generated code before it gets committed or merged.
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={npmUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 px-5 py-3 text-sm font-semibold text-[#061211] shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] sm:w-auto"
              >
                View on npm
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
        <CopyCommand command="npx -y aioengine@latest init --github" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#071b19] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">aioengine Init</p>
            <p className="mt-1 text-xs text-white/45">
              AI change control for developers
            </p>
          </div>
          <StatusPill label="Guardrails created" tone="green" />
        </div>

        <div className="mt-4 grid gap-2 text-xs text-white/70 sm:grid-cols-3">
          <MiniStat value="1" label="GitHub workflow" />
          <MiniStat value="2" label="AI rule files" />
          <MiniStat value="1" label="Snapshot guard" />
        </div>

        <div className="mt-4 space-y-2 text-xs">
          <p className="break-words text-emerald-200">
            ✓ .aioengine/config.json
          </p>
          <p className="break-words text-emerald-200">
            ✓ CLAUDE.md
          </p>
          <p className="break-words text-emerald-200">
            ✓ .cursor/rules/aioengine.mdc
          </p>
          <p className="break-words text-emerald-200">
            ✓ .github/workflows/aioengine.yml
          </p>
          <p className="break-words text-emerald-200">
            ✓ .aioengine/snapshots/.gitignore
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-xs leading-5 text-cyan-50/85">
          aioengine sets up local guardrails and a pinned GitHub Actions workflow,
          so AI-generated changes can be checked before they merge.
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
        Generated before commit or on a pull request
      </p>
    </div>
    <StatusPill label="Needs review" tone="yellow" />
  </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <MiniStat value="3" label="Files changed" />
      <MiniStat value="1" label="Scope drift" />
      <MiniStat value="1" label="Risky file" />
    </div>

    <div className="mt-5 space-y-3">
      <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-xs text-emerald-200">
          ✓
        </span>
        <div className="min-w-0">
          <p className="break-words text-sm text-white/80">
            README.md
          </p>
          <p className="mt-1 text-xs text-emerald-200/70">
            in scope for docs update
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.06] p-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-300/15 text-xs text-yellow-200">
          !
        </span>
        <div className="min-w-0">
          <p className="break-words text-sm text-white/80">
            packages/cli/package.json
          </p>
          <p className="mt-1 text-xs text-yellow-200/80">
            possible scope drift and dependency-sensitive file
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-xs text-cyan-200">
          →
        </span>
        <div className="min-w-0">
          <p className="break-words text-sm text-white/80">
            Recommendation
          </p>
          <p className="mt-1 text-xs leading-5 text-white/55">
            Check the flagged file before merging and keep anything unrelated out
            of this change.
          </p>
        </div>
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
        What aioengine adds
      </p>
      <p className="mt-3 text-sm font-medium text-white">
        A focused first-pass review for AI-generated changes.
      </p>
      <p className="mt-2 text-sm leading-6 text-white/60">
        It highlights scope drift, risky files, and review-heavy edits so you know
        exactly where to look before committing.
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

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolkit.map((item) => (
              <div
                key={item.title}
                className="min-w-0 rounded-3xl border border-white/10 bg-[#071b19] p-5"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>

                <div className="mt-4 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3">
                  <code className="block whitespace-pre-wrap break-words text-xs leading-5 text-cyan-100">
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

            <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-5">
              <p className="text-sm font-semibold text-cyan-100">
                "Snapshot" to save your current repo state
              </p>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Before a larger AI edit, aioengine can save a local checkpoint with Git HEAD, tracked file hashes, and key repo context. That gives you a clear before-state, so changes are easier to inspect, compare, and roll back if an AI edit goes off track, rewrites the wrong files, or deletes large sections unexpectedly.

              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                <code className="block break-words text-xs leading-5 text-cyan-100">
                  npx -y aioengine@latest snapshot --name checkpoint
                </code>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {problems.map((problem) => (
              <div
                key={problem.title}
                className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-yellow-300/10 text-yellow-200">
                  !
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">
                  {problem.title}
                </h3>
                <p className="mt-3 break-words text-sm leading-6 text-white/65">
                  {problem.description}
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
            <p className="mt-4 text-pretty leading-7 text-white/65">
              aioengine works best when each branch or pull request has one
              clear task type.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                  <code className="block whitespace-pre-wrap break-words text-xs leading-5 text-cyan-100">
                    {item.command}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
            <section
        id="free"
        className="relative z-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-emerald-200">
              Free public CLI
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Free guardrails for AI-assisted developers.
            </h2>
            <p className="mt-4 text-pretty leading-7 text-white/65">
              aioengine is free to start. No account required. No dashboard
              required. Run it locally or add it to GitHub Actions for pull
              request reports.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">Free</h3>
                  <p className="mt-3 text-4xl font-semibold">$0</p>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    Local and GitHub PR checks for AI-assisted developers.
                  </p>
                </div>
                <StatusPill label="Live now" tone="green" />
              </div>

              <ul className="mt-6 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex min-w-0 gap-3">
                    <span className="shrink-0 text-emerald-200">✓</span>
                    <span className="min-w-0 break-words">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={npmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-300/40 hover:bg-cyan-300/15 sm:w-auto"
                >
                  Start on npm
                </a>
                <a
                  href={issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10 sm:w-auto"
                >
                  Send feedback
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <StatusPill label="Coming soon" tone="cyan" />
              <h3 className="mt-4 text-2xl font-semibold">
                Future features
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Paid features will focus on teams, history, policy management,
                and workflow visibility. The public CLI remains the starting
                point.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-white/70">
                {comingSoonFeatures.map((feature) => (
                  <li key={feature} className="flex min-w-0 gap-3">
                    <span className="shrink-0 text-cyan-200">→</span>
                    <span className="min-w-0 break-words">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
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
                check, then add aioengine to GitHub Actions for pull request
                guardrails.
              </p>
            </div>

            <div className="min-w-0 rounded-3xl border border-white/10 bg-black/35 p-4">
              <a
                href={npmUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="View aioengine on npm"
                className="flex min-w-0 items-start gap-2 rounded-2xl bg-white/[0.04] p-3 text-sm transition hover:bg-white/[0.07]"
              >
                <span className="shrink-0 text-emerald-300">$</span>
                <code className="block min-w-0 overflow-x-auto whitespace-nowrap text-cyan-100">
                  npx -y aioengine@latest init --github
                </code>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
  <div className="mx-auto w-full max-w-6xl">
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cyan-200">
            Early feedback welcome
          </p>

          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Tried aioengine? Tell me what felt confusing.
          </h2>

          <p className="mt-4 text-pretty leading-7 text-white/65">
            aioengine is early and intentionally opinionated. If you hit a bug,
            confusing output, a false positive, or a missing feature, please
            open a GitHub Issue so it can be tracked publicly.
          </p>

          <p className="mt-4 text-sm leading-6 text-white/50">
            Helpful feedback includes the AI coding tool you used, the command
            you ran, what aioengine flagged, and whether the result felt useful
            or too strict.
          </p>
        </div>

        <div className="min-w-0 rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-5">
          <p className="text-sm font-semibold text-cyan-100">
            Report bugs or request features
          </p>

          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex gap-3">
              <span className="shrink-0 text-emerald-200">✓</span>
              <span>bugs or crashes</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-emerald-200">✓</span>
              <span>confusing command output</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-emerald-200">✓</span>
              <span>false positives or missed risky changes</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-emerald-200">✓</span>
              <span>feature requests</span>
            </li>
          </ul>

          <a
            href={issuesUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
          >
            Open a GitHub Issue
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 text-sm text-white/45 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Logo className="h-8 w-auto max-w-[150px]" />
            <p className="mt-3 break-words">
              AI change control for developers using AI coding tools.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={npmUrl} target="_blank" rel="noreferrer" className="hover:text-white">
              npm
            </a>
            <a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-white">
              GitHub
            </a>
            <a href={issuesUrl} target="_blank" rel="noreferrer" className="hover:text-white">
              Support
            </a>
            <a href="/legal" className="hover:text-white">
              Privacy
            </a>
            <a href="/legal" className="hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </footer>

      <CookieNotice />
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

function StatusPill({
  label,
  tone = "green",
}: {
  label: string;
  tone?: "green" | "yellow" | "cyan" | "neutral";
}) {
  const classes = {
    green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    yellow: "border-yellow-300/25 bg-yellow-300/10 text-yellow-100",
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    neutral: "border-white/15 bg-white/10 text-white/80",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${classes[tone]}`}
    >
      {label}
    </span>
  );
}

function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted =
      window.localStorage.getItem("aioengine-cookie-notice-accepted") === "true";

    setVisible(!accepted);
  }, []);

  function acceptNotice() {
    window.localStorage.setItem("aioengine-cookie-notice-accepted", "true");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#071b19]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur sm:bottom-6 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Cookie notice</p>
          <p className="mt-2 text-sm leading-6 text-white/65">
            aioengine.com uses a small local preference so this notice stays
            hidden after you accept it. The public CLI does not require an
            account, and no analytics cookies are required to use this site.
          </p>
          <a
            href="/legal"
            className="mt-2 inline-flex text-sm font-medium text-cyan-100 hover:text-white"
          >
            Read privacy and terms
          </a>
        </div>

        <button
          type="button"
          onClick={acceptNotice}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 px-5 py-3 text-sm font-semibold text-[#061211] transition hover:scale-[1.01]"
        >
          Accept
        </button>
      </div>
    </div>
  );
}