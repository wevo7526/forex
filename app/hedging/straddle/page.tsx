"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { EmptyState } from "@/components/ui/EmptyState";
import { PayoffChart } from "@/components/charts/PayoffChart";
import { calculateStraddle } from "@/lib/api";
import { useRates } from "@/store/ratesStore";
import type { StraddleInput, StraddleResult } from "@/types/forex";

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontSize: 13,
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-muted)",
  marginBottom: 4,
  display: "block",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 6,
  border: "none",
  background: "var(--accent)",
  color: "var(--text-inverse)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
};

export default function StraddlePage() {
  const { rates } = useRates();
  const [pair, setPair] = useState("EUR/USD");
  const [notional, setNotional] = useState(1000000);
  const [days, setDays] = useState(90);
  const [spotRate, setSpotRate] = useState(1.08);
  const [strikePrice, setStrikePrice] = useState(1.08);
  const [callPremium, setCallPremium] = useState(0.015);
  const [putPremium, setPutPremium] = useState(0.012);

  useEffect(() => {
    const liveRate = rates[pair];
    if (liveRate) setSpotRate(liveRate.rate);
  }, [pair, rates]);

  const [result, setResult] = useState<StraddleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    try {
      const input: StraddleInput = {
        pair,
        notional,
        spotRate,
        strikePrice,
        callPremium,
        putPremium,
      };
      const res = await calculateStraddle(input);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <PageHeader
        title="Straddle Strategy"
        description="Combine a call and put at the same strike to profit from large moves in either direction."
      />

      <div
        style={{
          padding: 32,
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left panel - Form */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Parameters
          </h3>

          <div>
            <label style={labelStyle}>Currency Pair</label>
            <PairSelector value={pair} onChange={setPair} style={{ width: "100%" }} />
          </div>

          <div>
            <label style={labelStyle}>Notional Amount</label>
            <input
              type="number"
              value={notional}
              onChange={(e) => setNotional(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Days to Expiry</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Spot Rate</label>
            <input
              type="number"
              step="0.0001"
              value={spotRate}
              onChange={(e) => setSpotRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Strike Price</label>
            <input
              type="number"
              step="0.0001"
              value={strikePrice}
              onChange={(e) => setStrikePrice(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Call Premium (per unit)</label>
            <input
              type="number"
              step="0.001"
              value={callPremium}
              onChange={(e) => setCallPremium(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Put Premium (per unit)</label>
            <input
              type="number"
              step="0.001"
              value={putPremium}
              onChange={(e) => setPutPremium(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <button onClick={handleCalculate} style={buttonStyle} disabled={loading}>
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {/* Right panel - Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {loading && <LoadingState message="Calculating straddle payoff..." />}
          {error && <ErrorState message={error} onRetry={handleCalculate} />}

          {result && !loading && (
            <ErrorBoundary sectionName="Straddle Results">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <MetricCard
                  label="Total Premium Cost"
                  value={result.totalPremiumCost.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                />
                <MetricCard
                  label="Max Loss"
                  value={result.maxLoss.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                />
                <MetricCard label="Breakeven Upper" value={result.breakevenUpper.toFixed(6)} />
                <MetricCard label="Breakeven Lower" value={result.breakevenLower.toFixed(6)} />
              </div>

              {result.pnlTable && result.pnlTable.length > 0 && (
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 24,
                    marginTop: 24,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Payoff Analysis
                  </h3>
                  <PayoffChart
                    data={result.pnlTable}
                    xKey="spot"
                    lines={[
                      { key: "netPnl", label: "Net P&L", color: "var(--chart-1)" },
                      {
                        key: "callIntrinsic",
                        label: "Call",
                        color: "var(--chart-2)",
                        dashed: true,
                      },
                      {
                        key: "putIntrinsic",
                        label: "Put",
                        color: "var(--chart-3)",
                        dashed: true,
                      },
                    ]}
                    xLabel="Spot Rate at Expiry"
                    yLabel="P&L"
                  />
                </div>
              )}
            </ErrorBoundary>
          )}

          {!result && !loading && !error && (
            <EmptyState
              title="No Results Yet"
              description="Configure parameters and click Calculate to see straddle payoff analysis."
            />
          )}
        </div>
      </div>
    </div>
  );
}
