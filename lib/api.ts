import type {
  LiveRate,
  OHLCV,
  TechnicalSignals,
  VolatilityData,
  ForecastResult,
  ModelType,
  ForwardInput,
  ForwardResult,
  MoneyMarketInput,
  MoneyMarketResult,
  OptionInput,
  OptionResult,
  StraddleInput,
  StraddleResult,
  StrangleResult,
  CarryTradeInput,
  CarryTradeResult,
  CompareInput,
  StrategyComparison,
  IRPData,
  IRPDeviationData,
  PPPData,
  MonteCarloInput,
  MonteCarloResult,
  StressScenario,
  HedgeEffectivenessResult,
} from "@/types/forex";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Case converters ──────────────────────────────────────

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

function toSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map((item) => toSnakeCase(item));
  if (obj !== null && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`
        );
        (acc as Record<string, unknown>)[snakeKey] = toSnakeCase(value);
        return acc;
      },
      {} as Record<string, unknown>
    );
  }
  return obj;
}

// ─── Generic fetch wrapper ─────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody.detail
        ? typeof errBody.detail === "string"
          ? errBody.detail
          : JSON.stringify(errBody.detail)
        : JSON.stringify(errBody);
    } catch { /* ignore parse errors */ }
    throw new Error(
      `API error: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`
    );
  }
  const json = await res.json();
  return toCamelCase<T>(json);
}

function postBody(input: unknown): RequestInit {
  return { method: "POST", body: JSON.stringify(toSnakeCase(input)) };
}

// ─── Rates ─────────────────────────────────────────────────

export async function fetchAllRates(): Promise<Record<string, LiveRate>> {
  const data = await apiFetch<{ rates: LiveRate[]; count: number; timestamp: string }>(
    "/api/rates/live"
  );
  const map: Record<string, LiveRate> = {};
  for (const rate of data.rates) {
    map[rate.pair] = rate;
  }
  return map;
}

export async function fetchRate(pair: string): Promise<LiveRate> {
  return apiFetch(`/api/rates/live/${pair.replace("/", "-")}`);
}

export async function fetchHistorical(
  pair: string,
  interval = "daily",
  from?: string,
  to?: string
): Promise<OHLCV[]> {
  const params = new URLSearchParams({ interval });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch(`/api/rates/historical/${pair.replace("/", "-")}?${params}`);
}

// ─── Predictions ──────────────────────────────────────────

export async function fetchForecast(
  pair: string,
  model: ModelType = "ensemble",
  horizonDays = 7
): Promise<ForecastResult> {
  return apiFetch(
    `/api/predictions/${pair.replace("/", "-")}/${model}?horizon=${horizonDays}`
  );
}

export async function fetchSignals(pair: string): Promise<TechnicalSignals> {
  return apiFetch(`/api/predictions/${pair.replace("/", "-")}/signals`);
}

export async function fetchVolatility(pair: string): Promise<VolatilityData> {
  return apiFetch(`/api/predictions/${pair.replace("/", "-")}/volatility`);
}

// ─── Hedging ─────────────────────────────────────────────

export async function calculateForward(input: ForwardInput): Promise<ForwardResult> {
  return apiFetch("/api/hedging/forward", postBody(input));
}

export async function calculateMoneyMarket(input: MoneyMarketInput): Promise<MoneyMarketResult> {
  return apiFetch("/api/hedging/money-market", postBody(input));
}

export async function calculateOption(input: OptionInput): Promise<OptionResult> {
  return apiFetch(`/api/hedging/options/${input.optionType}`, postBody(input));
}

export async function calculateStraddle(input: StraddleInput): Promise<StraddleResult> {
  return apiFetch("/api/hedging/options/straddle", postBody(input));
}

export async function calculateStrangle(input: StraddleInput): Promise<StrangleResult> {
  return apiFetch("/api/hedging/options/strangle", postBody(input));
}

export async function calculateCarryTrade(input: CarryTradeInput): Promise<CarryTradeResult> {
  return apiFetch("/api/hedging/carry-trade", postBody(input));
}

export async function compareStrategies(input: CompareInput): Promise<StrategyComparison> {
  return apiFetch("/api/hedging/compare", postBody(input));
}

// ─── Parity ───────────────────────────────────────────────

export async function fetchIRPData(
  pair: string,
  spot: number,
  rDomestic: number,
  rForeign: number
): Promise<IRPData> {
  const params = new URLSearchParams({
    spot: String(spot),
    r_domestic: String(rDomestic),
    r_foreign: String(rForeign),
  });
  return apiFetch(`/api/parity/irp/${pair.replace("/", "-")}?${params}`);
}

export async function fetchIRPDeviation(
  pair: string,
  spot: number,
  actualForward: number,
  rDomestic: number,
  rForeign: number
): Promise<IRPDeviationData> {
  const params = new URLSearchParams({
    spot: String(spot),
    actual_forward: String(actualForward),
    r_domestic: String(rDomestic),
    r_foreign: String(rForeign),
  });
  return apiFetch(`/api/parity/irp-deviation/${pair.replace("/", "-")}?${params}`);
}

export async function fetchPPPData(
  pair: string,
  spot: number,
  inflationDomestic: number,
  inflationForeign: number
): Promise<PPPData> {
  const params = new URLSearchParams({
    spot: String(spot),
    inflation_domestic: String(inflationDomestic),
    inflation_foreign: String(inflationForeign),
  });
  return apiFetch(`/api/parity/ppp/${pair.replace("/", "-")}?${params}`);
}

// ─── Scenarios ────────────────────────────────────────────

export async function runMonteCarlo(input: MonteCarloInput): Promise<MonteCarloResult> {
  return apiFetch("/api/scenarios/monte-carlo", postBody(input));
}

export async function runStressTest(pair: string, spot: number): Promise<StressScenario[]> {
  return apiFetch("/api/scenarios/stress-test", postBody({ pair, spot }));
}

export async function runHedgeEffectiveness(input: {
  position: string;
  notional: number;
  spotRate: number;
  forwardRate: number;
  days: number;
}): Promise<HedgeEffectivenessResult> {
  return apiFetch("/api/scenarios/hedge-effectiveness", postBody(input));
}
