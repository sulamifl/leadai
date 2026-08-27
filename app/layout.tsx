// app/layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, logPageView } from "@/lib/analytics";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./provider";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  useEffect(() => {
    initGA();
    logPageView();
  }, []);

  useEffect(() => {
    logPageView();
  }, [pathname]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) =>
          console.error("Service worker registration failed:", err)
        );
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#800120" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LeadAI" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <title>LeadAI - Your AI assistant for IELTS preparation</title>
        <meta
          name="keywords"
          content="ielts, prep, preparation, hack, pass, exam, test, ai, hsk, smart, immigration, usa, china, eu, gre, sat, toefl, programming, code, migration, ент, егэ 高考，gaokao, bachelor, undergraduate, university, college"
        ></meta>
        <meta
          name="description"
          content="Unleash the potential of AI in IELTS, learn to correctly pass the listening, reading, writing and speaking sections, receive accurate assessments and recommendations from our AI"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
