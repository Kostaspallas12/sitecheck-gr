import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import type { Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n";
import { LangProvider } from "@/components/LangProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CookieBanner } from "@/components/CookieBanner";

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SiteCheck — Website Audit",
  description: "Discover your website weaknesses: Security, SEO, Performance, Accessibility.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = ((await cookies()).get("lang")?.value ?? "en") as Lang;
  const t = getT(lang);

  return (
    <html lang={lang} className="h-full antialiased">
      <body className={`${sans.className} min-h-full flex flex-col bg-slate-950 text-slate-100`}>
        <LangProvider lang={lang}>
          <header className="border-b border-slate-800/60 px-6 py-3.5 shrink-0">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <a href="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="4.5" stroke="white" strokeWidth="1.5"/>
                    <path d="M6.5 4v2.5l1.5 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-bold text-white text-sm tracking-tight">SiteCheck</span>
              </a>
              <LanguageToggle />
            </div>
          </header>
          <div className="flex-1">{children}</div>
          <CookieBanner />
          <footer className="border-t border-slate-800/60 py-5 text-center text-xs text-slate-600">
            <div className="flex items-center justify-center gap-6">
              <span>© {new Date().getFullYear()} SiteCheck</span>
              <a href="/privacy" className="hover:text-slate-400 transition">{t.privacyLink}</a>
            </div>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}