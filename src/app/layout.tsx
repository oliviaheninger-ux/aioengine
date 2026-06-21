import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/siteconfig";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: "aioengine — Technical AI-readiness audits",
    template: "%s | aioengine",
  },

  description:
    "Audit the public technical signals that help AI systems discover and interpret websites, including crawler access, sitemaps, structured data, metadata, and AI-readable context files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-200 antialiased selection:bg-cyan-300/20 selection:text-cyan-100">
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0b0f19]/85 backdrop-blur-xl">
          <nav
            aria-label="Main navigation"
            className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-6"
          >
            <Link
              href="/"
              aria-label="aioengine home"
              className="flex items-center transition-opacity hover:opacity-90"
            >
              <Image
                src="/aioengine-logo.png"
                alt="aioengine"
                width={420}
                height={120}
                priority
                className="h-12 w-auto object-contain sm:h-14"
              />
            </Link>

            <div className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/#how-it-works"
                className="hidden text-sm font-medium text-slate-400 transition hover:text-white sm:inline"
              >
                How it works
              </Link>

              <Link
                href="/#audit"
                className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.12]"
              >
                Run an audit
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/[0.06] bg-[#090d16]">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <Image
                src="/aioengine-logo.png"
                alt="aioengine"
                width={240}
                height={70}
                className="h-7 w-auto object-contain opacity-70"
              />
            </div>

            <p className="max-w-xl text-xs leading-5 text-slate-600 sm:text-right">
              Technical audit results describe observable public signals and do
              not guarantee AI rankings, mentions, traffic, or citations.
            </p>
          </div>

          <div className="border-t border-white/[0.04]">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>
                © {new Date().getFullYear()} {siteConfig.name}
              </p>

              <p>{siteConfig.contact.email}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}