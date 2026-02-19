"use client";

import { useRef, useEffect } from "react";
import type { OHLCV } from "@/types/forex";

interface CandlestickChartProps {
  data: OHLCV[];
  height?: number;
}

export function CandlestickChart({ data, height = 400 }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    let disposed = false;

    import("lightweight-charts").then((lc) => {
      if (disposed || !containerRef.current) return;

      const chart = lc.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: {
          background: { color: "#ffffff" },
          textColor: "#1a1a1a",
          fontFamily: "var(--font-geist-sans)",
        },
        grid: {
          vertLines: { color: "#eceae4" },
          horzLines: { color: "#eceae4" },
        },
        rightPriceScale: { borderColor: "#e5e2db" },
        timeScale: { borderColor: "#e5e2db" },
      });

      const series = chart.addSeries(lc.CandlestickSeries, {
        upColor: "#19a26c",
        downColor: "#d94636",
        borderUpColor: "#19a26c",
        borderDownColor: "#d94636",
        wickUpColor: "#19a26c",
        wickDownColor: "#d94636",
      });

      series.setData(
        data.map((d) => ({
          time: d.date,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );

      chart.timeScale().fitContent();
      chartRef.current = chart;

      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      });
      ro.observe(containerRef.current);

      return () => {
        ro.disconnect();
        chart.remove();
      };
    });

    return () => {
      disposed = true;
      if (chartRef.current && typeof (chartRef.current as { remove: () => void }).remove === "function") {
        (chartRef.current as { remove: () => void }).remove();
      }
    };
  }, [data, height]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}
