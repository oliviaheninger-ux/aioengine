"use client";

import { useState, type FormEvent } from "react";

type AuditCheck = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  detail: string;
};

type AuditReport = {
  score: number;
  checkedUrl: string;
  checkedAt: string;
  checks: AuditCheck[];
};

type AuditResponse = {
  success: boolean;
  data?: AuditReport;
  error?: string;
};

type Priority = "High" | "Medium" | "Low";

type CheckGuidance = {
  priority: Priority;
  whyItMatters: string;
  recommendation: string;
};

const CHECK_GUIDANCE: Record<string, CheckGuidance> = {
  homepage: {
    priority: "High",
    whyItMatters:
      "AI crawlers cannot process content they cannot reliably reach.",
    recommendation:
      "Make sure the page loads publicly without authentication, redirect loops, bot challenges, or server errors.",
  },
  robots: {
    priority: "High",
    whyItMatters:
      "Robots.txt tells automated crawlers which parts of the site they can access and where supporting files are located.",
    recommendation:
      "Publish a robots.txt file at /robots.txt, allow the crawlers you want to support, and include the full sitemap URL.",
  },
  llms: {
    priority: "Medium",
    whyItMatters:
      "An llms.txt file can give supported AI tools a concise map of the site and its authoritative content.",
    recommendation:
      "Create /llms.txt with a short site summary and links to important documentation, services, policies, and contact pages.",
  },
  sitemap: {
    priority: "High",
    whyItMatters:
      "A sitemap gives crawlers a reliable inventory of the public pages you consider important.",
    recommendation:
      "Generate an XML sitemap, include canonical public pages, and reference the sitemap inside robots.txt.",
  },
  schema: {
    priority: "High",
    whyItMatters:
      "Structured data helps machines identify entities, products, services, organizations, and relationships on the page.",
    recommendation:
      "Add valid JSON-LD using an accurate Schema.org type such as Organization, SoftwareApplication, Product, Service, Article, or LocalBusiness.",
  },
  title: {
    priority: "High",
    whyItMatters:
      "The title provides a concise machine-readable description of the page’s primary subject.",
    recommendation:
      "Add a unique title that clearly identifies the product, organization, service, or topic represented by the page.",
  },
  description: {
    priority: "Medium",
    whyItMatters:
      "The meta description gives crawlers a short summary before they process the full document.",
    recommendation:
      'Add an accurate <meta name="description"> that describes the page in clear, natural language.',
  },
  canonical: {
    priority: "Low",
    whyItMatters:
      "A canonical URL tells crawlers which version of a page should be treated as authoritative.",
    recommendation:
      'Add an absolute <link rel="canonical"> tag pointing to the preferred public URL.',
  },
};

const PRIORITY_ORDER: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function getGuidance(checkId: string): CheckGuidance {
  return (
    CHECK_GUIDANCE[checkId] ?? {
      priority: "Medium",
      whyItMatters:
        "This technical signal can affect how machines discover and interpret the website.",
      recommendation:
        "Review the current implementation and update the website so this check can pass consistently.",
    }
  );
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Strong technical setup";
  if (score >= 70) return "Good foundation";
  if (score >= 45) return "Several gaps found";
  return "Major gaps found";
}

function getScoreClasses(score: number) {
  if (score >= 90) {
    return "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300";
  }

  if (score >= 70) {
    return "border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-300";
  }

  if (score >= 45) {
    return "border-amber-400/25 bg-amber-400/[0.07] text-amber-300";
  }

  return "border-rose-400/25 bg-rose-400/[0.07] text-rose-300";
}

function getPriorityClasses(priority: Priority) {
  if (priority === "High") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }

  if (priority === "Medium") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-slate-400/20 bg-slate-400/10 text-slate-300";
}

function CheckStatusIcon({ passed }: { passed: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
        passed
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-rose-400/20 bg-rose-400/10 text-rose-300"
      }`}
      aria-hidden="true"
    >
      {passed ? "✓" : "×"}
    </span>
  );
}

function TechnicalCheckCard({ check }: { check: AuditCheck }) {
  return (
    <article
      className={`rounded-2xl border p-5 transition ${
        check.passed
          ? "border-emerald-400/10 bg-emerald-400/[0.025]"
          : "border-rose-400/10 bg-rose-400/[0.025]"
      }`}
    >
      <div className="flex items-start gap-4">
        <CheckStatusIcon passed={check.passed} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-white">{check.label}</h3>

            <span className="shrink-0 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-xs font-medium text-slate-500">
              {check.weight} pts
            </span>
          </div>

          <p className="mt-2 break-words text-sm leading-6 text-slate-400">
            {check.detail}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showFullReport, setShowFullReport] = useState(false);

  const runDiagnostic = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setErrorMessage("Enter a public website URL.");
      return;
    }

    setLoading(true);
    setReport(null);
    setErrorMessage("");
    setShowFullReport(false);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: trimmedUrl,
        }),
      });

      const result = (await response.json()) as AuditResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error ?? "The audit could not be completed.");
      }

      setReport(result.data);
    } catch (error) {
      console.error("Audit failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The audit could not be completed. Check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const passedChecks =
    report?.checks.filter((check) => check.passed) ?? [];

  const failedChecks =
    report?.checks.filter((check) => !check.passed) ?? [];

  const prioritizedFailedChecks = [...failedChecks].sort((first, second) => {
    const priorityDifference =
      PRIORITY_ORDER[getGuidance(first.id).priority] -
      PRIORITY_ORDER[getGuidance(second.id).priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return second.weight - first.weight;
  });

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[850px] max-w-full -translate-x-1/2 rounded-full bg-cyan-400/[0.08] blur-[150px]" />

      <div className="pointer-events-none absolute top-[500px] right-[-120px] h-[360px] w-[360px] rounded-full bg-lime-300/[0.04] blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-6 lg:pt-20">
        <section className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-2 text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            Technical AI-readiness audit
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Make websites easier
            <span className="block bg-gradient-to-r from-cyan-300 via-cyan-200 to-lime-300 bg-clip-text text-transparent">
              for AI systems to read.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
            Audit the public technical signals developers can actually control:
            crawler access, sitemaps, structured data, metadata, canonical URLs,
            and AI-readable context files.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span>For developers</span>
            <span className="hidden text-slate-700 sm:inline">•</span>
            <span>For freelancers</span>
            <span className="hidden text-slate-700 sm:inline">•</span>
            <span>For agencies</span>
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/55 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-5 py-3.5 sm:px-7">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>

            <span className="font-mono text-[11px] tracking-wider text-slate-600">
              aioengine / public-site-audit
            </span>
          </div>

          <div className="p-5 sm:p-7 lg:p-8">
            <form
              onSubmit={(event) => void runDiagnostic(event)}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-2"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="website-url" className="sr-only">
                  Public website URL
                </label>

                <div className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:px-4">
                  <span className="font-mono text-sm text-slate-600">
                    https://
                  </span>

                  <input
                    id="website-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="your-client-site.com"
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-700 sm:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-lime-300 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Running checks…" : "Run technical audit"}
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "robots.txt",
                "llms.txt",
                "sitemap.xml",
                "JSON-LD",
                "metadata",
                "canonical",
              ].map((signal) => (
                <span
                  key={signal}
                  className="rounded-md border border-white/5 bg-white/[0.025] px-2.5 py-1 font-mono text-[11px] text-slate-600"
                >
                  {signal}
                </span>
              ))}
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
              >
                {errorMessage}
              </p>
            )}

            {loading && (
              <div
                role="status"
                className="mt-7 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-black/20 px-6 py-12 text-center"
              >
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />

                <p className="mt-4 font-medium text-slate-300">
                  Inspecting public website signals
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Checking files, structured data, and page metadata…
                </p>
              </div>
            )}

            {report && (
              <div className="mt-8 space-y-8" aria-live="polite">
                <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                  <div
                    className={`relative overflow-hidden rounded-2xl border p-7 ${getScoreClasses(
                      report.score,
                    )}`}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />

                    <p className="text-xs font-bold tracking-[0.14em] uppercase opacity-80">
                      Technical score
                    </p>

                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-7xl font-black tracking-[-0.07em]">
                        {report.score}
                      </span>

                      <span className="pb-2 text-sm opacity-60">/ 100</span>
                    </div>

                    <p className="mt-4 text-sm font-semibold">
                      {getScoreLabel(report.score)}
                    </p>

                    <p className="mt-2 text-xs leading-5 opacity-60">
                      Based only on the checks displayed in this report.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-6">
                    <div className="flex flex-col justify-between gap-5 border-b border-white/5 pb-5 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-[0.12em] text-slate-600 uppercase">
                          Audited website
                        </p>

                        <p className="mt-2 break-all font-mono text-sm text-slate-200 sm:text-base">
                          {report.checkedUrl}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:min-w-[250px]">
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                          <p className="text-2xl font-bold text-white">
                            {passedChecks.length}
                          </p>
                          <p className="text-xs text-slate-600">Checks passed</p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                          <p className="text-2xl font-bold text-white">
                            {failedChecks.length}
                          </p>
                          <p className="text-xs text-slate-600">
                            Needs attention
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs text-slate-600">
                        <span>Points earned</span>
                        <span>{report.score} / 100</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-300 transition-all duration-700"
                          style={{ width: `${report.score}%` }}
                        />
                      </div>
                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-600">
                      This score is not a prediction of AI rankings, citations,
                      traffic, or inclusion in generated answers.
                    </p>
                  </div>
                </div>

                {failedChecks.length > 0 && (
                  <section>
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold tracking-[0.14em] text-rose-300 uppercase">
                          Needs attention
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-white">
                          Technical gaps
                        </h2>
                      </div>

                      <span className="text-sm text-slate-600">
                        {failedChecks.length}{" "}
                        {failedChecks.length === 1 ? "issue" : "issues"}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {failedChecks.map((check) => (
                        <TechnicalCheckCard key={check.id} check={check} />
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold tracking-[0.14em] text-emerald-300 uppercase">
                        Verified
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-white">
                        Passing signals
                      </h2>
                    </div>

                    <span className="text-sm text-slate-600">
                      {passedChecks.length}{" "}
                      {passedChecks.length === 1 ? "check" : "checks"}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {passedChecks.map((check) => (
                      <TechnicalCheckCard key={check.id} check={check} />
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold tracking-[0.14em] text-cyan-300 uppercase">
                        Implementation report
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-white">
                        Turn failed checks into a clear action list.
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        See why each signal matters, what to fix first, and the
                        implementation direction you can use for a launch or
                        client handoff.
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-expanded={showFullReport}
                      aria-controls="full-optimization-report"
                      onClick={() =>
                        setShowFullReport((currentValue) => !currentValue)
                      }
                      className="shrink-0 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15"
                    >
                      {showFullReport
                        ? "Hide implementation report"
                        : "View implementation report"}
                    </button>
                  </div>
                </section>

                {showFullReport && (
                  <section
                    id="full-optimization-report"
                    className="rounded-3xl border border-white/10 bg-slate-950/55 p-5 sm:p-7"
                  >
                    <div className="border-b border-white/5 pb-6">
                      <p className="font-mono text-xs tracking-[0.16em] text-lime-300 uppercase">
                        aioengine / recommendations
                      </p>

                      <h2 className="mt-3 text-2xl font-bold text-white">
                        Implementation report
                      </h2>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                        Recommendations are based on observable public signals.
                        They improve technical clarity and crawlability, but do
                        not guarantee mentions, rankings, or citations.
                      </p>
                    </div>

                    {prioritizedFailedChecks.length > 0 ? (
                      <div className="mt-7 space-y-4">
                        {prioritizedFailedChecks.map((check, index) => {
                          const guidance = getGuidance(check.id);

                          return (
                            <article
                              key={check.id}
                              className="rounded-2xl border border-white/5 bg-white/[0.018] p-5 sm:p-6"
                            >
                              <div className="flex flex-col gap-5 sm:flex-row">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] font-mono font-bold text-white">
                                  {String(index + 1).padStart(2, "0")}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-lg font-bold text-white">
                                      {check.label}
                                    </h3>

                                    <span
                                      className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${getPriorityClasses(
                                        guidance.priority,
                                      )}`}
                                    >
                                      {guidance.priority} priority
                                    </span>

                                    <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[11px] text-slate-500">
                                      +{check.weight} possible points
                                    </span>
                                  </div>

                                  <p className="mt-3 text-sm text-slate-600">
                                    Current result: {check.detail}
                                  </p>

                                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                                      <p className="text-xs font-bold tracking-wider text-slate-600 uppercase">
                                        Why it matters
                                      </p>

                                      <p className="mt-2 text-sm leading-6 text-slate-300">
                                        {guidance.whyItMatters}
                                      </p>
                                    </div>

                                    <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                                      <p className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
                                        Suggested implementation
                                      </p>

                                      <p className="mt-2 text-sm leading-6 text-slate-300">
                                        {guidance.recommendation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-7 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-6">
                        <h3 className="font-bold text-emerald-300">
                          All current checks passed.
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Continue monitoring these signals after deployments,
                          content migrations, framework updates, and domain
                          changes.
                        </p>
                      </div>
                    )}
                  </section>
                )}

                <p className="text-center font-mono text-[11px] text-slate-700">
                  Audit completed{" "}
                  {new Date(report.checkedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold tracking-[0.16em] text-cyan-300 uppercase">
              Built for technical work
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Useful evidence, not visibility theatre.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
              aioengine reports what it can verify from the public site and
              shows exactly how the score was calculated.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <span className="font-mono text-xs text-cyan-300">01</span>

              <h3 className="mt-4 text-lg font-bold text-white">
                Pre-launch QA
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Catch missing discovery files, structured data, and metadata
                before a new site or major update ships.
              </p>
            </article>

            <article className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <span className="font-mono text-xs text-cyan-300">02</span>

              <h3 className="mt-4 text-lg font-bold text-white">
                Client-ready reporting
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Give clients an understandable technical baseline without
                making promises about rankings or generated answers.
              </p>
            </article>

            <article className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <span className="font-mono text-xs text-cyan-300">03</span>

              <h3 className="mt-4 text-lg font-bold text-white">
                Repeatable monitoring
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Re-run the same checks after deployments and migrations to find
                regressions in public AI-readable infrastructure.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-white/5 bg-white/[0.018] px-6 py-8 sm:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-lime-300 uppercase">
                Straightforward by design
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                No black-box claims.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Every point corresponds to a visible technical check. aioengine
                does not claim that passing these checks guarantees AI traffic,
                rankings, mentions, or citations.
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-white/5 bg-black/20 px-5 py-4">
                <p className="text-xl font-bold text-white">8</p>
                <p className="text-xs text-slate-600">Visible checks</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/20 px-5 py-4">
                <p className="text-xl font-bold text-white">100</p>
                <p className="text-xs text-slate-600">Transparent points</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}