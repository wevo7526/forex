"use client";

import { ResponsiveContainer, ComposedChart, Line, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { ForecastPoint } from "@/types/forex";

interface ForecastChartProps {
  forecast: ForecastPoint[];
  modelType: string;
  height?: number;
}

export function ForecastChart({ forecast, modelType, height = 380 }: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={forecast} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
        <YAxis stroke="var(--text-muted)" fontSize={11} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="upperCi"
          stroke="none"
          fill="var(--chart-1)"
          fillOpacity={0.08}
          name="Upper CI"
        />
        <Area
          type="monotone"
          dataKey="lowerCi"
          stroke="none"
          fill="var(--bg-page)"
          fillOpacity={1}
          name="Lower CI"
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
          name={`${modelType} Forecast`}
        />
        <Line
          type="monotone"
          dataKey="upperCi"
          stroke="var(--chart-1)"
          strokeWidth={1}
          strokeDasharray="4 3"
          dot={false}
          name="95% Upper"
        />
        <Line
          type="monotone"
          dataKey="lowerCi"
          stroke="var(--chart-1)"
          strokeWidth={1}
          strokeDasharray="4 3"
          dot={false}
          name="95% Lower"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
