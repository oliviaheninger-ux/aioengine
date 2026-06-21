"use client";

import { useState } from "react";

type AuditReport = {
  score: number;
  robotsTxt: boolean;
  llmsTxt: boolean;
  schema: boolean;
};

type AuditResponse = {
  success: boolean;
  data?: AuditReport;
  error?: string;
};

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const runDiagnostic = async () => {
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

  return (
    <div className="relative px-6 pt-12 pb-20">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[600px] max-w-full -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-16 space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl">
            AI Optimization Engine
          </h1>

          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Audit your site&apos;s visibility to AI agents. Get the
            infrastructure you need to be discoverable in the new search era.
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void runDiagnostic();
                }
              }}
              placeholder="https://your-site.com"
              aria-label="Website URL"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-5 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-500"
            />

            <button
              type="button"
              onClick={() => void runDiagnostic()}
              disabled={loading || !url.trim()}
              className="rounded-xl bg-emerald-500 px-8 py-3 font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "ANALYZING..." : "AUDIT SITE"}
            </button>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
            >
              {errorMessage}
            </p>
          )}

          {report && (
            <div
              className="mt-10 space-y-6 rounded-2xl border border-white/5 bg-black/20 p-6"
              aria-live="polite"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-xl font-bold text-white">Audit Results</h2>

                <span className="text-3xl font-black text-emerald-400">
                  {report.score}%
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-slate-950/50 p-4">
                  <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    /llms.txt
                  </p>

                  <p
                    className={
                      report.llmsTxt ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {report.llmsTxt ? "Ready" : "Missing"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-950/50 p-4">
                  <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Schema
                  </p>

                  <p
                    className={
                      report.schema ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {report.schema ? "Active" : "Not Found"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-slate-950/50 p-4">
                  <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Robots.txt
                  </p>

                  <p
                    className={
                      report.robotsTxt ? "text-emerald-400" : "text-amber-400"
                    }
                  >
                    {report.robotsTxt ? "Detected" : "Warning"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}