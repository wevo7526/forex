"use client";

import { createContext, useCallback, useContext, useReducer, type ReactNode } from "react";
import type { LiveRate } from "@/types/forex";

// ─── State ─────────────────────────────────────────────────

interface RatesState {
  rates: Record<string, LiveRate>;
  lastUpdate: Date | null;
  connectionStatus: "connected" | "disconnected" | "reconnecting";
}

const initialState: RatesState = {
  rates: {},
  lastUpdate: null,
  connectionStatus: "disconnected",
};

// ─── Actions ───────────────────────────────────────────────

type RatesAction =
  | { type: "UPDATE_RATE"; pair: string; rate: LiveRate }
  | { type: "SET_ALL_RATES"; rates: Record<string, LiveRate> }
  | { type: "SET_STATUS"; status: RatesState["connectionStatus"] };

function ratesReducer(state: RatesState, action: RatesAction): RatesState {
  switch (action.type) {
    case "UPDATE_RATE":
      return {
        ...state,
        rates: { ...state.rates, [action.pair]: action.rate },
        lastUpdate: new Date(),
      };
    case "SET_ALL_RATES":
      return { ...state, rates: action.rates, lastUpdate: new Date() };
    case "SET_STATUS":
      return { ...state, connectionStatus: action.status };
  }
}

// ─── Context ───────────────────────────────────────────────

interface RatesContextValue extends RatesState {
  updateRate: (pair: string, rate: LiveRate) => void;
  setAllRates: (rates: Record<string, LiveRate>) => void;
  setConnectionStatus: (status: RatesState["connectionStatus"]) => void;
}

const RatesContext = createContext<RatesContextValue | null>(null);

export function RatesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ratesReducer, initialState);

  const updateRate = useCallback((pair: string, rate: LiveRate) => {
    dispatch({ type: "UPDATE_RATE", pair, rate });
  }, []);

  const setAllRates = useCallback((rates: Record<string, LiveRate>) => {
    dispatch({ type: "SET_ALL_RATES", rates });
  }, []);

  const setConnectionStatus = useCallback((status: RatesState["connectionStatus"]) => {
    dispatch({ type: "SET_STATUS", status });
  }, []);

  return (
    <RatesContext value={{ ...state, updateRate, setAllRates, setConnectionStatus }}>
      {children}
    </RatesContext>
  );
}

export function useRates() {
  const ctx = useContext(RatesContext);
  if (!ctx) throw new Error("useRates must be used within RatesProvider");
  return ctx;
}
