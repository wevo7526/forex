import type { OHLCV } from "@/types/forex";

/**
 * Compute rolling annualized volatility from OHLCV data using log returns.
 */
export function computeRollingVolatility(
  data: OHLCV[],
  window = 30
): Array<{ date: string; volatility: number }> {
  if (data.length < window + 1) return [];

  const logReturns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    logReturns.push(Math.log(data[i].close / data[i - 1].close));
  }

  const result: Array<{ date: string; volatility: number }> = [];
  for (let i = window - 1; i < logReturns.length; i++) {
    const slice = logReturns.slice(i - window + 1, i + 1);
    const mean = slice.reduce((s, v) => s + v, 0) / slice.length;
    const variance =
      slice.reduce((s, v) => s + (v - mean) ** 2, 0) / (slice.length - 1);
    const annualized = Math.sqrt(variance) * Math.sqrt(252);
    result.push({ date: data[i + 1].date, volatility: annualized });
  }

  return result;
}

/**
 * Generate deterministic sparkline data points from a current rate and 24h change.
 */
export function generateSparklineData(
  currentRate: number,
  change24hPct: number | null,
  points = 20
): Array<{ value: number }> {
  const changePct = change24hPct ?? 0;
  const startRate = currentRate / (1 + changePct / 100);
  const diff = currentRate - startRate;

  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    // Smooth interpolation with slight mid-curve deviation
    const noise = Math.sin(t * Math.PI * 3) * diff * 0.15;
    const value = startRate + diff * t + noise;
    return { value };
  });
}
