// ─── Currency Pairs ────────────────────────────────────────

export interface CurrencyPair {
  base: string;
  quote: string;
  name: string;
}

export const MAJOR_PAIRS: CurrencyPair[] = [
  { base: "EUR", quote: "USD", name: "Euro / US Dollar" },
  { base: "GBP", quote: "USD", name: "British Pound / US Dollar" },
  { base: "USD", quote: "JPY", name: "US Dollar / Japanese Yen" },
  { base: "USD", quote: "CHF", name: "US Dollar / Swiss Franc" },
  { base: "USD", quote: "CAD", name: "US Dollar / Canadian Dollar" },
  { base: "AUD", quote: "USD", name: "Australian Dollar / US Dollar" },
  { base: "NZD", quote: "USD", name: "New Zealand Dollar / US Dollar" },
];

export const CROSS_PAIRS: CurrencyPair[] = [
  { base: "EUR", quote: "GBP", name: "Euro / British Pound" },
  { base: "EUR", quote: "JPY", name: "Euro / Japanese Yen" },
  { base: "GBP", quote: "JPY", name: "British Pound / Japanese Yen" },
  { base: "AUD", quote: "JPY", name: "Australian Dollar / Japanese Yen" },
];

export const EM_PAIRS: CurrencyPair[] = [
  { base: "USD", quote: "MXN", name: "US Dollar / Mexican Peso" },
  { base: "USD", quote: "MYR", name: "US Dollar / Malaysian Ringgit" },
  { base: "USD", quote: "SGD", name: "US Dollar / Singapore Dollar" },
  { base: "USD", quote: "BRL", name: "US Dollar / Brazilian Real" },
];

export const ALL_PAIRS: CurrencyPair[] = [
  ...MAJOR_PAIRS,
  ...CROSS_PAIRS,
  ...EM_PAIRS,
];

export function pairToString(pair: CurrencyPair): string {
  return `${pair.base}/${pair.quote}`;
}

export function pairToSlug(pair: CurrencyPair): string {
  return `${pair.base}-${pair.quote}`;
}

// ─── Live Rates ────────────────────────────────────────────

export interface LiveRate {
  pair: string;
  rate: number;
  bid: number;
  offer: number;
  spreadPct: number;
  change24h: number | null;
  change24hPct: number | null;
  timestamp: string;
}

// ─── OHLCV (Historical) ───────────────────────────────────

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// ─── Technical Analysis ────────────────────────────────────

export interface TechnicalSignals {
  pair: string;
  rsi: number;
  rsiSignal: string;
  macd: number;
  macdSignalLine: number;
  macdCrossover: string;
  ema50: number;
  ema200: number;
  emaSignal: string;
  bollingerUpper: number;
  bollingerLower: number;
  bollingerSignal: string;
  overallSignal: string;
  timestamp: string;
}

// ─── Volatility ────────────────────────────────────────────

export interface VolatilityData {
  pair: string;
  volatility30d: number;
  volatilityAnnualized: number;
  timestamp: string;
}

// ─── Forecasts ─────────────────────────────────────────────

export type ModelType = "nn" | "arima" | "seasonal" | "ensemble";

export interface ForecastPoint {
  date: string;
  predicted: number;
  lowerCi: number;
  upperCi: number;
}

export interface ForecastMetrics {
  rmse: number;
  mae: number;
  directionalAccuracy: number;
  aic?: number;
}

export interface EnsembleMetrics {
  nn: ForecastMetrics;
  arima: ForecastMetrics & { aic: number };
  seasonal: ForecastMetrics;
  weights: Record<string, number>;
}

export interface ForecastResult {
  pair: string;
  modelType: string;
  horizonDays: number;
  forecast: ForecastPoint[];
  metrics: ForecastMetrics | EnsembleMetrics;
}

// ─── Hedging ───────────────────────────────────────────────

export type PositionType = "receivable" | "payable";

export interface ForwardResult {
  strategy: string;
  position: string;
  notional: number;
  spotRate: number;
  forwardRate: number;
  days: number;
  lockedValue: number;
  premiumPoints: number;
  premiumAnnualizedPct: number;
  pnlTable: Array<{
    spot: number;
    unhedged: number;
    hedged: number;
    hedgeBenefit: number;
  }>;
}

export interface MoneyMarketResult {
  strategy: string;
  position: string;
  notional: number;
  spotRate: number;
  days: number;
  effectiveRate: number;
  proceeds: number;
  cashFlowSteps: Array<{
    step: number;
    action: string;
    amount: number;
    currency: string;
  }>;
}

export interface OptionResult {
  strategy: string;
  optionType: string;
  position: string;
  notional: number;
  spotRate: number;
  strikePrice: number;
  premium: number;
  totalPremiumCost: number;
  breakeven: number;
  pnlTable: Array<{
    spot: number;
    intrinsicValue: number;
    buyerPnl: number;
    sellerPnl: number;
    exercised: boolean;
  }>;
}

export interface StraddleResult {
  strategy: string;
  notional: number;
  strikePrice: number;
  callPremium: number;
  putPremium: number;
  totalPremium: number;
  totalPremiumCost: number;
  maxLoss: number;
  breakevenUpper: number;
  breakevenLower: number;
  pnlTable: Array<{
    spot: number;
    netPnl: number;
    callIntrinsic: number;
    putIntrinsic: number;
  }>;
}

export interface StrangleResult {
  strategy: string;
  notional: number;
  callStrike: number;
  putStrike: number;
  callPremium: number;
  putPremium: number;
  totalPremium: number;
  totalPremiumCost: number;
  maxLoss: number;
  breakevenUpper: number;
  breakevenLower: number;
  pnlTable: Array<{
    spot: number;
    netPnl: number;
    callIntrinsic: number;
    putIntrinsic: number;
    inMaxLossZone: boolean;
  }>;
}

export interface CarryTradeResult {
  strategy: string;
  ownFunds: number;
  borrowedAmount: number;
  borrowRate: number;
  investRate: number;
  initialSpot: number;
  days: number;
  interestDifferentialBps: number;
  baseCaseProfit: number;
  pnlTable: Array<{
    endingSpot: number;
    spotChangePct: number;
    convertedProceeds: number;
    loanRepayment: number;
    profit: number;
  }>;
}

export interface ComparisonEntry {
  strategy: string;
  expectedOutcome: number;
  bestCase: number;
  worstCase: number;
  hedgeCost: number;
}

export interface StrategyComparison {
  pair: string;
  position: string;
  notional: number;
  spotRate: number;
  forwardRate: number;
  days: number;
  comparisonTable: ComparisonEntry[];
  forwardDetail: ForwardResult;
  moneyMarketDetail: MoneyMarketResult;
  optionDetail: OptionResult;
}

// ─── Hedging Inputs ────────────────────────────────────────

export interface ForwardInput {
  pair: string;
  position: PositionType;
  notional: number;
  days: number;
  spotRate: number;
  forwardRate: number;
  domesticRate?: number;
  foreignRate?: number;
}

export interface MoneyMarketInput {
  pair: string;
  position: PositionType;
  notional: number;
  days: number;
  spotRate: number;
  domesticDepositRate: number;
  domesticBorrowRate: number;
  foreignDepositRate: number;
  foreignBorrowRate: number;
}

export interface OptionInput {
  pair: string;
  position: PositionType;
  optionType: string;
  notional: number;
  days: number;
  spotRate: number;
  strikePrice: number;
  premium: number;
  volatility?: number;
  domesticRate?: number;
  foreignRate?: number;
}

export interface StraddleInput {
  pair: string;
  notional: number;
  spotRate: number;
  strikePrice: number;
  callPremium: number;
  putPremium: number;
}

export interface CarryTradeInput {
  pair: string;
  notional: number;
  ownFunds: number;
  borrowedAmount: number;
  days: number;
  initialSpot: number;
  borrowRate: number;
  investRate: number;
}

export interface CompareInput {
  pair: string;
  position: PositionType;
  notional: number;
  days: number;
  spotRate: number;
  forwardRate: number;
  domesticRate: number;
  foreignRate: number;
  strikePrice?: number;
  premium?: number;
}

// ─── Parity ────────────────────────────────────────────────

export interface IRPData {
  pair: string;
  spot: number;
  rDomestic: number;
  rForeign: number;
  curve: Array<{
    tenor: string;
    days: number;
    forwardRate: number;
    premiumPct: number;
  }>;
}

export interface IRPDeviationData {
  pair: string;
  actualForward: number;
  irpForward: number;
  deviationPct: number;
  arbitrageSignal: boolean;
}

export interface PPPData {
  pppImpliedRate: number;
  currentSpot: number;
  deviationPct: number;
  signal: string;
  approxChangePct: number;
}

// ─── Scenarios ─────────────────────────────────────────────

export interface MonteCarloInput {
  pair: string;
  spot: number;
  drift?: number;
  volatility: number;
  days: number;
  numSimulations?: number;
}

export interface MonteCarloResult {
  spot: number;
  drift: number;
  volatility: number;
  days: number;
  numSimulations: number;
  terminalStats: {
    mean: number;
    median: number;
    std: number;
    p5: number;
    p25: number;
    p75: number;
    p95: number;
    min: number;
    max: number;
  };
  meanPath: number[];
  p5Path: number[];
  p25Path: number[];
  p75Path: number[];
  p95Path: number[];
  samplePaths: number[][];
}

export interface StressScenario {
  scenario: string;
  shockPct: number;
  originalSpot: number;
  stressedSpot: number;
}

export interface HedgeEffectivenessScenario {
  scenario: string;
  shockPct: number;
  stressedSpot: number;
  strategies: Record<string, number>;
  bestStrategy: string;
}

export interface HedgeEffectivenessResult {
  position: string;
  notional: number;
  baseSpot: number;
  forwardRate: number;
  days: number;
  scenarios: HedgeEffectivenessScenario[];
}
