"use client";

import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-emerald-300">$</span>
        <code className="block min-w-0 overflow-x-auto whitespace-nowrap text-sm text-cyan-100">
          {command}
        </code>
      </div>

      <button
        type="button"
        onClick={copyCommand}
        className="shrink-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}