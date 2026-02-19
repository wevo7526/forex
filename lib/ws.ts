"use client";

import { useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import type { LiveRate } from "@/types/forex";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

interface UseRatesOptions {
  onUpdate: (rate: LiveRate) => void;
  onBatchUpdate: (rates: Record<string, LiveRate>) => void;
  onStatusChange: (status: "connected" | "disconnected" | "reconnecting") => void;
}

// Convert snake_case keys to camelCase
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

export function useRateStream({ onUpdate, onBatchUpdate, onStatusChange }: UseRatesOptions) {
  const onUpdateRef = useRef(onUpdate);
  const onBatchRef = useRef(onBatchUpdate);
  const onStatusRef = useRef(onStatusChange);
  onUpdateRef.current = onUpdate;
  onBatchRef.current = onBatchUpdate;
  onStatusRef.current = onStatusChange;

  const { readyState, lastJsonMessage } = useWebSocket(
    `${WS_URL}/api/rates/ws/all`,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  // Handle incoming messages — per-pair or batch
  useEffect(() => {
    if (!lastJsonMessage) return;

    const raw = lastJsonMessage as Record<string, unknown>;

    if (raw.type === "rates_update" && raw.rates) {
      // Batch message: { type: "rates_update", rates: { "EUR/USD": {...}, ... } }
      const converted = toCamelCase<Record<string, LiveRate>>(raw.rates);
      onBatchRef.current(converted);
    } else if (raw.pair) {
      // Per-pair message: { pair, rate, bid, offer, last_refreshed, timestamp }
      const rate = toCamelCase<LiveRate>(raw);
      onUpdateRef.current(rate);
    }
  }, [lastJsonMessage]);

  // Handle connection status changes
  useEffect(() => {
    const map: Record<number, "connected" | "disconnected" | "reconnecting"> = {
      [ReadyState.OPEN]: "connected",
      [ReadyState.CLOSED]: "disconnected",
      [ReadyState.CONNECTING]: "reconnecting",
    };
    onStatusRef.current(map[readyState] ?? "disconnected");
  }, [readyState]);
}
