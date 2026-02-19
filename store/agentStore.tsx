"use client";

import { createContext, useCallback, useContext, useReducer, type ReactNode } from "react";
import type { RecommendResponse, ChatResponse, InsightResponse, Message } from "@/types/agent";

// ─── State ─────────────────────────────────────────────────

interface AgentState {
  recommendation: RecommendResponse | null;
  chatResponse: ChatResponse | null;
  insight: InsightResponse | null;
  chatHistory: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  recommendation: null,
  chatResponse: null,
  insight: null,
  chatHistory: [],
  loading: false,
  error: null,
};

// ─── Actions ───────────────────────────────────────────────

type AgentAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_RECOMMENDATION"; recommendation: RecommendResponse | null }
  | { type: "SET_CHAT_RESPONSE"; chatResponse: ChatResponse | null }
  | { type: "SET_INSIGHT"; insight: InsightResponse | null }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "CLEAR_CHAT" }
  | { type: "RESET" };

function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_RECOMMENDATION":
      return { ...state, recommendation: action.recommendation };
    case "SET_CHAT_RESPONSE":
      return { ...state, chatResponse: action.chatResponse };
    case "SET_INSIGHT":
      return { ...state, insight: action.insight };
    case "ADD_MESSAGE":
      return { ...state, chatHistory: [...state.chatHistory, action.message] };
    case "CLEAR_CHAT":
      return { ...state, chatHistory: [], chatResponse: null };
    case "RESET":
      return initialState;
  }
}

// ─── Context ───────────────────────────────────────────────

interface AgentContextValue extends AgentState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecommendation: (rec: RecommendResponse | null) => void;
  setChatResponse: (res: ChatResponse | null) => void;
  setInsight: (insight: InsightResponse | null) => void;
  addMessage: (msg: Message) => void;
  clearChat: () => void;
  reset: () => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  const setLoading = useCallback((loading: boolean) => dispatch({ type: "SET_LOADING", loading }), []);
  const setError = useCallback((error: string | null) => dispatch({ type: "SET_ERROR", error }), []);
  const setRecommendation = useCallback((rec: RecommendResponse | null) => dispatch({ type: "SET_RECOMMENDATION", recommendation: rec }), []);
  const setChatResponse = useCallback((res: ChatResponse | null) => dispatch({ type: "SET_CHAT_RESPONSE", chatResponse: res }), []);
  const setInsight = useCallback((insight: InsightResponse | null) => dispatch({ type: "SET_INSIGHT", insight }), []);
  const addMessage = useCallback((msg: Message) => dispatch({ type: "ADD_MESSAGE", message: msg }), []);
  const clearChat = useCallback(() => dispatch({ type: "CLEAR_CHAT" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <AgentContext
      value={{
        ...state,
        setLoading, setError, setRecommendation, setChatResponse,
        setInsight, addMessage, clearChat, reset,
      }}
    >
      {children}
    </AgentContext>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
