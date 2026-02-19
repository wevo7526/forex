import type { RecommendResponse, ChatResponse, InsightResponse } from "@/types/agent";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Convert snake_case keys to camelCase recursively
function toCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map((item) => toCamelCase(item)) as T;
  if (obj !== null && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        const camelKey = key.replace(/_([a-z0-9])/g, (_, c: string) =>
          c.toUpperCase()
        );
        (acc as Record<string, unknown>)[camelKey] = toCamelCase(value);
        return acc;
      },
      {} as Record<string, unknown>
    ) as T;
  }
  return obj as T;
}

async function agentFetch<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Agent API error: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return toCamelCase<T>(json);
}

export async function fetchRecommendation(
  pair: string,
  position?: string,
  notional?: number
): Promise<RecommendResponse> {
  return agentFetch("/api/agent/recommend", { pair, position, notional });
}

export async function fetchChat(
  query: string,
  pair: string
): Promise<ChatResponse> {
  return agentFetch("/api/agent/chat", { query, pair });
}

export async function fetchInsight(pair: string): Promise<InsightResponse> {
  return agentFetch("/api/agent/insight", { pair });
}
