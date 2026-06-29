import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SiteCheck — Ανάλυση Website",
  description: "Ανακάλυψε τις αδυναμίες του site σου: Security, SEO, Performance, Accessibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className="h-full antialiased">
      <body className={`${sans.className} min-h-full flex flex-col bg-slate-950 text-slate-100`}>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-800/60 py-5 text-center text-xs text-slate-600">
          <div className="flex items-center justify-center gap-6">
            <span>© {new Date().getFullYear()} SiteCheck</span>
            <a href="/privacy" className="hover:text-slate-400 transition">Πολιτική Απορρήτου</a>
          </div>
        </footer>
      </body>
    </html>
  );
}