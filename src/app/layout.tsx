import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AISpendLens — Audit & Optimize Your AI Tool Spending",
  description:
    "Free AI spend audit for startups. Discover how much you're overspending on AI tools like Cursor, ChatGPT, Claude, GitHub Copilot, and more. Get instant savings recommendations.",
  keywords: [
    "AI spend audit",
    "AI tools optimization",
    "startup AI costs",
    "ChatGPT savings",
    "Claude pricing",
    "Cursor pricing",
    "GitHub Copilot alternatives",
    "SaaS spend management",
  ],
  authors: [{ name: "AISpendLens" }],
  openGraph: {
    title: "AISpendLens — Audit & Optimize Your AI Tool Spending",
    description:
      "Free AI spend audit for startups. Discover savings across your AI stack in 2 minutes.",
    url: "https://aispendlens.com",
    siteName: "AISpendLens",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AISpendLens — Audit Your AI Spend",
    description:
      "Free AI spend audit for startups. Discover savings across your AI stack.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ background: "#050505" }}
      >
        {children}
      </body>
    </html>
  );
}
