import { Logo } from "@/components/Logo";

const issuesUrl = "https://github.com/oliviaheninger-ux/aioengine/issues";
const repoUrl = "https://github.com/oliviaheninger-ux/aioengine";
const npmUrl = "https://www.npmjs.com/package/aioengine";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#061211] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#061211]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex min-w-0 items-center">
            <Logo className="h-10 w-auto sm:h-12" />
          </a>

          <a
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white/30 hover:bg-white/10"
          >
            Back home
          </a>
        </div>
      </header>

      <section className="relative z-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-sm font-semibold text-cyan-200">
            Privacy, terms, and support
          </p>

          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Legal notes for aioengine.
          </h1>

          <p className="mt-5 max-w-3xl text-pretty leading-7 text-white/65">
            aioengine is an early developer tool for AI-assisted coding
            workflows. The public CLI is designed to run in your repo and
            produce local or CI reports without requiring an account.
          </p>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <LegalCard title="Privacy policy">
              <p className="text-xs text-white/40">Last updated: July 2026</p>

              <p>
                The public aioengine CLI does not require an account and does
                not intentionally collect your source code, secrets, or repo
                contents.
              </p>

              <p>
                CLI output and reports are generated locally or inside your
                GitHub Actions environment. If you open an issue on GitHub,
                anything you post there is public.
              </p>

              <p>
                This website may store a small local preference so the cookie
                notice does not keep appearing. No analytics cookies are
                required to use the site.
              </p>
            </LegalCard>

            <LegalCard title="Terms and conditions">
              <p className="text-xs text-white/40">Last updated: July 2026</p>

              <p>
                aioengine is provided as-is as an early developer tool. It may
                contain bugs, false positives, missed warnings, or incomplete
                checks.
              </p>

              <p>
                You are responsible for reviewing your own code, testing your
                changes, protecting secrets, and deciding what to commit or
                merge.
              </p>

              <p>
                aioengine does not guarantee that code is safe, secure,
                compliant, correct, or production-ready. Use it as an
                additional review signal, not as a replacement for engineering
                judgment.
              </p>
            </LegalCard>

            <LegalCard title="Support and feedback">
              <p>
                Found a bug, confusing output, false positive, or missing
                feature? Open a GitHub Issue so it can be tracked publicly.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href={issuesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
                >
                  Open a support issue
                </a>

                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10"
                >
                  View GitHub repo
                </a>

                <a
                  href={npmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10"
                >
                  View npm package
                </a>
              </div>

              <p className="text-xs leading-5 text-white/45">
                Helpful feedback includes your AI coding tool, what command you
                ran, what was confusing, and whether the scope result felt
                correct.
              </p>
            </LegalCard>
          </div>
        </div>
      </section>
    </main>
  );
}

function LegalCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#071b19] p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
        {children}
      </div>
    </div>
  );
}