"use client";

import { useRef, useEffect } from "react";
import type { OHLCV } from "@/types/forex";

export interface OverlayConfig {
  ema50?: boolean;
  ema200?: boolean;
  bollinger?: boolean;
  volume?: boolean;
}

interface CandlestickChartProps {
  data: OHLCV[];
  height?: number;
  overlays?: OverlayConfig;
}

function computeEMA(closes: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let ema: number | null = null;
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (ema === null) {
      ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(ema);
    } else {
      ema = closes[i] * k + ema * (1 - k);
      result.push(ema);
    }
  }
  return result;
}

function computeBollinger(closes: number[], period = 20, multiplier = 2) {
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + multiplier * std);
      lower.push(mean - multiplier * std);
    }
  }
  return { upper, lower };
}

export function CandlestickChart({ data, height = 400, overlays = {} }: CandlestickChartProps) {
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

      const candleSeries = chart.addSeries(lc.CandlestickSeries, {
        upColor: "#19a26c",
        downColor: "#d94636",
        borderUpColor: "#19a26c",
        borderDownColor: "#d94636",
        wickUpColor: "#19a26c",
        wickDownColor: "#d94636",
      });

      const mapped = data.map((d) => ({
        time: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candleSeries.setData(mapped);

      const closes = data.map((d) => d.close);

      // EMA 50 overlay
      if (overlays.ema50) {
        const ema50 = computeEMA(closes, 50);
        const ema50Series = chart.addSeries(lc.LineSeries, {
          color: "#3b82f6",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ema50Series.setData(
          ema50
            .map((v, i) => (v != null ? { time: data[i].date, value: v } : null))
            .filter(Boolean) as { time: string; value: number }[]
        );
      }

      // EMA 200 overlay
      if (overlays.ema200) {
        const ema200 = computeEMA(closes, 200);
        const ema200Series = chart.addSeries(lc.LineSeries, {
          color: "#f59e0b",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        ema200Series.setData(
          ema200
            .map((v, i) => (v != null ? { time: data[i].date, value: v } : null))
            .filter(Boolean) as { time: string; value: number }[]
        );
      }

      // Bollinger Bands overlay
      if (overlays.bollinger) {
        const bb = computeBollinger(closes, 20, 2);
        const upperSeries = chart.addSeries(lc.LineSeries, {
          color: "rgba(139, 92, 246, 0.5)",
          lineWidth: 1,
          lineStyle: 2, // dashed
          priceLineVisible: false,
          lastValueVisible: false,
        });
        const lowerSeries = chart.addSeries(lc.LineSeries, {
          color: "rgba(139, 92, 246, 0.5)",
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        upperSeries.setData(
          bb.upper
            .map((v, i) => (v != null ? { time: data[i].date, value: v } : null))
            .filter(Boolean) as { time: string; value: number }[]
        );
        lowerSeries.setData(
          bb.lower
            .map((v, i) => (v != null ? { time: data[i].date, value: v } : null))
            .filter(Boolean) as { time: string; value: number }[]
        );
      }

      // Volume histogram
      if (overlays.volume) {
        const volSeries = chart.addSeries(lc.HistogramSeries, {
          priceFormat: { type: "volume" },
          priceScaleId: "volume",
        });
        chart.priceScale("volume").applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
        });
        volSeries.setData(
          data.map((d) => ({
            time: d.date,
            value: d.volume ?? 0,
            color: d.close >= d.open ? "rgba(25, 162, 108, 0.3)" : "rgba(217, 70, 54, 0.3)",
          }))
        );
      }

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
  }, [data, height, overlays.ema50, overlays.ema200, overlays.bollinger, overlays.volume]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}
