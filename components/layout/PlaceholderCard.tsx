import type { LucideIcon } from "lucide-react";

interface PlaceholderCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PlaceholderCard({ icon: Icon, title, description }: PlaceholderCardProps) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "var(--bg-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
      </div>
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

interface PlaceholderGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function PlaceholderGrid({ children, columns = 3 }: PlaceholderGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16,
        padding: "24px 32px",
      }}
    >
      {children}
    </div>
  );
}
