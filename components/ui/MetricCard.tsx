"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number | null;
  suffix?: string;
}

export function MetricCard({ label, value, delta, suffix }: MetricCardProps) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-geist-mono)", color: "var(--text-primary)" }}>
        {value}{suffix && <span style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 4 }}>{suffix}</span>}
      </div>
      {delta != null && (
        <div style={{ fontSize: 12, marginTop: 4, color: delta >= 0 ? "var(--positive)" : "var(--negative)" }}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(2)}%
        </div>
      )}
    </div>
  );
}
