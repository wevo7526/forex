"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { EmptyState } from "@/components/ui/EmptyState";
import { PayoffChart } from "@/components/charts/PayoffChart";
import { calculateForward } from "@/lib/api";
import { useRates } from "@/store/ratesStore";
import type { ForwardInput, ForwardResult, PositionType } from "@/types/forex";

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

export default function ForwardPage() {
  const { rates } = useRates();
  const [pair, setPair] = useState("EUR/USD");
  const [position, setPosition] = useState<PositionType>("receivable");
  const [notional, setNotional] = useState(1000000);
  const [days, setDays] = useState(90);
  const [spotRate, setSpotRate] = useState(1.08);
  const [forwardRate, setForwardRate] = useState(1.0836);
  const [domesticRate, setDomesticRate] = useState(5.0);
  const [foreignRate, setForeignRate] = useState(3.5);

  useEffect(() => {
    const liveRate = rates[pair];
    if (liveRate) setSpotRate(liveRate.rate);
  }, [pair, rates]);

  const [result, setResult] = useState<ForwardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    try {
      const input: ForwardInput = {
        pair,
        position,
        notional,
        days,
        spotRate,
        forwardRate,
        domesticRate,
        foreignRate,
      };
      const res = await calculateForward(input);
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
        title="Forward Contract"
        description="Lock in a future exchange rate to eliminate currency risk on known cash flows."
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
            <label style={labelStyle}>Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as PositionType)}
              style={inputStyle}
            >
              <option value="receivable">Receivable (long foreign)</option>
              <option value="payable">Payable (short foreign)</option>
            </select>
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
            <label style={labelStyle}>Days to Maturity</label>
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
            <label style={labelStyle}>Forward Rate</label>
            <input
              type="number"
              step="0.0001"
              value={forwardRate}
              onChange={(e) => setForwardRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <button onClick={handleCalculate} style={buttonStyle} disabled={loading}>
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {/* Right panel - Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {loading && <LoadingState message="Calculating forward rate..." />}
          {error && <ErrorState message={error} onRetry={handleCalculate} />}

          {result && !loading && (
            <ErrorBoundary sectionName="Forward Results">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <MetricCard label="Forward Rate" value={result.forwardRate.toFixed(6)} />
                <MetricCard
                  label="Locked Value"
                  value={result.lockedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                />
                <MetricCard label="Premium Points" value={result.premiumPoints.toFixed(4)} />
                <MetricCard
                  label="Annualized Premium"
                  value={result.premiumAnnualizedPct.toFixed(2)}
                  suffix="%"
                />
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
                      { key: "hedged", label: "Hedged", color: "var(--chart-1)" },
                      { key: "unhedged", label: "Unhedged", color: "var(--chart-2)", dashed: true },
                    ]}
                    referenceLines={[{ value: 0, label: "Break-even", axis: "y" }]}
                    xLabel="Spot Rate at Maturity"
                    yLabel="P&L"
                  />
                </div>
              )}
            </ErrorBoundary>
          )}

          {!result && !loading && !error && (
            <EmptyState
              title="No Results Yet"
              description="Configure parameters and click Calculate to see forward contract analysis."
            />
          )}
        </div>
      </div>
    </div>
  );
}
