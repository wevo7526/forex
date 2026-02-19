"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface VolatilityChartProps {
  data: Array<{ date: string; volatility: number }>;
  height?: number;
}

export function VolatilityChart({ data, height = 200 }: VolatilityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tickFormatter={(d: string) => {
            const date = new Date(d);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          tickLine={false}
          axisLine={false}
          width={50}
          tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, "Volatility"]}
          labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
        />
        <Area
          type="monotone"
          dataKey="volatility"
          stroke="var(--chart-5)"
          fill="var(--chart-5)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
