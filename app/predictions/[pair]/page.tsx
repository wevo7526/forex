"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { fetchForecast, fetchSignals } from "@/lib/api";
import type { ForecastResult, TechnicalSignals, ModelType, ForecastMetrics, EnsembleMetrics, ForecastPoint } from "@/types/forex";
import { ResponsiveContainer, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

const MODEL_OPTIONS: { value: ModelType; label: string; color: string }[] = [
  { value: "ensemble", label: "Ensemble", color: "var(--chart-1)" },
  { value: "nn", label: "Neural Net", color: "var(--chart-2)" },
  { value: "arima", label: "ARIMA", color: "var(--chart-3)" },
  { value: "seasonal", label: "Seasonal", color: "var(--chart-4)" },
];

const HORIZON_OPTIONS = [7, 14, 30];

interface CompareData {
  date: string;
  ensemble?: number;
  nn?: number;
  arima?: number;
  seasonal?: number;
  [key: string]: string | number | undefined;
}

export default function PairForecastPage() {
  const params = useParams();
  const slug = params.pair as string;
  const displayPair = slug.replace("-", "/");

  const [model, setModel] = useState<ModelType>("ensemble");
  const [horizon, setHorizon] = useState(7);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [signals, setSignals] = useState<TechnicalSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareAll, setCompareAll] = useState(false);
  const [compareData, setCompareData] = useState<CompareData[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fc, sig] = await Promise.all([
        fetchForecast(displayPair, model, horizon),
        fetchSignals(displayPair),
      ]);
      setForecast(fc);
      setSignals(sig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [displayPair, model, horizon]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load all model forecasts for comparison
  useEffect(() => {
    if (!compareAll) return;
    setCompareLoading(true);
    Promise.all(
      MODEL_OPTIONS.map((opt) => fetchForecast(displayPair, opt.value, horizon).catch(() => null))
    ).then((results) => {
      // Merge all forecasts into a single dataset keyed by date
      const dateMap: Record<string, CompareData> = {};
      results.forEach((fc, idx) => {
        if (!fc) return;
        const key = MODEL_OPTIONS[idx].value;
        fc.forecast.forEach((pt: ForecastPoint) => {
          if (!dateMap[pt.date]) dateMap[pt.date] = { date: pt.date };
          dateMap[pt.date][key] = pt.predicted;
        });
      });
      const merged = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
      setCompareData(merged);
    }).finally(() => setCompareLoading(false));
  }, [compareAll, displayPair, horizon]);

  function getMetrics(fc: ForecastResult): ForecastMetrics {
    const m = fc.metrics;
    if ("rmse" in m && typeof (m as ForecastMetrics).rmse === "number" && !("nn" in m)) {
      return m as ForecastMetrics;
    }
    const ens = m as EnsembleMetrics;
    const models = [ens.nn, ens.arima, ens.seasonal].filter(Boolean);
    if (models.length === 0) {
      return { rmse: 0, mae: 0, directionalAccuracy: 0 };
    }
    return {
      rmse: models.reduce((s, x) => s + (x.rmse ?? 0), 0) / models.length,
      mae: models.reduce((s, x) => s + (x.mae ?? 0), 0) / models.length,
      directionalAccuracy: models.reduce((s, x) => s + (x.directionalAccuracy ?? 0), 0) / models.length,
    };
  }

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    borderRadius: 6,
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent)" : "var(--bg-card)",
    color: active ? "#fff" : "var(--text-secondary)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  const sectionStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 24,
  };

  return (
    <div>
      <PageHeader
        title={`Forecast: ${displayPair}`}
        description={`Model predictions and technical signals for ${displayPair}`}
      />

      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Model & Horizon Toggles */}
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Model
            </span>
            {MODEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setModel(opt.value); setCompareAll(false); }}
                style={toggleBtnStyle(model === opt.value && !compareAll)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Horizon
            </span>
            {HORIZON_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                style={toggleBtnStyle(horizon === h)}
              >
                {h}d
              </button>
            ))}
          </div>
          <button
            onClick={() => setCompareAll(!compareAll)}
            style={{
              ...toggleBtnStyle(compareAll),
              marginLeft: "auto",
            }}
          >
            Compare All Models
          </button>
        </div>

        {loading && <LoadingState message={`Loading ${model} forecast for ${displayPair}...`} />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {/* Multi-Model Comparison Chart */}
        {compareAll && (
          <ErrorBoundary sectionName="Model Comparison">
            <div style={sectionStyle}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                All Models Comparison — {displayPair} ({horizon}-day)
              </h2>
              {compareLoading ? (
                <LoadingState message="Loading all model forecasts..." />
              ) : compareData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={compareData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {MODEL_OPTIONS.map((opt) => (
                      <Line
                        key={opt.value}
                        type="monotone"
                        dataKey={opt.value}
                        stroke={opt.color}
                        strokeWidth={2}
                        dot={false}
                        name={opt.label}
                        connectNulls
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                  No comparison data available
                </div>
              )}
            </div>
          </ErrorBoundary>
        )}

        {!loading && !error && forecast && signals && !compareAll && (
          <>
            {/* Forecast Chart */}
            <ErrorBoundary sectionName="Forecast Chart">
              <div style={sectionStyle}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                  {MODEL_OPTIONS.find((o) => o.value === model)?.label} Forecast — {displayPair} ({horizon}-day)
                </h2>
                <ForecastChart forecast={forecast.forecast} modelType={forecast.modelType} height={400} />
              </div>
            </ErrorBoundary>

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

            {/* Signals Panel */}
            <ErrorBoundary sectionName="Technical Signals">
              <div style={sectionStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                    Technical Signals
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Overall:</span>
                    <SignalBadge signal={signals.overallSignal} size="md" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  <div style={{ padding: 16, background: "var(--bg-muted)", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>RSI</span>
                      <SignalBadge signal={signals.rsiSignal} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)" }}>
                      {signals.rsi.toFixed(1)}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "var(--bg-muted)", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>MACD</span>
                      <SignalBadge signal={signals.macdCrossover} />
                    </div>
                    <div style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", color: "var(--text-secondary)" }}>
                      <span>MACD: {signals.macd.toFixed(5)}</span>
                      <br />
                      <span>Signal: {signals.macdSignalLine.toFixed(5)}</span>
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "var(--bg-muted)", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>EMA Crossover</span>
                      <SignalBadge signal={signals.emaSignal} />
                    </div>
                    <div style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", color: "var(--text-secondary)" }}>
                      <span>EMA 50: {signals.ema50.toFixed(5)}</span>
                      <br />
                      <span>EMA 200: {signals.ema200.toFixed(5)}</span>
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "var(--bg-muted)", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Bollinger Bands</span>
                      <SignalBadge signal={signals.bollingerSignal} />
                    </div>
                    <div style={{ fontSize: 14, fontFamily: "var(--font-geist-mono)", color: "var(--text-secondary)" }}>
                      <span>Upper: {signals.bollingerUpper.toFixed(5)}</span>
                      <br />
                      <span>Lower: {signals.bollingerLower.toFixed(5)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          </>
        )}
      </div>
    </div>
  );
}
