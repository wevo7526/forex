"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { EmptyState } from "@/components/ui/EmptyState";
import { calculateMoneyMarket } from "@/lib/api";
import { useRates } from "@/store/ratesStore";
import type { MoneyMarketInput, MoneyMarketResult, PositionType } from "@/types/forex";

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

export default function MoneyMarketPage() {
  const { rates } = useRates();
  const [pair, setPair] = useState("EUR/USD");
  const [position, setPosition] = useState<PositionType>("receivable");
  const [notional, setNotional] = useState(1000000);
  const [days, setDays] = useState(90);
  const [spotRate, setSpotRate] = useState(1.08);
  const [domesticDepositRate, setDomesticDepositRate] = useState(5.0);
  const [domesticBorrowRate, setDomesticBorrowRate] = useState(5.5);
  const [foreignDepositRate, setForeignDepositRate] = useState(3.5);
  const [foreignBorrowRate, setForeignBorrowRate] = useState(4.0);

  useEffect(() => {
    const liveRate = rates[pair];
    if (liveRate) setSpotRate(liveRate.rate);
  }, [pair, rates]);

  const [result, setResult] = useState<MoneyMarketResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    try {
      const input: MoneyMarketInput = {
        pair,
        position,
        notional,
        days,
        spotRate,
        domesticDepositRate,
        domesticBorrowRate,
        foreignDepositRate,
        foreignBorrowRate,
      };
      const res = await calculateMoneyMarket(input);
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
        title="Money Market Hedge"
        description="Use borrowing and lending in two currencies to replicate a forward hedge."
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
            <label style={labelStyle}>Domestic Deposit Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={domesticDepositRate}
              onChange={(e) => setDomesticDepositRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Domestic Borrow Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={domesticBorrowRate}
              onChange={(e) => setDomesticBorrowRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Foreign Deposit Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={foreignDepositRate}
              onChange={(e) => setForeignDepositRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Foreign Borrow Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={foreignBorrowRate}
              onChange={(e) => setForeignBorrowRate(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <button onClick={handleCalculate} style={buttonStyle} disabled={loading}>
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {/* Right panel - Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {loading && <LoadingState message="Calculating money market hedge..." />}
          {error && <ErrorState message={error} onRetry={handleCalculate} />}

          {result && !loading && (
            <ErrorBoundary sectionName="Money Market Results">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <MetricCard label="Effective Rate" value={result.effectiveRate.toFixed(6)} />
                <MetricCard
                  label="Proceeds"
                  value={result.proceeds.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                />
              </div>

              {result.cashFlowSteps && result.cashFlowSteps.length > 0 && (
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 24,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Cash Flow Steps
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {result.cashFlowSteps.map((step, i) => (
                      <div
                        key={step.step}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          padding: "16px 0",
                          borderBottom:
                            i < result.cashFlowSteps.length - 1
                              ? "1px solid var(--border)"
                              : "none",
                        }}
                      >
                        {/* Step number */}
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "var(--accent)",
                            color: "var(--text-inverse)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {step.step}
                        </div>

                        {/* Action text */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "var(--text-primary)",
                              lineHeight: 1.5,
                            }}
                          >
                            {step.action}
                          </div>
                        </div>

                        {/* Amount and currency */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {step.amount.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--text-muted)",
                              marginLeft: 6,
                            }}
                          >
                            {step.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ErrorBoundary>
          )}

          {!result && !loading && !error && (
            <EmptyState
              title="No Results Yet"
              description="Configure parameters and click Calculate to see money market hedge analysis."
            />
          )}
        </div>
      </div>
    </div>
  );
}
