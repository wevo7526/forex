interface PageHeaderProps {
  title: string;
  description: string;
  phase?: number;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, phase, children }: PageHeaderProps) {
  return (
    <header
      style={{
        padding: "24px 32px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        </div>
        {children && <div>{children}</div>}
      </div>
      {phase && (
        <div style={{ marginTop: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              background: "var(--bg-muted)",
              padding: "3px 10px",
              borderRadius: 4,
              letterSpacing: "0.01em",
            }}
          >
            Planned for Phase {phase}
          </span>
        </div>
      )}
    </header>
  );
}
