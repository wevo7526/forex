"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { fetchForecast, fetchSignals } from "@/lib/api";
import { MAJOR_PAIRS, pairToString, pairToSlug } from "@/types/forex";
import type { ForecastResult, TechnicalSignals, ForecastMetrics } from "@/types/forex";

export default function PredictionsPage() {
  const [pair, setPair] = useState("EUR/USD");
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [signals, setSignals] = useState<TechnicalSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (p: string) => {
    setLoading(true);
    setError(null);
    try {
      const [fc, sig] = await Promise.all([
        fetchForecast(p, "ensemble", 7),
        fetchSignals(p),
      ]);
      setForecast(fc);
      setSignals(sig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(pair);
  }, [pair, loadData]);

  const handlePairChange = (newPair: string) => {
    setPair(newPair);
  };

  // Extract simple metrics (handle both ForecastMetrics and EnsembleMetrics)
  function getMetrics(fc: ForecastResult): ForecastMetrics {
    const m = fc.metrics;
    if ("rmse" in m && typeof m.rmse === "number") {
      return m as ForecastMetrics;
    }
    // EnsembleMetrics -- show the ensemble-level nn metrics as a fallback,
    // but really ensemble metrics have sub-model keys
    const ens = m as { nn: ForecastMetrics; arima: ForecastMetrics; seasonal: ForecastMetrics };
    // Average the sub-model metrics for the overview
    const models = [ens.nn, ens.arima, ens.seasonal];
    return {
      rmse: models.reduce((s, x) => s + x.rmse, 0) / models.length,
      mae: models.reduce((s, x) => s + x.mae, 0) / models.length,
      directionalAccuracy: models.reduce((s, x) => s + x.directionalAccuracy, 0) / models.length,
    };
  }

  const sectionStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 24,
  };

  return (
    <div>
      <PageHeader
        title="Predictive Models"
        description="LSTM, ARIMA, Seasonal, and ensemble forecasts with technical signals"
      >
        <PairSelector value={pair} onChange={handlePairChange} />
      </PageHeader>

      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        {loading && <LoadingState message={`Loading forecast for ${pair}...`} />}
        {error && <ErrorState message={error} onRetry={() => loadData(pair)} />}

        {!loading && !error && forecast && signals && (
          <>
            {/* Forecast Chart */}
            <div style={sectionStyle}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                Ensemble Forecast — {pair} (7-day)
              </h2>
              <ForecastChart forecast={forecast.forecast} modelType={forecast.modelType} height={380} />
            </div>

            {/* Metrics Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {(() => {
                const m = getMetrics(forecast);
                return (
                  <>
                    <MetricCard label="RMSE" value={m.rmse.toFixed(5)} />
                    <MetricCard label="MAE" value={m.mae.toFixed(5)} />
                    <MetricCard label="Directional Accuracy" value={`${(m.directionalAccuracy * 100).toFixed(1)}`} suffix="%" />
                  </>
                );
              })()}
            </div>

            {/* Technical Signals Summary */}
            <div style={sectionStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  Technical Signals — {pair}
                </h2>
                <SignalBadge signal={signals.overallSignal} size="md" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                <div style={{ padding: 12, background: "var(--bg-muted)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>RSI ({signals.rsi.toFixed(1)})</div>
                  <SignalBadge signal={signals.rsiSignal} />
                </div>
                <div style={{ padding: 12, background: "var(--bg-muted)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>MACD</div>
                  <SignalBadge signal={signals.macdCrossover} />
                </div>
                <div style={{ padding: 12, background: "var(--bg-muted)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>EMA</div>
                  <SignalBadge signal={signals.emaSignal} />
                </div>
                <div style={{ padding: 12, background: "var(--bg-muted)", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Bollinger</div>
                  <SignalBadge signal={signals.bollingerSignal} />
                </div>
              </div>
              <div style={{ marginTop: 12, textAlign: "right" }}>
                <Link
                  href={`/predictions/${pair.replace("/", "-")}`}
                  style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}
                >
                  View detailed analysis for {pair} &rarr;
                </Link>
              </div>
            </div>

            {/* Major Pairs Grid */}
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                All Major Pairs
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {MAJOR_PAIRS.map((cp) => {
                  const pStr = pairToString(cp);
                  const slug = pairToSlug(cp);
                  const isActive = pStr === pair;
                  return (
                    <Link
                      key={slug}
                      href={`/predictions/${slug}`}
                      style={{
                        display: "block",
                        padding: "14px 16px",
                        background: isActive ? "var(--accent)" : "var(--bg-card)",
                        color: isActive ? "#fff" : "var(--text-primary)",
                        border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 8,
                        textDecoration: "none",
                        fontSize: 14,
                        fontWeight: 600,
                        textAlign: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {pStr}
                      <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, opacity: 0.7 }}>
                        {cp.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
