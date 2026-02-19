"use client";

interface SkeletonCardProps {
  variant?: "metric" | "rate" | "chart" | "table-row";
  count?: number;
}

function SkeletonBar({ width = "100%", height = 12 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: "var(--bg-muted)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

function MetricSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <SkeletonBar width="60%" height={10} />
      <div style={{ marginTop: 12 }}>
        <SkeletonBar width="80%" height={24} />
      </div>
    </div>
  );
}

function RateSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <SkeletonBar width={70} height={14} />
        <SkeletonBar width={50} height={12} />
      </div>
      <SkeletonBar width="50%" height={24} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <SkeletonBar width={60} height={10} />
        <SkeletonBar width={60} height={10} />
        <SkeletonBar width={60} height={10} />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 24,
      }}
    >
      <SkeletonBar width="30%" height={14} />
      <div style={{ marginTop: 16 }}>
        <SkeletonBar width="100%" height={200} />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <SkeletonBar width="25%" height={12} />
      <SkeletonBar width="20%" height={12} />
      <SkeletonBar width="20%" height={12} />
      <SkeletonBar width="20%" height={12} />
    </div>
  );
}

export function SkeletonCard({ variant = "metric", count = 1 }: SkeletonCardProps) {
  const Component = {
    metric: MetricSkeleton,
    rate: RateSkeleton,
    chart: ChartSkeleton,
    "table-row": TableRowSkeleton,
  }[variant];

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
