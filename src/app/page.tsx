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
  robotsTxt: boolean;
  llmsTxt: boolean;
  schema: boolean;
};

type AuditResponse = {
  success: boolean;
  data?: AuditReport;
  error?: string;
};

function getScoreLabel(score: number) {
  if (score >= 85) return "AI ready";
  if (score >= 65) return "Good foundation";
  if (score >= 40) return "Needs improvement";
  return "Poor visibility";
}

function getScoreClasses(score: number) {
  if (score >= 85) {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (score >= 65) {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";
  }

  if (score >= 40) {
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }

  return "border-rose-400/30 bg-rose-400/10 text-rose-300";
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const runDiagnostic = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setErrorMessage("Enter a website URL first.");
      return;
    }

    setLoading(true);
    setReport(null);
    setErrorMessage("");

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
          : "Failed to run the audit. Check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const passedChecks =
    report?.checks.filter((check) => check.passed).length ?? 0;

  return (
    <div className="relative overflow-hidden px-5 pt-14 pb-24 sm:px-6">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[350px] w-[700px] max-w-full -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />

      <div className="pointer-events-none absolute top-32 right-0 h-[300px] w-[300px] rounded-full bg-lime-400/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mx-auto mb-14 max-w-3xl space-y-5 text-center">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">
            Free AI readiness audit
          </div>

          <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
            See how visible your website is to AI.
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Check the technical signals that help AI crawlers discover,
            understand, and confidently use your website&apos;s information.
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl sm:p-8">
          <form
            onSubmit={(event) => void runDiagnostic(event)}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <label htmlFor="website-url" className="sr-only">
              Website URL
            </label>

            <input
              id="website-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="yourwebsite.com"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
            />

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-lime-300 px-8 py-4 font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Audit website"}
            </button>
          </form>

          {errorMessage && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
            >
              {errorMessage}
            </p>
          )}

          {loading && (
            <div
              role="status"
              className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-black/20 px-6 py-10 text-slate-400"
            >
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
              Inspecting website infrastructure…
            </div>
          )}

          {report && (
            <div className="mt-10 space-y-8" aria-live="polite">
              <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border p-8 text-center ${getScoreClasses(
                    report.score,
                  )}`}
                >
                  <span className="text-sm font-semibold tracking-wider uppercase">
                    AI readiness score
                  </span>

                  <span className="mt-3 text-6xl font-black tracking-tighter">
                    {report.score}
                  </span>

                  <span className="text-sm opacity-70">out of 100</span>

                  <span className="mt-5 rounded-full border border-current/20 px-3 py-1 text-xs font-bold uppercase">
                    {getScoreLabel(report.score)}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-6">
                  <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                        Audited website
                      </p>

                      <p className="mt-1 break-all font-medium text-white">
                        {report.checkedUrl}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold text-white">
                        {passedChecks}/{report.checks.length}
                      </p>

                      <p className="text-sm text-slate-500">checks passed</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-slate-500">
                      <span>Overall readiness</span>
                      <span>{report.score}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-lime-300 transition-all duration-700"
                        style={{ width: `${report.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-cyan-300 uppercase">
                      Technical analysis
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-white">
                      Audit results
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {report.checks.map((check) => (
                    <article
                      key={check.id}
                      className="rounded-2xl border border-white/5 bg-slate-950/50 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black ${
                            check.passed
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                              : "border-rose-400/30 bg-rose-400/10 text-rose-300"
                          }`}
                        >
                          {check.passed ? "✓" : "×"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold text-white">
                              {check.label}
                            </h3>

                            <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-400">
                              {check.weight} pts
                            </span>
                          </div>

                          <p className="mt-2 break-words text-sm leading-6 text-slate-400">
                            {check.detail}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-6">
                <h2 className="text-lg font-bold text-white">
                  Your next optimization step
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  aioengine will turn failed checks into clear implementation
                  instructions and automatically maintain AI-readable context as
                  your website changes.
                </p>

                <button
                  type="button"
                  className="mt-5 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-300/15"
                >
                  Get the full optimization report
                </button>
              </div>

              <p className="text-center text-xs text-slate-600">
                Audit completed{" "}
                {new Date(report.checkedAt).toLocaleString()}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}