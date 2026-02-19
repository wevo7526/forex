"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: Array<{ value: number }>;
  width?: number;
  height?: number;
  positive?: boolean;
}

export function SparklineChart({ data, width = 80, height = 30, positive = true }: SparklineChartProps) {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={positive ? "var(--positive)" : "var(--negative)"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
