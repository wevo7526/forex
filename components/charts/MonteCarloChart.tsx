"use client";

import { ResponsiveContainer, ComposedChart, Line, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import type { MonteCarloResult } from "@/types/forex";

interface MonteCarloChartProps {
  result: MonteCarloResult;
  height?: number;
}

export function MonteCarloChart({ result, height = 400 }: MonteCarloChartProps) {
  // Build chart data: one row per day
  const days = result.meanPath.length;
  const chartData = Array.from({ length: days }, (_, i) => {
    const row: Record<string, number> = {
      day: i,
      mean: result.meanPath[i],
      p5: result.p5Path[i],
      p25: result.p25Path[i],
      p75: result.p75Path[i],
      p95: result.p95Path[i],
    };
    // Add up to 8 sample paths
    result.samplePaths.slice(0, 8).forEach((path, j) => {
      if (path[i] !== undefined) row[`s${j}`] = path[i];
    });
    return row;
  });

  const sampleKeys = result.samplePaths.slice(0, 8).map((_, j) => `s${j}`);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} label={{ value: "Day", position: "insideBottom", offset: -5, fontSize: 11 }} />
        <YAxis stroke="var(--text-muted)" fontSize={11} domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
        />
        {/* 90% confidence band */}
        <Area type="monotone" dataKey="p95" stroke="none" fill="var(--chart-2)" fillOpacity={0.08} />
        <Area type="monotone" dataKey="p5" stroke="none" fill="var(--bg-page)" fillOpacity={1} />
        {/* 50% confidence band */}
        <Area type="monotone" dataKey="p75" stroke="none" fill="var(--chart-2)" fillOpacity={0.12} />
        <Area type="monotone" dataKey="p25" stroke="none" fill="var(--bg-page)" fillOpacity={1} />
        {/* Sample paths */}
        {sampleKeys.map((key) => (
          <Line key={key} type="monotone" dataKey={key} stroke="var(--text-muted)" strokeWidth={0.5} strokeOpacity={0.3} dot={false} />
        ))}
        {/* Mean path */}
        <Line type="monotone" dataKey="mean" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="Mean" />
        {/* Percentile lines */}
        <Line type="monotone" dataKey="p5" stroke="var(--chart-3)" strokeWidth={1} strokeDasharray="4 3" dot={false} name="5th %ile" />
        <Line type="monotone" dataKey="p95" stroke="var(--chart-3)" strokeWidth={1} strokeDasharray="4 3" dot={false} name="95th %ile" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
