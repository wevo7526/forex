"use client";

import { useCallback, useEffect } from "react";
import { useRates } from "@/store/ratesStore";
import { useRateStream } from "@/lib/ws";
import { fetchAllRates } from "@/lib/api";
import type { LiveRate } from "@/types/forex";

export function RateStreamProvider({ children }: { children: React.ReactNode }) {
  const { updateRate, setAllRates, setConnectionStatus } = useRates();

  // Initial REST fetch so rates are available immediately
  useEffect(() => {
    fetchAllRates()
      .then((rates) => setAllRates(rates))
      .catch(() => {});
  }, [setAllRates]);

  const handleUpdate = useCallback(
    (rate: LiveRate) => updateRate(rate.pair, rate),
    [updateRate]
  );

  const handleBatchUpdate = useCallback(
    (rates: Record<string, LiveRate>) => setAllRates(rates),
    [setAllRates]
  );

  useRateStream({
    onUpdate: handleUpdate,
    onBatchUpdate: handleBatchUpdate,
    onStatusChange: setConnectionStatus,
  });

  return <>{children}</>;
}
