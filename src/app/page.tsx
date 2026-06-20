"use client";

import { useState } from "react";
import { auditTargetSite, type AuditResult } from "../lib/grader-engine";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const auditData = await auditTargetSite(url);
      setResult(auditData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Is Your Website Invisible to AI?
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Analyze your site’s architecture to ensure modern AI search engines can discover, crawl, and rank your business.
          </p>
        </div>

        <form onSubmit={handleAudit} className="flex gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xl">
          <input
            type="text"
            placeholder="enter client domain (e.g., mysite.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-3 rounded-lg font-semibold text-sm min-w-[100px] disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {result && (
          <div className="text-left bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Audit Report</h3>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">{result.url}</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">Score</span>
                <span className={`text-3xl font-black ${result.score > 70 ? 'text-emerald-400' : result.score > 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                  {result.score}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">AI Context Directives (/llms.txt)</h4>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${result.hasLlmstxt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {result.hasLlmstxt ? "PASSED" : "MISSING"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Discovery Protocols (robots.txt)</h4>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${result.hasRobots ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {result.hasRobots ? "PASSED" : "MISSING"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Structured Response Headers</h4>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${result.hasAiHeaders ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {result.hasAiHeaders ? "PASSED" : "MISSING"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}