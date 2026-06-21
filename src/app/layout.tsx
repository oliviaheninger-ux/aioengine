import type { Metadata } from "next";
import { siteConfig } from "@/siteconfig";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200 antialiased min-h-screen flex flex-col">
        {/* Persistent Header */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
            <span className="font-bold text-xl tracking-tight text-white">{siteConfig.name.toUpperCase()}</span>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">Docs</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Persistent Footer */}
        <footer className="border-t border-white/5 bg-slate-950 mt-12">
          <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-slate-500">
            © {new Date().getFullYear()} {siteConfig.name} | {siteConfig.contact.email}
          </div>
        </footer>
      </body>
    </html>
  );
}