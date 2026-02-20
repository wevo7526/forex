"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { EmptyState } from "@/components/ui/EmptyState";
import { PayoffChart } from "@/components/charts/PayoffChart";
import { CarryTradeHeatMap } from "@/components/charts/CarryTradeHeatMap";
import { calculateCarryTrade } from "@/lib/api";
import { useRates } from "@/store/ratesStore";
import type { CarryTradeInput, CarryTradeResult } from "@/types/forex";

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

export default function CarryTradePage() {
  const { rates } = useRates();
  const [pair, setPair] = useState("USD/JPY");
  const [notional, setNotional] = useState(1000000);
  const [ownFunds, setOwnFunds] = useState(100000);
  const [days, setDays] = useState(90);
  const [spotRate, setSpotRate] = useState(150.0);
  const [borrowRate, setBorrowRate] = useState(0.5);
  const [investRate, setInvestRate] = useState(5.0);

  useEffect(() => {
    const liveRate = rates[pair];
    if (liveRate) setSpotRate(liveRate.rate);
  }, [pair, rates]);

  const [result, setResult] = useState<CarryTradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    try {
      const input: CarryTradeInput = {
        pair,
        notional,
        ownFunds,
        borrowedAmount: notional - ownFunds,
        days,
        initialSpot: spotRate,
        borrowRate,
        investRate,
      };
      const res = await calculateCarryTrade(input);
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
        title="Carry Trade"
        description="Borrow in a low-rate currency and invest in a high-rate currency to capture the interest differential."
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
            <label style={labelStyle}>Total Notional</label>
            <input
              type="number"
              value={notional}
              onChange={(e) => setNotional(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Own Funds</label>
            <input
              type="number"
              value={ownFunds}
              onChange={(e) => setOwnFunds(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Days</label>
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
              step="0.01"
              value={spotRate}
              onChange={(e) => setSpotRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Borrow Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={borrowRate}
              onChange={(e) => setBorrowRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Invest Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={investRate}
              onChange={(e) => setInvestRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <button onClick={handleCalculate} style={buttonStyle} disabled={loading}>
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {/* Right panel - Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {loading && <LoadingState message="Calculating carry trade..." />}
          {error && <ErrorState message={error} onRetry={handleCalculate} />}

          {result && !loading && (
            <ErrorBoundary sectionName="Carry Trade Results">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <MetricCard
                  label="Interest Differential"
                  value={result.interestDifferentialBps.toFixed(0)}
                  suffix="bps"
                />
                <MetricCard
                  label="Base Case Profit"
                  value={result.baseCaseProfit.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                />
                <MetricCard
                  label="Borrowed Amount"
                  value={result.borrowedAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
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
                    Profit vs. Ending Spot Rate
                  </h3>
                  <PayoffChart
                    data={result.pnlTable}
                    xKey="endingSpot"
                    lines={[{ key: "profit", label: "Profit", color: "var(--chart-1)" }]}
                    referenceLines={[{ value: 0, label: "Break-even", axis: "y" }]}
                    xLabel="Ending Spot Rate"
                    yLabel="Profit"
                  />
                </div>
              )}

              {/* 2D Sensitivity Heat Map */}
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
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px 0" }}>
                    Sensitivity Heat Map
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px 0" }}>
                    P&amp;L across spot rate changes (columns) and interest differential shifts (rows)
                  </p>
                  <CarryTradeHeatMap
                    pnlTable={result.pnlTable}
                    borrowRate={borrowRate}
                    investRate={investRate}
                    initialSpot={spotRate}
                  />
                </div>
              )}
            </ErrorBoundary>
          )}

          {!result && !loading && !error && (
            <EmptyState
              title="No Results Yet"
              description="Configure parameters and click Calculate to see carry trade analysis."
            />
          )}
        </div>
      </div>
    </div>
  );
}
