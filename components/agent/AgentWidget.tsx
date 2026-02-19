"use client";

import { useState } from "react";
import { Bot, Minus, X } from "lucide-react";
import { AgentPanel } from "./AgentPanel";

export function AgentWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 24,
            width: 420,
            maxHeight: "calc(100vh - 120px)",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slide-up 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot size={16} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                AI Agent
              </span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 4,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Minimize"
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 4,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflow: "hidden", minHeight: 400 }}>
            <AgentPanel />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--accent)",
          color: "var(--text-inverse)",
          border: "none",
          cursor: "pointer",
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(19, 91, 69, 0.3)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(19, 91, 69, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(19, 91, 69, 0.3)";
        }}
        title="AI Agent"
      >
        <Bot size={22} />
      </button>
    </>
  );
}
