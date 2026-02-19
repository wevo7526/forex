"use client";

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid var(--border)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }}
    />
  );
}

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 12 }}>
      <Spinner size={28} />
      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{message}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 12 }}>
      <div style={{ fontSize: 13, color: "var(--negative)" }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
