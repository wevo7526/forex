import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { RatesProvider } from "@/store/ratesStore";
import { AgentProvider } from "@/store/agentStore";
import { RateStreamProvider } from "@/components/layout/RateStreamProvider";
import { AgentWidget } from "@/components/agent/AgentWidget";
import { FXTicker } from "@/components/dashboard/FXTicker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FX Intelligence Platform",
  description:
    "Professional forex analysis, hedging strategies, and AI-powered recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <RatesProvider>
          <AgentProvider>
            <RateStreamProvider>
              <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                <Sidebar />
                <main
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    background: "var(--bg-page)",
                  }}
                >
                  <FXTicker />
                  {children}
                </main>
              </div>
              <AgentWidget />
            </RateStreamProvider>
          </AgentProvider>
        </RatesProvider>
      </body>
    </html>
  );
}
