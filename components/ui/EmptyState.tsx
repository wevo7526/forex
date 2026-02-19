"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        gap: 8,
      }}
    >
      {Icon && (
        <Icon size={32} strokeWidth={1.5} style={{ color: "var(--text-muted)", opacity: 0.4, marginBottom: 4 }} />
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 320 }}>
        {description}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: 8,
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--accent)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
