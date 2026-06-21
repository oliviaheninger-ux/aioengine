"use client";

import { useState } from "react";
import { siteConfig } from "@/siteconfig";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Bring back the logic!
  const runDiagnostic = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      if (result.success) {
        setReport(result.data);
      }
    } catch (error) {
      console.error("Audit failed:", error);
      alert("Failed to run audit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pt-12 pb-20 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter text-white">AI Optimization Engine</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Audit your site’s visibility to AI agents. Get the infrastructure you need to be discoverable in the new search era.
          </p>
        </div>

        <section className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex gap-4">
            <input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-white focus:border-emerald-500 outline-none"
            />
            <button 
              onClick={runDiagnostic}
              disabled={loading}
              className="bg-emerald-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors"
            >
              {loading ? "ANALYZING..." : "AUDIT SITE"}
            </button>
          </div>

          {report && (
            <div className="mt-10 p-6 bg-black/20 rounded-2xl border border-white/5 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h2 className="text-xl font-bold">Audit Results</h2>
                <span className="text-3xl font-black text-emerald-400">{report.score}%</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">/llms.txt</p>
                  <p className={report.llmsTxt ? "text-emerald-400" : "text-rose-400"}>
                    {report.llmsTxt ? "Ready" : "Missing"}
                  </p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Schema</p>
                  <p className={report.schema ? "text-emerald-400" : "text-rose-400"}>
                    {report.schema ? "Active" : "Not Found"}
                  </p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Bot Auth</p>
                  <p className={report.robotsTxt ? "text-emerald-400" : "text-amber-400"}>
                    {report.robotsTxt ? "Configured" : "Warning"}
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