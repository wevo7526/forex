"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import type { OverlayConfig } from "@/components/charts/CandlestickChart";
import { VolatilityChart } from "@/components/charts/VolatilityChart";
import { ErrorState } from "@/components/ui/Spinner";
import { useRates } from "@/store/ratesStore";
import { fetchHistorical, fetchSignals, fetchVolatility } from "@/lib/api";
import { computeRollingVolatility } from "@/lib/utils";
import type { OHLCV, TechnicalSignals, VolatilityData } from "@/types/forex";

const OVERLAY_OPTIONS: { key: keyof OverlayConfig; label: string; color: string }[] = [
  { key: "ema50", label: "EMA 50", color: "#3b82f6" },
  { key: "ema200", label: "EMA 200", color: "#f59e0b" },
  { key: "bollinger", label: "Bollinger", color: "#8b5cf6" },
  { key: "volume", label: "Volume", color: "#6b7280" },
];

const TIME_RANGES = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
] as const;

function SignalRow({ label, value, signal, bar }: { label: string; value: string; signal: string; bar?: { pct: number; color: string } }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 80, flexShrink: 0, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)", flex: 1 }}>{value}</span>
      {bar && (
        <div style={{ width: 60, height: 6, borderRadius: 3, background: "var(--bg-muted)", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ width: `${bar.pct}%`, height: "100%", borderRadius: 3, background: bar.color, transition: "width 0.3s ease" }} />
        </div>
      )}
      <SignalBadge signal={signal} />
    </div>
  );
}

export default function PairDetailPage() {
  const params = useParams();
  const slug = params.pair as string;
  const displayPair = slug.replace("-", "/");
  const { rates } = useRates();
  const liveRate = rates[displayPair];
  const decimals = displayPair.includes("JPY") ? 2 : 4;

  const [ohlcv, setOhlcv] = useState<OHLCV[]>([]);
  const [signals, setSignals] = useState<TechnicalSignals | null>(null);
  const [vol, setVol] = useState<VolatilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(90);
  const [overlays, setOverlays] = useState<OverlayConfig>({});

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - timeRange);
    const from = fromDate.toISOString().split("T")[0];

    Promise.all([
      fetchHistorical(displayPair, "daily", from),
      fetchSignals(displayPair),
      fetchVolatility(displayPair),
    ])
      .then(([h, s, v]) => { setOhlcv(h); setSignals(s); setVol(v); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [displayPair, timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute rolling volatility from OHLCV data
  const rollingVol = useMemo(() => computeRollingVolatility(ohlcv, 30), [ohlcv]);

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px",
    borderRadius: 6,
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent)" : "var(--bg-card)",
    color: active ? "#fff" : "var(--text-secondary)",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  });

  if (error && !loading) {
    return (
      <>
        <PageHeader title={displayPair} description="" />
        <ErrorState message={error} onRetry={loadData} />
      </>
    );
  }

  return (
    <div>
      <PageHeader title={displayPair} description="Historical data, technical signals, and volatility analysis" />
      <div style={{ padding: "0 32px 32px" }}>
        {/* Live Metrics */}
        <ErrorBoundary sectionName="Live Metrics">
          {liveRate ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              <MetricCard label="Rate" value={liveRate.rate.toFixed(decimals)} />
              <MetricCard label="Bid" value={liveRate.bid.toFixed(decimals)} />
              <MetricCard label="Offer" value={liveRate.offer.toFixed(decimals)} />
              <MetricCard label="Spread" value={(liveRate.spreadPct * 100).toFixed(3)} suffix="%" />
              <MetricCard label="24h Change" value={liveRate.change24hPct?.toFixed(2) ?? "N/A"} suffix="%" delta={liveRate.change24hPct} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              <SkeletonCard variant="metric" count={5} />
            </div>
          )}
        </ErrorBoundary>

        {/* Price Chart with Time Range */}
        <ErrorBoundary sectionName="Price Chart">
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Price Chart (Daily)</div>
              <div style={{ display: "flex", gap: 4 }}>
                {TIME_RANGES.map((tr) => (
                  <button
                    key={tr.label}
                    onClick={() => setTimeRange(tr.days)}
                    style={toggleBtnStyle(timeRange === tr.days)}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Overlay toggles */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {OVERLAY_OPTIONS.map((opt) => {
                const active = !!overlays[opt.key];
                return (
                  <button
                    key={opt.key}
                    onClick={() => setOverlays((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 4,
                      border: `1px solid ${active ? opt.color : "var(--border)"}`,
                      background: active ? `${opt.color}14` : "transparent",
                      color: active ? opt.color : "var(--text-muted)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: opt.color, opacity: active ? 1 : 0.3 }} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {loading ? (
              <SkeletonCard variant="chart" />
            ) : ohlcv.length > 0 ? (
              <CandlestickChart data={ohlcv} overlays={overlays} />
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 13, padding: 40, textAlign: "center" }}>No historical data available</div>
            )}
          </div>
        </ErrorBoundary>

        {/* Rolling Volatility Chart */}
        {rollingVol.length > 0 && (
          <ErrorBoundary sectionName="Volatility Chart">
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Rolling 30-Day Volatility</div>
              <VolatilityChart data={rollingVol} height={200} />
            </div>
          </ErrorBoundary>
        )}

        {/* Signals + Volatility Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
          <ErrorBoundary sectionName="Technical Signals">
            {loading ? (
              <SkeletonCard variant="chart" />
            ) : signals ? (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Technical Signals</span>
                  <SignalBadge signal={signals.overallSignal} size="md" />
                </div>
                <SignalRow
                  label="RSI"
                  value={signals.rsi.toFixed(1)}
                  signal={signals.rsiSignal}
                  bar={{ pct: signals.rsi, color: signals.rsi > 70 ? "var(--negative)" : signals.rsi < 30 ? "var(--positive)" : "var(--accent)" }}
                />
                <SignalRow
                  label="MACD"
                  value={`${signals.macd.toFixed(5)} / ${signals.macdSignalLine.toFixed(5)}`}
                  signal={signals.macdCrossover}
                />
                <SignalRow
                  label="EMA"
                  value={`${signals.ema50.toFixed(4)} / ${signals.ema200.toFixed(4)}`}
                  signal={signals.emaSignal}
                />
                <SignalRow
                  label="Bollinger"
                  value={`${signals.bollingerUpper.toFixed(4)} / ${signals.bollingerLower.toFixed(4)}`}
                  signal={signals.bollingerSignal}
                />
              </div>
            ) : null}
          </ErrorBoundary>
          <ErrorBoundary sectionName="Volatility">
            {loading ? (
              <SkeletonCard variant="chart" />
            ) : vol ? (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Volatility</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <MetricCard label="30-Day Vol" value={(vol.volatility30d * 100).toFixed(3)} suffix="%" />
                  <MetricCard label="Annualized" value={(vol.volatilityAnnualized * 100).toFixed(2)} suffix="%" />
                </div>
              </div>
            ) : null}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
