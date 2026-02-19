"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { PairSelector } from "@/components/ui/PairSelector";
import { Spinner } from "@/components/ui/Spinner";
import { fetchRecommendation, fetchChat } from "@/lib/agent-api";
import type { RecommendResponse, Message } from "@/types/agent";

type Tab = "analysis" | "chat";

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: "8px 0",
  fontSize: 12,
  fontWeight: 600,
  border: "none",
  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
  background: "transparent",
  color: active ? "var(--accent)" : "var(--text-muted)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
});

const inputStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--bg-page)",
  color: "var(--text-primary)",
  fontSize: 12,
  width: "100%",
};

export function AgentPanel() {
  const [tab, setTab] = useState<Tab>("analysis");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        <button style={tabBtnStyle(tab === "analysis")} onClick={() => setTab("analysis")}>
          <Sparkles size={14} /> Analysis
        </button>
        <button style={tabBtnStyle(tab === "chat")} onClick={() => setTab("chat")}>
          <MessageSquare size={14} /> Chat
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {tab === "analysis" ? <AnalysisTab /> : <ChatTab />}
      </div>
    </div>
  );
}

// ─── Analysis Tab ──────────────────────────────────────────

function AnalysisTab() {
  const [pair, setPair] = useState("EUR/USD");
  const [position, setPosition] = useState("receivable");
  const [notional, setNotional] = useState(1000000);
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchRecommendation(pair, position, notional);
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Inputs */}
      <div>
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Pair</label>
        <PairSelector value={pair} onChange={setPair} style={{ width: "100%", fontSize: 12 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Position</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle}>
            <option value="receivable">Receivable</option>
            <option value="payable">Payable</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>Notional</label>
          <input type="number" value={notional} onChange={(e) => setNotional(Number(e.target.value))} style={inputStyle} />
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={loading}
        style={{
          padding: "8px 0",
          borderRadius: 6,
          border: "none",
          background: "var(--accent)",
          color: "var(--text-inverse)",
          fontSize: 12,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Analyzing..." : "Run Analysis"}
      </button>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: 20 }}>
          <Spinner size={16} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Running multi-agent analysis...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: 12, borderRadius: 6, background: "var(--negative-bg)", color: "var(--negative)", fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Strategy */}
          <div style={{ padding: 12, borderRadius: 8, background: "var(--bg-page)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Strategy
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              {result.recommendation.primaryStrategy}
            </div>
            <div style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 4,
              background: "var(--accent)",
              color: "var(--text-inverse)",
              fontSize: 11,
              fontWeight: 600,
            }}>
              {(result.recommendation.confidence * 100).toFixed(0)}% Confidence
            </div>
          </div>

          {/* Rationale */}
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {result.recommendation.rationale}
          </div>

          {/* Risk Warning */}
          {result.recommendation.riskWarning && (
            <div style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "var(--warning-bg)",
              border: "1px solid rgba(212, 136, 15, 0.3)",
              color: "var(--warning)",
              fontSize: 11,
              lineHeight: 1.5,
            }}>
              {result.recommendation.riskWarning}
            </div>
          )}

          {/* Reasoning Trace (collapsible) */}
          {result.reasoningTrace.length > 0 && <ReasoningTrace trace={result.reasoningTrace} />}
        </div>
      )}
    </div>
  );
}

function ReasoningTrace({ trace }: { trace: unknown[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          color: "var(--text-muted)",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", display: "inline-block" }}>
          &#9654;
        </span>
        Reasoning Trace ({trace.length} steps)
      </button>
      {open && (
        <ol style={{ margin: "8px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {trace.map((step, i) => {
            const text =
              typeof step === "string"
                ? step
                : typeof step === "object" && step !== null && "conclusion" in (step as Record<string, unknown>)
                  ? `[${(step as Record<string, unknown>).agent}] ${(step as Record<string, unknown>).conclusion}`
                  : JSON.stringify(step);
            return (
              <li key={i} style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                {text}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// ─── Chat Tab ──────────────────────────────────────────────

function ChatTab() {
  const [pair, setPair] = useState("EUR/USD");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const query = input.trim();
    if (!query || sending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const response = await fetchChat(query, pair);
      let content: string;

      if (response.error) {
        content = `Error: ${response.error}`;
      } else if (response.recommendation) {
        const rec = response.recommendation;
        const parts = [
          `Strategy: ${rec.primaryStrategy}`,
          `Confidence: ${(rec.confidence * 100).toFixed(0)}%`,
        ];
        if (rec.rationale) parts.push(rec.rationale);
        if (rec.riskWarning) parts.push(`Risk: ${rec.riskWarning}`);
        content = parts.join("\n");
      } else {
        const parts: string[] = [];
        if (response.marketContext) {
          parts.push(`Spot ${response.marketContext.spotRate?.toFixed(4) ?? "N/A"}, ${response.marketContext.trend ?? ""}`);
        }
        if (response.predictionContext) {
          parts.push(`Prediction: ${response.predictionContext.direction ?? "N/A"}`);
        }
        content = parts.length > 0 ? parts.join("\n") : JSON.stringify(response, null, 2);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Request failed"}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Pair selector */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Pair:</span>
        <PairSelector value={pair} onChange={setPair} style={{ fontSize: 12 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>
            Ask about {pair} strategy...
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "85%",
                  padding: "8px 12px",
                  borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: isUser ? "var(--accent)" : "var(--bg-page)",
                  color: isUser ? "var(--text-inverse)" : "var(--text-primary)",
                  border: isUser ? "none" : "1px solid var(--border)",
                  fontSize: 12,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {sending && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Spinner size={14} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={`Ask about ${pair}...`}
          disabled={sending}
          style={{ ...inputStyle, flex: 1, opacity: sending ? 0.6 : 1 }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: "none",
            background: "var(--accent)",
            color: "var(--text-inverse)",
            fontSize: 12,
            fontWeight: 600,
            cursor: sending || !input.trim() ? "not-allowed" : "pointer",
            opacity: sending || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
