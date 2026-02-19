"use client";

import { useRates } from "@/store/ratesStore";

const CURRENCIES = ["EUR", "GBP", "USD", "JPY", "CHF", "CAD", "AUD"];

function getStrengthColor(score: number): string {
  if (score > 0.3) return "var(--positive)";
  if (score > 0.1) return "rgba(25, 162, 108, 0.6)";
  if (score < -0.3) return "var(--negative)";
  if (score < -0.1) return "rgba(217, 70, 54, 0.6)";
  return "var(--text-muted)";
}

function getStrengthBg(score: number): string {
  if (score > 0.3) return "var(--positive-bg)";
  if (score > 0.1) return "rgba(25, 162, 108, 0.05)";
  if (score < -0.3) return "var(--negative-bg)";
  if (score < -0.1) return "rgba(217, 70, 54, 0.05)";
  return "var(--bg-muted)";
}

export function CurrencyHeatMap() {
  const { rates } = useRates();
  const rateList = Object.values(rates);

  if (rateList.length === 0) return null;

  // Compute strength score for each currency based on change24hPct
  const scores: Record<string, { total: number; count: number }> = {};
  for (const c of CURRENCIES) {
    scores[c] = { total: 0, count: 0 };
  }

  for (const r of rateList) {
    if (r.change24hPct == null) continue;
    const [base, quote] = r.pair.split("/");
    if (scores[base]) {
      scores[base].total += r.change24hPct;
      scores[base].count += 1;
    }
    if (scores[quote]) {
      scores[quote].total -= r.change24hPct;
      scores[quote].count += 1;
    }
  }

  const strengths = CURRENCIES.map((c) => ({
    currency: c,
    score: scores[c].count > 0 ? scores[c].total / scores[c].count : 0,
  })).sort((a, b) => b.score - a.score);

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Currency Strength</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${CURRENCIES.length}, 1fr)`, gap: 6 }}>
        {strengths.map(({ currency, score }) => (
          <div
            key={currency}
            style={{
              textAlign: "center",
              padding: "12px 4px",
              borderRadius: 6,
              background: getStrengthBg(score),
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              {currency}
            </div>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--font-geist-mono)",
              color: getStrengthColor(score),
            }}>
              {score >= 0 ? "+" : ""}{score.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
