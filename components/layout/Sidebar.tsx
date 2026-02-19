"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  TrendingUp,
  Scale,
  FlaskConical,
  Activity,
} from "lucide-react";
import { useRates } from "@/store/ratesStore";

const NAV_SECTIONS = [
  {
    label: "Markets",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Predictions", href: "/predictions", icon: TrendingUp },
      { label: "Parity", href: "/parity", icon: Scale },
    ],
  },
  {
    label: "Risk Management",
    items: [
      { label: "Hedging", href: "/hedging", icon: Shield },
      { label: "Scenarios", href: "/scenarios", icon: FlaskConical },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { connectionStatus } = useRates();

  return (
    <aside
      style={{
        width: 220,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          FX Intelligence
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 12px", overflow: "auto" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "0 8px",
                marginBottom: 4,
              }}
            >
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 8px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                    background: isActive
                      ? "var(--accent-subtle)"
                      : "transparent",
                    textDecoration: "none",
                    transition: "background 150ms, color 150ms",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--bg-hover)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status footer */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Activity size={12} style={{ color: "var(--text-muted)" }} />
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "reconnecting"
              ? "Reconnecting..."
              : "Offline"}
        </span>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            marginLeft: "auto",
            background:
              connectionStatus === "connected"
                ? "var(--positive)"
                : connectionStatus === "reconnecting"
                  ? "var(--warning)"
                  : "var(--text-muted)",
          }}
        />
      </div>
    </aside>
  );
}
