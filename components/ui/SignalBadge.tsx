"use client";

interface SignalBadgeProps {
  signal: string;
  size?: "sm" | "md";
}

function getColor(signal: string): { bg: string; text: string } {
  const s = signal.toLowerCase();
  if (["buy", "bullish", "golden_cross", "overbought"].includes(s))
    return { bg: "var(--positive-bg)", text: "var(--positive)" };
  if (["sell", "bearish", "death_cross", "oversold"].includes(s))
    return { bg: "var(--negative-bg)", text: "var(--negative)" };
  return { bg: "var(--bg-muted)", text: "var(--text-muted)" };
}

export function SignalBadge({ signal, size = "sm" }: SignalBadgeProps) {
  const { bg, text } = getColor(signal);
  return (
    <span style={{
      display: "inline-block",
      padding: size === "sm" ? "2px 8px" : "4px 12px",
      borderRadius: 4,
      fontSize: size === "sm" ? 11 : 13,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      background: bg,
      color: text,
    }}>
      {signal.replace(/_/g, " ")}
    </span>
  );
}
