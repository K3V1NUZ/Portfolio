import type { Metadata } from "next";
import { Barlow_Condensed, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

// latin-ext is needed for Slovak characters like ľ, ž
const head = Barlow_Condensed({ subsets: ["latin", "latin-ext"], weight: ["700", "800"], variable: "--font-head" });
const text = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-text" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Daniel Keves — Portfolio",
  description: "Computer Science student at FIIT STU in Bratislava. Projects, experience and tech stack.",
};

// Runs before paint so the saved / system theme never flashes
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${head.variable} ${text.variable} ${mono.variable}`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
