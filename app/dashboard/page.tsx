"use client";

import { useRates } from "@/store/ratesStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SparklineChart } from "@/components/charts/SparklineChart";
import { CurrencyHeatMap } from "@/components/dashboard/CurrencyHeatMap";
import { generateSparklineData } from "@/lib/utils";
import type { LiveRate } from "@/types/forex";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchInsight } from "@/lib/agent-api";
import { PairSelector } from "@/components/ui/PairSelector";
import type { InsightResponse } from "@/types/agent";

function RateCard({ rate }: { rate: LiveRate }) {
  const decimals = rate.pair.includes("JPY") || rate.pair.includes("MXN") || rate.pair.includes("BRL") ? 2 : 4;
  const sparkData = generateSparklineData(rate.rate, rate.change24hPct);
  const positive = (rate.change24hPct ?? 0) >= 0;

  return (
    <Link href={`/dashboard/${rate.pair.replace("/", "-")}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8,
        padding: "16px 20px", cursor: "pointer", transition: "border-color 0.15s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{rate.pair}</span>
          {rate.change24hPct != null && (
            <span style={{ fontSize: 12, fontWeight: 600, color: positive ? "var(--positive)" : "var(--negative)" }}>
              {positive ? "+" : ""}{rate.change24hPct.toFixed(2)}%
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "var(--font-geist-mono)" }}>
            {rate.rate.toFixed(decimals)}
          </div>
          <SparklineChart data={sparkData} positive={positive} width={80} height={28} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
          <span>Bid: {rate.bid.toFixed(decimals)}</span>
          <span>Ask: {rate.offer.toFixed(decimals)}</span>
          <span>Spd: {(rate.spreadPct * 100).toFixed(2)}%</span>
        </div>
      </div>
    </Link>
  );
}

function CrossRateMatrix({ rates }: { rates: Record<string, LiveRate> }) {
  const currencies = ["EUR", "GBP", "USD", "JPY", "CHF", "CAD", "AUD"];

  function getRate(base: string, quote: string): number | null {
    if (base === quote) return 1;
    const direct = rates[`${base}/${quote}`];
    if (direct) return direct.rate;
    const inverse = rates[`${quote}/${base}`];
    if (inverse) return 1 / inverse.rate;
    const baseUsd = rates[`${base}/USD`]?.rate ?? (rates[`USD/${base}`] ? 1 / rates[`USD/${base}`].rate : null);
    const quoteUsd = rates[`${quote}/USD`]?.rate ?? (rates[`USD/${quote}`] ? 1 / rates[`USD/${quote}`].rate : null);
    if (baseUsd && quoteUsd) return baseUsd / quoteUsd;
    return null;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-geist-mono)" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-geist-sans)", fontSize: 11, color: "var(--text-muted)" }}></th>
            {currencies.map((c) => (
              <th key={c} style={{ padding: "8px 10px", textAlign: "right", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-geist-sans)", fontSize: 11, color: "var(--text-muted)" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currencies.map((base) => (
            <tr key={base}>
              <td style={{ padding: "8px 10px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-geist-sans)", fontSize: 11, color: "var(--text-muted)" }}>{base}</td>
              {currencies.map((quote) => {
                const r = getRate(base, quote);
                return (
                  <td key={quote} style={{
                    padding: "8px 10px", textAlign: "right", borderBottom: "1px solid var(--border-subtle)",
                    color: base === quote ? "var(--text-muted)" : "var(--text-primary)",
                    background: base === quote ? "var(--bg-muted)" : undefined,
                  }}>
                    {r != null ? (r === 1 ? "—" : r.toFixed(4)) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsightWidget() {
  const [pair, setPair] = useState("EUR/USD");
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchInsight(pair).then(setInsight).catch(() => setInsight(null)).finally(() => setLoading(false));
  }, [pair]);

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>AI Insight</span>
        <PairSelector value={pair} onChange={setPair} />
      </div>
      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13, animation: "pulse 1.5s ease-in-out infinite" }}>Loading insight...</div>
      ) : insight ? (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <SignalBadge signal={insight.signal} size="md" />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Technical: </span>
            <SignalBadge signal={insight.technicalSignal} />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", margin: 0 }}>{insight.summary}</p>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
            Spot: {insight.spotRate.toFixed(4)} · Spread: {(insight.spreadPct * 100).toFixed(2)}%
          </div>
        </div>
      ) : (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Insight unavailable — ensure backend is running</div>
      )}
      <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)" }}>
        Use the floating AI Agent widget (bottom-right) for full analysis
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { rates, connectionStatus } = useRates();
  const rateList = Object.values(rates);
  const hasRates = rateList.length > 0;

  return (
    <div>
      <PageHeader title="Live Dashboard" description="Real-time forex rates and market overview" />
      <div style={{ padding: "0 32px 32px" }}>
        {/* Rate Cards Grid */}
        <ErrorBoundary sectionName="Rate Cards">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginBottom: 24 }}>
            {hasRates
              ? rateList.map((r) => <RateCard key={r.pair} rate={r} />)
              : (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                    <SkeletonCard variant="rate" count={6} />
                  </div>
                  {connectionStatus !== "connected" && (
                    <div style={{ textAlign: "center", padding: 12, fontSize: 12, color: "var(--text-muted)" }}>
                      {connectionStatus === "reconnecting" ? "Reconnecting to rate stream..." : "Connecting..."}
                    </div>
                  )}
                </div>
              )
            }
          </div>
        </ErrorBoundary>

        {/* Currency Heat Map */}
        <ErrorBoundary sectionName="Currency Strength">
          <div style={{ marginBottom: 24 }}>
            <CurrencyHeatMap />
          </div>
        </ErrorBoundary>

        {/* Bottom Grid: Cross Rate Matrix + Insight */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <ErrorBoundary sectionName="Cross Rate Matrix">
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Cross Rate Matrix</div>
              <CrossRateMatrix rates={rates} />
            </div>
          </ErrorBoundary>
          <ErrorBoundary sectionName="AI Insight">
            <InsightWidget />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
