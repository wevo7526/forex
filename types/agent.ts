// ─── Agent Context Types ───────────────────────────────────

export interface AgentRecommendation {
  primaryStrategy: string;
  confidence: number;
  rationale: string;
  alternativeStrategy: string;
  riskWarning: string;
}

export interface AgentMarketContext {
  spotRate: number;
  trend: string;
  technicalSignal: string;
  spreadPct: number;
}

export interface AgentPredictionContext {
  direction: string;
  confidence: number;
  horizonDays: number;
  predictedRate: number;
}

export interface AgentHedgingContext {
  recommendedStrategy: string;
  strategiesCompared: unknown[];
}

export interface AgentRiskContext {
  volatilityScore: number;
  irpArbitrageOpportunity: boolean;
  carryTradeRisk: string;
  tailRiskPct: number;
  recommendedHedgeType: string;
}

// ─── Agent Response Types ─────────────────────────────────

export interface RecommendResponse {
  pair: string;
  recommendation: AgentRecommendation;
  marketContext: AgentMarketContext;
  predictionContext: AgentPredictionContext;
  hedgingContext: AgentHedgingContext;
  riskContext: AgentRiskContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agentsCalled: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reasoningTrace: any[];
  error: string | null;
}

export interface ChatResponse {
  query: string;
  pair: string;
  recommendation: AgentRecommendation | null;
  marketContext: AgentMarketContext | null;
  predictionContext: AgentPredictionContext | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agentsCalled: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reasoningTrace: any[];
  error: string | null;
}

export interface InsightResponse {
  pair: string;
  summary: string;
  signal: string;
  spotRate: number;
  technicalSignal: string;
  spreadPct: number;
}

// ─── Chat UI Types ────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}
