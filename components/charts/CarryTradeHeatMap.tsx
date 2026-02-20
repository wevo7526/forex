"use client";

interface CarryTradeHeatMapProps {
  pnlTable: Array<{
    endingSpot: number;
    spotChangePct: number;
    profit: number;
  }>;
  borrowRate: number;
  investRate: number;
  initialSpot: number;
}

function getProfitColor(profit: number, maxAbs: number): string {
  if (maxAbs === 0) return "var(--bg-muted)";
  const intensity = Math.min(Math.abs(profit) / maxAbs, 1);
  if (profit >= 0) {
    return `rgba(34, 197, 94, ${0.1 + intensity * 0.6})`;
  }
  return `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`;
}

export function CarryTradeHeatMap({ pnlTable, borrowRate, investRate, initialSpot }: CarryTradeHeatMapProps) {
  if (pnlTable.length === 0) return null;

  // Create a grid: rows = interest differential variations, cols = spot change %
  // We use the actual pnlTable for the baseline differential, and simulate shifts
  const baseDiffBps = (investRate - borrowRate) * 100;
  const diffShifts = [-100, -50, 0, 50, 100]; // bps adjustments
  const spotSamples = pnlTable.filter((_, i) => i % Math.max(1, Math.floor(pnlTable.length / 8)) === 0).slice(0, 9);

  // For each diff shift and spot sample, compute approximate profit
  const grid: { diffLabel: string; spotPct: number; profit: number; isCurrent: boolean }[][] = [];
  let maxAbs = 0;

  for (const diffShift of diffShifts) {
    const row: typeof grid[0] = [];
    const adjustedDiff = baseDiffBps + diffShift;
    for (const sample of spotSamples) {
      // Scale the pnl proportionally by the differential shift
      const diffRatio = adjustedDiff / (baseDiffBps || 1);
      // Approximate: interest income scales with diff, FX P&L stays
      const baseProfit = sample.profit;
      const fxComponent = baseProfit - (baseDiffBps / 10000) * initialSpot * 1000;
      const interestComponent = (adjustedDiff / 10000) * initialSpot * 1000;
      const approxProfit = diffShift === 0 ? baseProfit : fxComponent + interestComponent;

      maxAbs = Math.max(maxAbs, Math.abs(approxProfit));
      row.push({
        diffLabel: `${adjustedDiff >= 0 ? "+" : ""}${adjustedDiff.toFixed(0)} bps`,
        spotPct: sample.spotChangePct,
        profit: approxProfit,
        isCurrent: diffShift === 0 && Math.abs(sample.spotChangePct) < 0.5,
      });
    }
    grid.push(row);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, color: "var(--text-muted)", fontWeight: 600, borderBottom: "2px solid var(--border)" }}>
              Diff (bps) ↓ / Spot Δ →
            </th>
            {spotSamples.map((s, i) => (
              <th key={i} style={{ padding: "8px 6px", textAlign: "center", fontSize: 10, fontFamily: "var(--font-geist-mono)", color: "var(--text-muted)", fontWeight: 600, borderBottom: "2px solid var(--border)" }}>
                {s.spotChangePct >= 0 ? "+" : ""}{s.spotChangePct.toFixed(1)}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, ri) => (
            <tr key={ri}>
              <td style={{ padding: "8px 10px", fontWeight: 600, fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)", whiteSpace: "nowrap" }}>
                {row[0]?.diffLabel}
              </td>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "8px 6px",
                    textAlign: "center",
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 11,
                    color: cell.profit >= 0 ? "var(--positive)" : "var(--negative)",
                    fontWeight: cell.isCurrent ? 700 : 400,
                    background: getProfitColor(cell.profit, maxAbs),
                    borderBottom: "1px solid var(--border-subtle)",
                    position: "relative",
                  }}
                  title={`Spot Δ: ${cell.spotPct.toFixed(1)}%, Diff: ${cell.diffLabel}, P&L: ${cell.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                >
                  {cell.profit >= 0 ? "+" : ""}{cell.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  {cell.isCurrent && (
                    <div style={{ position: "absolute", top: 1, right: 2, fontSize: 8, color: "var(--accent)" }}>●</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
        <span>Current position marked with ●</span>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: "rgba(34,197,94,0.4)" }} /> Profit
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: "rgba(239,68,68,0.4)" }} /> Loss
          </span>
        </div>
      </div>
    </div>
  );
}
