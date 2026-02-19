"use client";

import { ResponsiveContainer, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from "recharts";

interface PayoffLine {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

interface PayoffChartProps {
  data: Array<Record<string, number>>;
  xKey: string;
  lines: PayoffLine[];
  xLabel?: string;
  yLabel?: string;
  referenceLines?: Array<{ value: number; label: string; axis: "x" | "y" }>;
  height?: number;
}

export function PayoffChart({ data, xKey, lines, xLabel, yLabel, referenceLines, height = 350 }: PayoffChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis
          dataKey={xKey}
          stroke="var(--text-muted)"
          fontSize={11}
          tickFormatter={(v: number) => v.toFixed(4)}
          label={xLabel ? { value: xLabel, position: "insideBottom", offset: -5, fontSize: 11 } : undefined}
        />
        <YAxis
          stroke="var(--text-muted)"
          fontSize={11}
          tickFormatter={(v: number) => v.toLocaleString()}
          label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
          }}
          formatter={(value?: number) => value != null ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ""}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {referenceLines?.map((rl, i) =>
          rl.axis === "y" ? (
            <ReferenceLine key={i} y={rl.value} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: rl.label, fontSize: 10 }} />
          ) : (
            <ReferenceLine key={i} x={rl.value} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: rl.label, fontSize: 10 }} />
          )
        )}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color}
            strokeDasharray={line.dashed ? "6 3" : undefined}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
