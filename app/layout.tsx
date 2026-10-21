// app/layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, logPageView } from "@/lib/analytics";
import { initNative } from "@/lib/capacitor";
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

  useEffect(() => {
    // Инициализация нативных плагинов Capacitor (push, статус-бар, сплэш, кнопка "назад").
    initNative();
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
        {/*
          EduOS shell (P1-7). Конфиг — отдельный файл и всегда первым: шелл
          читает window.EUOS_SHELL_CONFIG до авто-монтирования шапки. Оба файла
          лежат в public/euos/ и отдаются по /euos/…, поэтому политика
          script-src 'self' их не ломает.
        */}
        <script src="/euos/euos-shell-config.js" />
        <script src="/euos/euos-shell.js" defer />
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
