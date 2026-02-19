"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PairSelector } from "@/components/ui/PairSelector";
import { MetricCard } from "@/components/ui/MetricCard";
import { MonteCarloChart } from "@/components/charts/MonteCarloChart";
import { LoadingState, ErrorState } from "@/components/ui/Spinner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useRates } from "@/store/ratesStore";
import { runMonteCarlo, runStressTest, runHedgeEffectiveness } from "@/lib/api";
import type { MonteCarloResult, StressScenario, HedgeEffectivenessResult, PositionType } from "@/types/forex";

const PRESET_SHOCKS = [-15, -10, -5, 5, 10, 15];

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
};

export default function ScenariosPage() {
  const { rates } = useRates();

  const [pair, setPair] = useState("EUR/USD");
  const [spot, setSpot] = useState<number>(0);
  const [volatility, setVolatility] = useState<number>(0.1);
  const [days, setDays] = useState<number>(90);
  const [numSimulations, setNumSimulations] = useState<number>(500);

  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [stressResults, setStressResults] = useState<StressScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hedge effectiveness state
  const [hePosition, setHePosition] = useState<PositionType>("receivable");
  const [heNotional, setHeNotional] = useState(1000000);
  const [heForwardRate, setHeForwardRate] = useState(1.0836);
  const [heDays, setHeDays] = useState(90);
  const [heResult, setHeResult] = useState<HedgeEffectivenessResult | null>(null);
  const [heLoading, setHeLoading] = useState(false);
  const [heError, setHeError] = useState<string | null>(null);

  // Auto-fill spot from live rates when pair changes
  useEffect(() => {
    const liveRate = rates[pair];
    if (liveRate) {
      setSpot(liveRate.rate);
    }
  }, [pair, rates]);

  async function handleSubmit() {
    if (spot <= 0) {
      setError("Spot rate must be greater than 0");
      return;
    }
    setLoading(true);
    setError(null);
    setMcResult(null);
    setStressResults([]);

    try {
      const [mcData, stressData] = await Promise.all([
        runMonteCarlo({ pair, spot, volatility, days, numSimulations }),
        runStressTest(pair, spot),
      ]);
      setMcResult(mcData);
      setStressResults(stressData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  function applyPresetShock(shockPct: number) {
    if (spot <= 0) return;
    const stressed = spot * (1 + shockPct / 100);
    const scenario: StressScenario = {
      scenario: `Manual ${shockPct >= 0 ? "+" : ""}${shockPct}% Shock`,
      shockPct,
      originalSpot: spot,
      stressedSpot: stressed,
    };
    setStressResults((prev) => {
      const filtered = prev.filter((s) => s.scenario !== scenario.scenario);
      return [...filtered, scenario].sort((a, b) => a.shockPct - b.shockPct);
    });
  }

  async function handleHedgeEffectiveness() {
    if (spot <= 0) return;
    setHeLoading(true);
    setHeError(null);
    try {
      const res = await runHedgeEffectiveness({
        position: hePosition,
        notional: heNotional,
        spotRate: spot,
        forwardRate: heForwardRate,
        days: heDays,
      });
      setHeResult(res);
    } catch (err) {
      setHeError(err instanceof Error ? err.message : "Hedge effectiveness analysis failed");
    } finally {
      setHeLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Scenario Builder"
        description="Monte Carlo simulation and stress testing"
      />

      <div style={{ padding: "24px 32px" }}>
        {/* Form Section */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Currency Pair</label>
              <PairSelector
                value={pair}
                onChange={setPair}
                style={{ width: "100%" }}
              />
            </div>

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

            <div>
              <label style={labelStyle}>Volatility (annualized)</label>
              <input
                type="number"
                step="0.01"
                value={volatility}
                onChange={(e) => setVolatility(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Days</label>
              <input
                type="number"
                step="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Simulations</label>
              <input
                type="number"
                step="100"
                value={numSimulations}
                onChange={(e) =>
                  setNumSimulations(parseInt(e.target.value) || 100)
                }
                style={inputStyle}
              />
            </div>

            <div>
              <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>
                {loading ? "Running..." : "Run Simulation"}
              </button>
            </div>
          </div>
        </div>

        {/* Preset Stress Buttons */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "16px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Quick Stress:
          </span>
          {PRESET_SHOCKS.map((shock) => (
            <button
              key={shock}
              onClick={() => applyPresetShock(shock)}
              disabled={spot <= 0}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: shock < 0 ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                color: shock < 0 ? "var(--negative)" : "var(--positive)",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-geist-mono)",
                cursor: spot > 0 ? "pointer" : "not-allowed",
                opacity: spot > 0 ? 1 : 0.5,
                transition: "background 0.15s ease",
              }}
            >
              {shock >= 0 ? "+" : ""}{shock}%
            </button>
          ))}
          {spot > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
              Base: <strong style={{ fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)" }}>{spot.toFixed(4)}</strong>
            </span>
          )}
        </div>

        {/* Loading / Error */}
        {loading && <LoadingState message="Running Monte Carlo simulation..." />}
        {error && <ErrorState message={error} onRetry={handleSubmit} />}

        {/* Monte Carlo Chart */}
        {mcResult && (
          <ErrorBoundary sectionName="Monte Carlo Chart">
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Simulation Paths
            </h2>
            <MonteCarloChart result={mcResult} />
          </div>
          </ErrorBoundary>
        )}

        {/* Terminal Stats */}
        {mcResult && (
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 12,
              }}
            >
              Terminal Distribution
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <MetricCard
                label="Mean"
                value={mcResult.terminalStats.mean.toFixed(4)}
              />
              <MetricCard
                label="Std Dev"
                value={mcResult.terminalStats.std.toFixed(4)}
              />
              <MetricCard
                label="5th Percentile"
                value={mcResult.terminalStats.p5.toFixed(4)}
              />
              <MetricCard
                label="95th Percentile"
                value={mcResult.terminalStats.p95.toFixed(4)}
              />
            </div>
          </div>
        )}

        {/* Stress Test Table */}
        {stressResults.length > 0 && (
          <ErrorBoundary sectionName="Stress Test">
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Stress Test Scenarios
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid var(--border)",
                      textAlign: "left",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px 12px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Scenario
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "right",
                      }}
                    >
                      Shock %
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "right",
                      }}
                    >
                      Original Spot
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "right",
                      }}
                    >
                      Stressed Spot
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stressResults.map((s, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.scenario}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color:
                            s.shockPct >= 0
                              ? "var(--positive)"
                              : "var(--negative)",
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {s.shockPct >= 0 ? "+" : ""}
                        {s.shockPct.toFixed(2)}%
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {s.originalSpot.toFixed(4)}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          textAlign: "right",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {s.stressedSpot.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </ErrorBoundary>
        )}

        {/* Hedge Effectiveness Section */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 24,
            marginTop: 24,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            Hedge Effectiveness Under Stress
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
            Compare how different hedging strategies perform across stress scenarios for a given position.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              alignItems: "end",
              marginBottom: 20,
            }}
          >
            <div>
              <label style={labelStyle}>Position</label>
              <select
                value={hePosition}
                onChange={(e) => setHePosition(e.target.value as PositionType)}
                style={inputStyle}
              >
                <option value="receivable">Receivable (long foreign)</option>
                <option value="payable">Payable (short foreign)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Notional</label>
              <input
                type="number"
                value={heNotional}
                onChange={(e) => setHeNotional(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Forward Rate</label>
              <input
                type="number"
                step="0.0001"
                value={heForwardRate}
                onChange={(e) => setHeForwardRate(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Days</label>
              <input
                type="number"
                value={heDays}
                onChange={(e) => setHeDays(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <button
                onClick={handleHedgeEffectiveness}
                disabled={heLoading || spot <= 0}
                style={{
                  ...buttonStyle,
                  opacity: heLoading || spot <= 0 ? 0.7 : 1,
                  cursor: heLoading || spot <= 0 ? "not-allowed" : "pointer",
                }}
              >
                {heLoading ? "Analyzing..." : "Run Analysis"}
              </button>
            </div>
          </div>

          {heLoading && <LoadingState message="Analyzing hedge effectiveness..." />}
          {heError && <ErrorState message={heError} onRetry={handleHedgeEffectiveness} />}

          {heResult && !heLoading && (
            <ErrorBoundary sectionName="Hedge Effectiveness Results">
              <div style={{ overflowX: "auto", marginTop: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Scenario
                      </th>
                      <th style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Shock %
                      </th>
                      <th style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Stressed Spot
                      </th>
                      {heResult.scenarios.length > 0 &&
                        Object.keys(heResult.scenarios[0].strategies).map((strat) => (
                          <th
                            key={strat}
                            style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}
                          >
                            {strat}
                          </th>
                        ))}
                      <th style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Best
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {heResult.scenarios.map((sc, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg-muted)" }}>
                        <td style={{ padding: "10px 12px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {sc.scenario}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-geist-mono)", color: sc.shockPct >= 0 ? "var(--positive)" : "var(--negative)" }}>
                          {sc.shockPct >= 0 ? "+" : ""}{sc.shockPct.toFixed(1)}%
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "var(--font-geist-mono)", color: "var(--text-secondary)" }}>
                          {sc.stressedSpot.toFixed(4)}
                        </td>
                        {Object.entries(sc.strategies).map(([strat, value]) => (
                          <td
                            key={strat}
                            style={{
                              padding: "10px 12px",
                              textAlign: "right",
                              fontFamily: "var(--font-geist-mono)",
                              color: "var(--text-primary)",
                              fontWeight: strat === sc.bestStrategy ? 700 : 400,
                              background: strat === sc.bestStrategy ? "rgba(59,130,246,0.06)" : "transparent",
                            }}
                          >
                            {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                        ))}
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: "var(--accent)", fontSize: 12 }}>
                          {sc.bestStrategy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}
