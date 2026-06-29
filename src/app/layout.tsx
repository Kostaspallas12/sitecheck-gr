import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SiteAuditor — Ανάλυση & Ευπάθειες Website",
  description: "Ανακάλυψε τις αδυναμίες του site σου: Security, SEO, Performance, Accessibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-4">
            <span>© {new Date().getFullYear()} SiteCheck</span>
            <a href="/privacy" className="hover:text-slate-300 transition">Πολιτική Απορρήτου</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
