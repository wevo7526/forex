"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { compareStrategies } from "@/lib/api";
import { useRates } from "@/store/ratesStore";
import type { StrategyComparison, CompareInput, PositionType } from "@/types/forex";

const strategies = [
  {
    title: "Forward Contract",
    description: "Lock in a future exchange rate to eliminate currency risk on known cash flows.",
    href: "/hedging/forward",
  },
  {
    title: "Money Market Hedge",
    description: "Use borrowing and lending in two currencies to replicate a forward hedge.",
    href: "/hedging/money-market",
  },
  {
    title: "Currency Options",
    description: "Buy the right, but not the obligation, to exchange at a set strike price.",
    href: "/hedging/options",
  },
  {
    title: "Straddle Strategy",
    description: "Combine a call and put at the same strike to profit from large moves in either direction.",
    href: "/hedging/straddle",
  },
  {
    title: "Carry Trade",
    description: "Borrow in a low-rate currency and invest in a high-rate currency to capture the interest differential.",
    href: "/hedging/carry-trade",
  },
];

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
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: 4,
  display: "block",
};

export default function HedgingPage() {
  const { rates } = useRates();
  const [pair, setPair] = useState("EUR/USD");
  const [position, setPosition] = useState<PositionType>("receivable");
  const [notional, setNotional] = useState(1000000);
  const [days, setDays] = useState(90);
  const [spotRate, setSpotRate] = useState(1.08);
  const [domesticRate, setDomesticRate] = useState(5.25);
  const [foreignRate, setForeignRate] = useState(4.5);
  const [forwardRate, setForwardRate] = useState(1.0836);
  const [comparison, setComparison] = useState<StrategyComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const liveRate = rates[pair];
    if (liveRate) setSpotRate(liveRate.rate);
  }, [pair, rates]);

  async function handleCompare() {
    setLoading(true);
    setError(null);
    try {
      const input: CompareInput = { pair, position, notional, days, spotRate, forwardRate, domesticRate, foreignRate };
      const res = await compareStrategies(input);
      setComparison(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <PageHeader
        title="Hedging Strategies"
        description="Analyze and compare FX hedging instruments to manage currency exposure."
      />

      <div style={{ padding: "0 32px 32px" }}>
        {/* Strategy Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {strategies.map((s) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 130,
                  cursor: "pointer",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>{s.title}</h2>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{s.description}</p>
                </div>
                <div style={{ marginTop: 16, fontSize: 13, fontWeight: 500, color: "var(--accent)", display: "flex", alignItems: "center", gap: 6 }}>
                  Open calculator <span style={{ fontSize: 16, lineHeight: 1 }}>&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Strategy Comparison */}
        <ErrorBoundary sectionName="Strategy Comparison">
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
              Compare All Strategies
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Pair</label>
                <PairSelector value={pair} onChange={setPair} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={labelStyle}>Position</label>
                <select value={position} onChange={(e) => setPosition(e.target.value as PositionType)} style={inputStyle}>
                  <option value="receivable">Receivable</option>
                  <option value="payable">Payable</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Notional</label>
                <input type="number" value={notional} onChange={(e) => setNotional(Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Days</label>
                <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Spot Rate</label>
                <input type="number" step="0.0001" value={spotRate} onChange={(e) => setSpotRate(Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Forward Rate</label>
                <input type="number" step="0.0001" value={forwardRate} onChange={(e) => setForwardRate(Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Domestic Rate (%)</label>
                <input type="number" step="0.01" value={domesticRate} onChange={(e) => setDomesticRate(Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Foreign Rate (%)</label>
                <input type="number" step="0.01" value={foreignRate} onChange={(e) => setForeignRate(Number(e.target.value))} style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--accent)",
                    color: "var(--text-inverse)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                    width: "100%",
                  }}
                >
                  {loading ? "Comparing..." : "Compare"}
                </button>
              </div>
            </div>

            {loading && <LoadingState message="Comparing strategies..." />}
            {error && <ErrorState message={error} onRetry={handleCompare} />}

            {comparison && !loading && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                  <MetricCard label="Spot Rate" value={comparison.spotRate.toFixed(4)} />
                  <MetricCard label="Forward Rate" value={comparison.forwardRate.toFixed(4)} />
                </div>

                {comparison.comparisonTable.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr>
                          {["Strategy", "Expected Outcome", "Best Case", "Worst Case", "Hedge Cost"].map((h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: h === "Strategy" ? "left" : "right",
                                padding: "10px 12px",
                                borderBottom: "2px solid var(--border)",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.comparisonTable.map((row, idx) => (
                          <tr key={row.strategy} style={{ background: idx % 2 === 0 ? "transparent" : "var(--bg-muted)" }}>
                            <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text-primary)" }}>{row.strategy}</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)" }}>
                              {row.expectedOutcome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-geist-mono)", color: "var(--positive)" }}>
                              {row.bestCase.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-geist-mono)", color: "var(--negative)" }}>
                              {row.worstCase.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-geist-mono)", color: "var(--text-secondary)" }}>
                              {row.hedgeCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
