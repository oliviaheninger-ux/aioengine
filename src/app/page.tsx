"use client";

import { useState } from "react";

type Field = {
  name: string;
  type: string;
  required: boolean;
  risks: string[];
};

type Issue = {
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
  suggestion: string;
};

type Report = {
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  summary: string;
  fields: Field[];
  issues: Issue[];
  generated: {
    zodSchema: string;
    actionManifest: string;
    routeHandler: string;
    testIdeas: string[];
  };
};

const sampleForm = `<form action="/contact" method="POST">
  <input name="name" type="text" required placeholder="Your name" />
  <input name="email" type="email" required placeholder="Email address" />
  <textarea name="message" required placeholder="How can we help?"></textarea>
  <button type="submit">Send message</button>
</form>`;

const riskyForm = `<form action="/checkout" method="POST">
  <input name="fullName" type="text" required placeholder="Full name" />
  <input name="email" type="email" required placeholder="Email address" />
  <input name="creditCard" type="text" required placeholder="Credit card number" />
  <input name="cvv" type="password" required placeholder="CVV" />
  <input name="billingAddress" type="text" required placeholder="Billing address" />
  <input name="medicalNotes" type="text" placeholder="Medical notes or accessibility needs" />
  <input name="attachment" type="file" />
  <button type="submit">Pay now</button>
</form>`;

function riskLabelClasses(risk: Report["riskLevel"]) {
  if (risk === "high") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (risk === "medium") {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-100";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
}

function CodeCard({
  title,
  value,
  copied,
  onCopy,
}: {
  title: string;
  value: string;
  copied: string | null;
  onCopy: (title: string, value: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold">{title}</h3>

        <button
          onClick={() => onCopy(title, value)}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
        >
          {copied === title ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl bg-slate-900 p-4 text-xs leading-5 text-slate-300">
        {value}
      </pre>
    </div>
  );
}

function ReportMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

export default function Home() {
  const [source, setSource] = useState(sampleForm);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function copyToClipboard(title: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(title);

      window.setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function downloadReport() {
    if (!report) return;

    const reportJson = JSON.stringify(report, null, 2);
    const blob = new Blob([reportJson], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `aioengine-form-report-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  async function analyze() {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch("/api/analyze-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-cyan-500/5">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            aioengine Forms
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                Turn website forms into safe AI-agent actions.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Paste a form. aioengine detects fields, flags risk, and
                generates developer-ready validation, action manifests, route
                handlers, and test ideas.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-6 text-cyan-50">
              <p className="font-semibold">MVP goal</p>
              <p className="mt-2 text-cyan-100/90">
                This first version uses deterministic safety rules. Later, we
                add OpenAI analysis, saved reports, paid exports, and Vercel
                deployment checks.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Paste form code</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Try a contact form, quote form, booking form, or signup form.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSource(sampleForm);
                    setReport(null);
                    setError("");
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                  Safe sample
                </button>

                <button
                  onClick={() => {
                    setSource(riskyForm);
                    setReport(null);
                    setError("");
                  }}
                  className="rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-100 hover:bg-red-400/20"
                >
                  Risky sample
                </button>
              </div>
            </div>

            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="mt-5 h-[420px] w-full rounded-2xl border border-white/10 bg-slate-900 p-4 font-mono text-sm leading-6 text-slate-100 outline-none ring-cyan-400/20 placeholder:text-slate-600 focus:ring-4"
              spellCheck={false}
            />

            <button
              onClick={analyze}
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze form"}
            </button>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Report</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your safety and agent-readiness output appears here.
                </p>
              </div>

              {report ? (
                <button
                  onClick={downloadReport}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  Download report
                </button>
              ) : null}
            </div>

            {!report ? (
              <div className="mt-5 flex h-[500px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-8 text-center text-slate-500">
                Paste a form and click Analyze.
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div
                  className={`rounded-2xl border p-5 ${riskLabelClasses(
                    report.riskLevel
                  )}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm uppercase tracking-[0.25em]">
                      {report.riskLevel} risk
                    </p>
                    <p className="text-sm">
                      Confidence: {Math.round(report.confidence * 100)}%
                    </p>
                  </div>
                  <p className="mt-3 text-lg font-semibold">
                    {report.summary}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <ReportMetric
                    label="Fields"
                    value={String(report.fields.length)}
                    detail="Detected inputs"
                  />

                  <ReportMetric
                    label="Issues"
                    value={String(report.issues.length)}
                    detail="Safety concerns"
                  />

                  <ReportMetric
                    label="Agent status"
                    value={report.riskLevel === "low" ? "Ready" : "Review"}
                    detail={
                      report.riskLevel === "low"
                        ? "Safe with validation"
                        : "Confirm before action"
                    }
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <h3 className="font-semibold">Detected fields</h3>

                  <div className="mt-4 space-y-3">
                    {report.fields.map((field) => (
                      <div
                        key={`${field.name}-${field.type}`}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-cyan-200">
                            {field.name}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                            {field.type}
                          </span>
                          {field.required ? (
                            <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-100">
                              required
                            </span>
                          ) : null}
                        </div>

                        {field.risks.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {field.risks.map((risk) => (
                              <span
                                key={risk}
                                className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-xs text-yellow-100"
                              >
                                {risk}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">
                            No obvious sensitive field risk detected.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                  <h3 className="font-semibold">Issues</h3>

                  {report.issues.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">
                      No major issues detected.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {report.issues.map((issue) => (
                        <div
                          key={issue.title}
                          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                            {issue.severity}
                          </p>
                          <p className="mt-2 font-semibold">{issue.title}</p>
                          <p className="mt-2 text-sm text-slate-300">
                            {issue.detail}
                          </p>
                          <p className="mt-2 text-sm text-cyan-200">
                            {issue.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {report ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <CodeCard
              title="Generated Zod schema"
              value={report.generated.zodSchema}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <CodeCard
              title="AI action manifest"
              value={report.generated.actionManifest}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <CodeCard
              title="Route handler"
              value={report.generated.routeHandler}
              copied={copied}
              onCopy={copyToClipboard}
            />

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">Test ideas</h3>

                <button
                  onClick={() =>
                    copyToClipboard(
                      "Test ideas",
                      report.generated.testIdeas
                        .map((idea, index) => `${index + 1}. ${idea}`)
                        .join("\n")
                    )
                  }
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                >
                  {copied === "Test ideas" ? "Copied!" : "Copy"}
                </button>
              </div>

              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {report.generated.testIdeas.map((idea) => (
                  <li
                    key={idea}
                    className="rounded-xl border border-white/10 bg-slate-900 p-3"
                  >
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}