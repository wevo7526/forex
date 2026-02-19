"use client";

import { usePathname } from "next/navigation";
import { useRates } from "@/store/ratesStore";
import { TrendingUp, TrendingDown } from "lucide-react";

export function FXTicker() {
  const pathname = usePathname();
  const { rates } = useRates();
  const rateList = Object.values(rates);

  // Hide on dashboard root — rates are already visible there
  if (pathname === "/" || pathname === "/dashboard") return null;
  if (rateList.length === 0) return null;

  // Duplicate for seamless loop
  const items = [...rateList, ...rateList];

  return (
    <div
      style={{
        height: 36,
        overflow: "hidden",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const inner = e.currentTarget.querySelector("[data-ticker]") as HTMLElement;
        if (inner) inner.style.animationPlayState = "paused";
      }}
      onMouseLeave={(e) => {
        const inner = e.currentTarget.querySelector("[data-ticker]") as HTMLElement;
        if (inner) inner.style.animationPlayState = "running";
      }}
    >
      <div
        data-ticker=""
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          gap: 32,
          whiteSpace: "nowrap",
          animation: `ticker-scroll ${rateList.length * 4}s linear infinite`,
          width: "max-content",
        }}
      >
        {items.map((r, i) => {
          const decimals = r.pair.includes("JPY") || r.pair.includes("MXN") || r.pair.includes("BRL") ? 2 : 4;
          const positive = (r.change24hPct ?? 0) >= 0;
          const Arrow = positive ? TrendingUp : TrendingDown;
          return (
            <div
              key={`${r.pair}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingRight: 8,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {r.pair}
              </span>
              <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)" }}>
                {r.rate.toFixed(decimals)}
              </span>
              <Arrow size={12} style={{ color: positive ? "var(--positive)" : "var(--negative)" }} />
              {r.change24hPct != null && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: positive ? "var(--positive)" : "var(--negative)",
                }}>
                  {positive ? "+" : ""}{r.change24hPct.toFixed(2)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
