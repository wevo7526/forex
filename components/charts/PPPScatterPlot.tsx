"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";

interface PPPScatterPoint {
  pair: string;
  inflationDiff: number;
  actualFxChange: number;
  pppPredicted: number;
}

interface PPPScatterPlotProps {
  data: PPPScatterPoint[];
  height?: number;
}

export function PPPScatterPlot({ data, height = 300 }: PPPScatterPlotProps) {
  if (data.length === 0) return null;

  // PPP theory line: FX change ≈ inflation differential
  const minX = Math.min(...data.map((d) => d.inflationDiff)) - 1;
  const maxX = Math.max(...data.map((d) => d.inflationDiff)) + 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          dataKey="inflationDiff"
          domain={[minX, maxX]}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickFormatter={(v) => `${v.toFixed(1)}%`}
        >
          <Label value="Inflation Differential (%)" position="bottom" offset={10} style={{ fontSize: 11, fill: "var(--text-muted)" }} />
        </XAxis>
        <YAxis
          type="number"
          dataKey="actualFxChange"
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickFormatter={(v) => `${v.toFixed(1)}%`}
        >
          <Label value="Actual FX Change (%)" angle={-90} position="insideLeft" offset={0} style={{ fontSize: 11, fill: "var(--text-muted)" }} />
        </YAxis>
        <Tooltip
          content={({ payload }) => {
            if (!payload || !payload.length) return null;
            const d = payload[0].payload as PPPScatterPoint;
            return (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.pair}</div>
                <div>Inflation Diff: <span style={{ fontFamily: "var(--font-geist-mono)" }}>{d.inflationDiff.toFixed(2)}%</span></div>
                <div>Actual FX Change: <span style={{ fontFamily: "var(--font-geist-mono)" }}>{d.actualFxChange.toFixed(2)}%</span></div>
                <div>PPP Predicted: <span style={{ fontFamily: "var(--font-geist-mono)" }}>{d.pppPredicted.toFixed(2)}%</span></div>
              </div>
            );
          }}
        />
        {/* PPP theory line (45° through origin) */}
        <ReferenceLine
          segment={[
            { x: minX, y: minX },
            { x: maxX, y: maxX },
          ]}
          stroke="var(--accent)"
          strokeDasharray="6 3"
          strokeWidth={1.5}
          label={{ value: "PPP Line", position: "insideTopRight", style: { fontSize: 10, fill: "var(--accent)" } }}
        />
        <ReferenceLine x={0} stroke="var(--text-muted)" strokeOpacity={0.3} />
        <ReferenceLine y={0} stroke="var(--text-muted)" strokeOpacity={0.3} />
        <Scatter
          data={data}
          fill="var(--accent)"
          stroke="var(--bg-card)"
          strokeWidth={1}
          r={6}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export type { PPPScatterPoint };
