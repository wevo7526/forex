"use client";

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import type { IRPData } from "@/types/forex";

interface IRPCurveChartProps {
  data: IRPData;
  height?: number;
}

export function IRPCurveChart({ data, height = 320 }: IRPCurveChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data.curve} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="tenor" stroke="var(--text-muted)" fontSize={11} />
        <YAxis stroke="var(--text-muted)" fontSize={11} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
          formatter={(value: number | undefined) => value != null ? value.toFixed(5) : ""}
        />
        <ReferenceLine y={data.spot} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: "Spot", fontSize: 10 }} />
        <Line type="monotone" dataKey="forwardRate" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4, fill: "var(--chart-1)" }} name="Forward Rate" />
      </LineChart>
    </ResponsiveContainer>
  );
}
