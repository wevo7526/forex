"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { SignalBadge } from "@/components/ui/SignalBadge";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { IRPCurveChart } from "@/components/charts/IRPCurveChart";
import { fetchIRPData, fetchPPPData } from "@/lib/api";
import { useRates } from "@/store/ratesStore";
import type { IRPData, PPPData } from "@/types/forex";

export default function ParityPage() {
  const { rates } = useRates();

  const [pair, setPair] = useState("EUR/USD");
  const [spot, setSpot] = useState(1.08);
  const [domesticRate, setDomesticRate] = useState(5.25);
  const [foreignRate, setForeignRate] = useState(4.5);
  const [inflationDomestic, setInflationDomestic] = useState(3.2);
  const [inflationForeign, setInflationForeign] = useState(2.4);

  const [irpData, setIrpData] = useState<IRPData | null>(null);
  const [pppData, setPppData] = useState<PPPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill spot from rates store when pair changes
  useEffect(() => {
    const liveRate = rates[pair];
    if (liveRate) {
      setSpot(liveRate.rate);
    }
  }, [pair, rates]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const [irp, ppp] = await Promise.all([
        fetchIRPData(pair, spot, domesticRate, foreignRate),
        fetchPPPData(pair, spot, inflationDomestic, inflationForeign),
      ]);
      setIrpData(irp);
      setPppData(ppp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch parity data");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    fontSize: 13,
    fontFamily: "var(--font-geist-mono)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
    display: "block",
  };

  const sectionStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: 24,
  };

  return (
    <div>
      <PageHeader
        title="Interest Rate & Purchasing Power Parity"
        description="IRP forward curves and PPP valuation analysis"
      />

      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Input Controls */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            Parameters
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            {/* Pair Selector */}
            <div>
              <label style={labelStyle}>Currency Pair</label>
              <PairSelector value={pair} onChange={setPair} style={{ width: "100%" }} />
            </div>

            {/* Spot Rate */}
            <div>
              <label style={labelStyle}>Spot Rate</label>
              <input
                type="number"
                step="0.0001"
                value={spot}
                onChange={(e) => setSpot(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>

            {/* Placeholder for alignment */}
            <div />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Domestic Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={domesticRate}
                onChange={(e) => setDomesticRate(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Foreign Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={foreignRate}
                onChange={(e) => setForeignRate(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Domestic Inflation (%)</label>
              <input
                type="number"
                step="0.01"
                value={inflationDomestic}
                onChange={(e) => setInflationDomestic(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Foreign Inflation (%)</label>
              <input
                type="number"
                step="0.01"
                value={inflationForeign}
                onChange={(e) => setInflationForeign(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: "10px 28px",
              borderRadius: 6,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {loading && <LoadingState message="Computing parity analysis..." />}
        {error && <ErrorState message={error} onRetry={handleAnalyze} />}

        {!loading && !error && irpData && pppData && (
          <>
            {/* IRP Forward Curve Chart */}
            <div style={sectionStyle}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                IRP Forward Curve — {pair}
              </h2>
              <IRPCurveChart data={irpData} height={340} />
            </div>

            {/* IRP Curve Data Table */}
            <div style={sectionStyle}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                IRP Curve Data
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Tenor", "Days", "Forward Rate", "Premium (%)"].map((hdr) => (
                        <th
                          key={hdr}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            borderBottom: "2px solid var(--border)",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {irpData.curve.map((row, idx) => (
                      <tr
                        key={row.tenor}
                        style={{
                          background: idx % 2 === 0 ? "transparent" : "var(--bg-muted)",
                        }}
                      >
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {row.tenor}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-geist-mono)", color: "var(--text-secondary)" }}>
                          {row.days}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)" }}>
                          {row.forwardRate.toFixed(5)}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontFamily: "var(--font-geist-mono)",
                            color: row.premiumPct >= 0 ? "var(--positive)" : "var(--negative)",
                          }}
                        >
                          {row.premiumPct >= 0 ? "+" : ""}
                          {row.premiumPct.toFixed(4)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PPP Results */}
            <div style={sectionStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  Purchasing Power Parity — {pair}
                </h2>
                <SignalBadge signal={pppData.signal} size="md" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <MetricCard
                  label="PPP Implied Rate"
                  value={pppData.pppImpliedRate.toFixed(5)}
                />
                <MetricCard
                  label="Current Spot"
                  value={pppData.currentSpot.toFixed(5)}
                />
                <MetricCard
                  label="Deviation"
                  value={`${pppData.deviationPct >= 0 ? "+" : ""}${pppData.deviationPct.toFixed(2)}`}
                  suffix="%"
                  delta={pppData.deviationPct}
                />
              </div>
              {/* PPP Calculation Steps */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                  Calculation Steps
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    {
                      step: 1,
                      label: "Inflation Differential",
                      formula: `Δπ = π_domestic - π_foreign = ${inflationDomestic.toFixed(2)}% - ${inflationForeign.toFixed(2)}% = ${(inflationDomestic - inflationForeign).toFixed(2)}%`,
                    },
                    {
                      step: 2,
                      label: "PPP Implied Rate",
                      formula: `S_ppp = S₀ × (1 + π_domestic) / (1 + π_foreign) = ${spot.toFixed(4)} × ${(1 + inflationDomestic / 100).toFixed(4)} / ${(1 + inflationForeign / 100).toFixed(4)} = ${pppData.pppImpliedRate.toFixed(5)}`,
                    },
                    {
                      step: 3,
                      label: "Deviation from Fair Value",
                      formula: `Deviation = (S_actual - S_ppp) / S_ppp × 100 = (${pppData.currentSpot.toFixed(5)} - ${pppData.pppImpliedRate.toFixed(5)}) / ${pppData.pppImpliedRate.toFixed(5)} × 100 = ${pppData.deviationPct >= 0 ? "+" : ""}${pppData.deviationPct.toFixed(2)}%`,
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        padding: "14px 0",
                        borderBottom: s.step < 3 ? "1px solid var(--border-subtle)" : "none",
                      }}
                    >
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
                        {s.step}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--text-secondary)", lineHeight: 1.5, wordBreak: "break-word" }}>
                          {s.formula}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  background: "var(--bg-muted)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Based on the inflation differential, the PPP model implies an exchange rate of{" "}
                <strong style={{ color: "var(--text-primary)" }}>{pppData.pppImpliedRate.toFixed(5)}</strong>.
                The current spot rate of <strong style={{ color: "var(--text-primary)" }}>{pppData.currentSpot.toFixed(5)}</strong>{" "}
                represents a <strong style={{ color: pppData.deviationPct >= 0 ? "var(--positive)" : "var(--negative)" }}>
                  {Math.abs(pppData.deviationPct).toFixed(2)}%
                </strong>{" "}
                {pppData.deviationPct >= 0 ? "overvaluation" : "undervaluation"} relative to PPP fair value.
                The approximate expected change is{" "}
                <strong style={{ color: "var(--text-primary)" }}>{pppData.approxChangePct.toFixed(2)}%</strong>.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
