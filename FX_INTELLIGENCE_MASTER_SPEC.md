# FX Intelligence Platform
## Complete Technical Specification & Build Roadmap
### For Claude Code Ingestion — Single Source of Truth

> **What this is**: A production-grade international finance platform combining live forex market data, professional hedging strategy visualizations, Python-powered predictive modeling, and a multi-agent AI system that synthesizes all of the above into actionable strategy recommendations. Built for classroom demonstration and real-world finance use.
>
> **Stack**: Next.js 15 (frontend) · FastAPI + Python (backend) · PostgreSQL + Redis (data) · LangGraph + Claude Sonnet 4.6 (agents)
>
> **Build order**: Follow phases 1–14 sequentially. Each phase has a testable checkpoint before moving forward.

---

## Table of Contents

1. [Platform Overview & Philosophy](#1-platform-overview--philosophy)
2. [Full System Architecture](#2-full-system-architecture)
3. [Complete Repository Structure](#3-complete-repository-structure)
4. [Data Layer — External APIs & Caching](#4-data-layer--external-apis--caching)
5. [Backend — FastAPI Service](#5-backend--fastapi-service)
6. [ML Engine — Predictive Modeling](#6-ml-engine--predictive-modeling)
7. [Hedging Engine — Strategy Calculations](#7-hedging-engine--strategy-calculations)
8. [Scenario Engine — Stress Testing](#8-scenario-engine--stress-testing)
9. [AI Agent System](#9-ai-agent-system)
10. [All API Endpoints](#10-all-api-endpoints)
11. [Database Schema](#11-database-schema)
12. [Frontend — Next.js Application](#12-frontend--nextjs-application)
13. [Frontend — Pages & Visualizations](#13-frontend--pages--visualizations)
14. [Frontend — Agent UI Components](#14-frontend--agent-ui-components)
15. [Environment Configuration](#15-environment-configuration)
16. [Build Phases (1–14)](#16-build-phases-114)
17. [Key Technical Decisions](#17-key-technical-decisions)
18. [Demo Script](#18-demo-script)
19. [Quick Start Commands](#19-quick-start-commands)

---

## 1. Platform Overview & Philosophy

This platform has three layers, each building on the one below it:

**Layer 1 — Data & Computation**: Live forex rates feed a backend that computes every hedging strategy, parity condition, and risk metric with deterministic, auditable math. No estimates. Every number traces to a real data source.

**Layer 2 — Visualization**: The frontend makes those numbers legible through professional-grade charts — payoff diagrams, Monte Carlo paths, IRP curves, forecast bands. Each page maps to a real concept in international finance.

**Layer 3 — Agent Intelligence**: A multi-agent system powered by Claude Sonnet 4.6 reads the outputs of Layers 1 and 2 and reasons through them to recommend a hedging strategy. The agents don't guess — they interpret real computed data and explain their logic transparently, step by step.

The key architectural principle: **the agents are interpreters, not oracles**. All math runs in the Python engines. The agents read those results and synthesize them into a recommendation with full reasoning trace. This makes the system auditable — critical for academic credibility.

---

## 2. Full System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            NEXT.JS 15 FRONTEND                               │
│   App Router · TypeScript · Tailwind CSS · Recharts · D3.js · lightweight-charts │
│                                                                              │
│  ┌───────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐  ┌────────┐ │
│  │   Live    │  │   Hedging    │  │ Predictive │  │ Scenario │  │   AI   │ │
│  │ Dashboard │  │  Simulator   │  │   Models   │  │ Builder  │  │ Agent  │ │
│  └───────────┘  └──────────────┘  └────────────┘  └──────────┘  └────────┘ │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │  HTTP REST + WebSocket + SSE
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                          FASTAPI BACKEND (Python)                            │
│         Uvicorn · Pydantic v2 · SQLAlchemy Async · WebSocket Manager        │
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Rates   │  │ Hedging  │  │    ML    │  │ Scenario │  │  AI Agent    │  │
│  │  Router  │  │  Engine  │  │  Engine  │  │  Engine  │  │  Router+Graph│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
└────────┬─────────────────────────────────────────────────┬───────────────────┘
         │                                                 │
┌────────▼────────┐                             ┌──────────▼──────────┐
│   PostgreSQL    │                             │   External APIs     │
│   + Redis       │                             │   Alpha Vantage     │
│   (Cache+DB)    │                             │   Frankfurter (ECB) │
└─────────────────┘                             └─────────────────────┘
```

### Real-Time Data Flow

```
Alpha Vantage API
      │
      │  HTTP poll every 60s (FastAPI background asyncio task)
      ▼
FastAPI Background Service
      │
      ├──▶ Redis cache (TTL = 60s)           ← instant reads for all endpoints
      ├──▶ PostgreSQL rate_snapshots table   ← persistent historical record
      └──▶ WebSocket broadcast manager
                    │
                    ▼  pushes to all subscribers
      Next.js WebSocket clients (react-use-websocket)
                    │
                    ├──▶ Zustand global store update
                    └──▶ React components re-render
                               ├── Rate cards animate (Framer Motion)
                               ├── Ticker scrolls new prices
                               └── Active charts update live
```

### Agent Data Flow

```
User triggers analysis (manual / chat / auto-threshold)
      │
      ▼
Orchestrator Agent  ──▶  routes to required specialist agents
      │
      ├──▶ Market Analyst Agent
      │         └── calls: get_live_rate, get_irp_deviation, get_technical_signals
      │
      ├──▶ Prediction Interpreter Agent
      │         └── calls: get_ensemble_forecast
      │
      ├──▶ Hedging Strategist Agent  ─┐  (parallel)
      │         └── calls: compare_hedging_strategies
      │                               │
      └──▶ Risk Assessor Agent ───────┘
                └── calls: run_stress_test, get_ppp_signal
                                       │
                                       ▼
                            Synthesis Agent
                                  │
                                  ▼  streams via SSE
                            Frontend AI Strategy Panel
```

---

## 3. Complete Repository Structure

```
fx-intelligence/
│
├── frontend/                               # Next.js 15 Application
│   ├── app/
│   │   ├── layout.tsx                      # Root layout, global nav, theme
│   │   ├── page.tsx                        # Redirect → /dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # Live rates overview (home)
│   │   │   └── [pair]/
│   │   │       └── page.tsx                # Individual pair deep-dive
│   │   ├── hedging/
│   │   │   ├── page.tsx                    # Strategy selector overview
│   │   │   ├── forward/page.tsx
│   │   │   ├── money-market/page.tsx
│   │   │   ├── options/page.tsx
│   │   │   ├── straddle/page.tsx
│   │   │   └── carry-trade/page.tsx
│   │   ├── predictions/
│   │   │   ├── page.tsx                    # Model overview + pair selector
│   │   │   └── [pair]/page.tsx             # Pair-specific forecast page
│   │   ├── parity/
│   │   │   └── page.tsx                    # IRP + PPP visualizations
│   │   ├── scenarios/
│   │   │   └── page.tsx                    # What-if / Monte Carlo builder
│   │   └── agent/
│   │       ├── page.tsx                    # Full AI agent strategy page
│   │       └── chat/page.tsx              # Multi-turn agent chat interface
│   │
│   ├── components/
│   │   ├── charts/
│   │   │   ├── CandlestickChart.tsx        # TradingView lightweight-charts
│   │   │   ├── ForwardPayoffDiagram.tsx    # Recharts ComposedChart
│   │   │   ├── OptionsPayoffDiagram.tsx    # D3.js hockey-stick
│   │   │   ├── MonteCarloChart.tsx         # D3.js spaghetti paths
│   │   │   ├── ForecastChart.tsx           # Recharts AreaChart + CI bands
│   │   │   ├── IRPCurveChart.tsx           # Forward curve vs. IRP theory
│   │   │   ├── PPPScatterPlot.tsx          # D3.js scatter
│   │   │   ├── HeatMap.tsx                 # Currency strength grid
│   │   │   ├── VolatilityChart.tsx         # Rolling 30d volatility
│   │   │   └── CarryTradeHeatMap.tsx       # 2D sensitivity surface
│   │   ├── hedging/
│   │   │   ├── StrategyCard.tsx
│   │   │   ├── StrategyComparisonTable.tsx
│   │   │   ├── CashFlowTimeline.tsx        # Money market visual
│   │   │   └── HedgeInputForm.tsx
│   │   ├── agent/
│   │   │   ├── AgentStrategyPanel.tsx      # Main agent UI (streaming)
│   │   │   ├── AgentReasoningTrace.tsx     # Expandable tool-call trace
│   │   │   ├── AgentChatInterface.tsx      # Multi-turn chat
│   │   │   └── DashboardInsightWidget.tsx  # Lightweight dashboard widget
│   │   ├── dashboard/
│   │   │   ├── FXTicker.tsx               # Scrolling live ticker
│   │   │   ├── RateCard.tsx               # Pair card with sparkline
│   │   │   ├── CrossRateMatrix.tsx
│   │   │   └── TechnicalSignalBadge.tsx
│   │   └── ui/                             # shadcn/ui primitives
│   │
│   ├── lib/
│   │   ├── api.ts                          # Typed FastAPI REST client
│   │   ├── ws.ts                           # WebSocket connection manager
│   │   ├── sse.ts                          # SSE client for agent streaming
│   │   └── calculations.ts                 # Client-side FX math utilities
│   │
│   ├── store/
│   │   ├── ratesStore.ts                   # Zustand: live rates state
│   │   └── agentStore.ts                   # Zustand: agent session state
│   │
│   └── types/
│       ├── forex.ts                        # All FX TypeScript types
│       └── agent.ts                        # Agent response types
│
├── backend/                                # FastAPI Python Application
│   ├── main.py                             # App entry, CORS, router registration
│   │
│   ├── routers/
│   │   ├── rates.py                        # Spot rates, historical, cross rates
│   │   ├── hedging.py                      # All hedging strategy endpoints
│   │   ├── predictions.py                  # ML model inference endpoints
│   │   ├── parity.py                       # IRP / PPP endpoints
│   │   ├── scenarios.py                    # Monte Carlo, stress test endpoints
│   │   └── agent.py                        # Agent run, chat, insight endpoints
│   │
│   ├── services/
│   │   ├── fx_fetcher.py                   # Alpha Vantage + Frankfurter client
│   │   ├── cache.py                        # Redis async wrapper
│   │   ├── websocket_manager.py            # WS broadcast manager
│   │   └── db.py                           # SQLAlchemy async session factory
│   │
│   ├── models/
│   │   ├── orm.py                          # SQLAlchemy ORM table definitions
│   │   └── schemas.py                      # Pydantic request/response models
│   │
│   ├── engines/
│   │   ├── hedging_engine.py               # All 5 hedging strategy calculators
│   │   ├── parity_engine.py                # IRP / PPP computation engine
│   │   └── scenario_engine.py              # Monte Carlo + stress test engine
│   │
│   ├── ml/
│   │   ├── features.py                     # Feature engineering pipeline
│   │   ├── lstm_model.py                   # LSTM model (Keras)
│   │   ├── arima_model.py                  # Auto-ARIMA wrapper (statsmodels)
│   │   ├── prophet_model.py                # Facebook Prophet wrapper
│   │   ├── ensemble.py                     # Weighted ensemble combiner
│   │   └── trained/                        # Serialized model weights
│   │       ├── EUR_USD_lstm.h5
│   │       ├── EUR_USD_arima.pkl
│   │       └── EUR_USD_prophet.pkl
│   │
│   ├── agents/
│   │   ├── graph.py                        # LangGraph StateGraph definition
│   │   ├── state.py                        # Shared AgentState Pydantic model
│   │   ├── orchestrator.py                 # Routing / coordination node
│   │   ├── market_analyst.py               # Market conditions agent
│   │   ├── prediction_interpreter.py       # ML output interpreter agent
│   │   ├── hedging_strategist.py           # Strategy selection agent
│   │   ├── risk_assessor.py               # Risk scoring agent
│   │   ├── synthesizer.py                  # Final recommendation agent
│   │   ├── tools/
│   │   │   ├── rate_tools.py               # Tool: live rates, spreads, IRP deviation
│   │   │   ├── prediction_tools.py         # Tool: ML forecasts, signals
│   │   │   ├── hedging_tools.py            # Tool: run hedge comparisons
│   │   │   ├── parity_tools.py             # Tool: IRP/PPP computations
│   │   │   └── scenario_tools.py           # Tool: stress tests, Monte Carlo
│   │   └── prompts/
│   │       ├── orchestrator.md
│   │       ├── market_analyst.md
│   │       ├── prediction_interpreter.md
│   │       ├── hedging_strategist.md
│   │       ├── risk_assessor.md
│   │       └── synthesizer.md
│   │
│   └── requirements.txt
│
├── docker-compose.yml                      # PostgreSQL + Redis
├── .env.example
└── README.md
```

---

## 4. Data Layer — External APIs & Caching

### Primary Data Source: Alpha Vantage

Free tier: 25 requests/day, 500/month — sufficient for demo and development.

| Endpoint | Use | Interval |
|----------|-----|----------|
| `CURRENCY_EXCHANGE_RATE` | Real-time spot rate, bid/offer | Polled every 60s |
| `FX_INTRADAY` | OHLCV candles | 1min, 5min, 15min, 60min |
| `FX_DAILY` | Daily historical rates | Up to 20 years |
| `FX_WEEKLY` / `FX_MONTHLY` | Long-term trend data | As needed |

Sign up: https://www.alphavantage.co/support/#api-key (instant, free)

### Fallback: Frankfurter API (ECB)

Completely free, no API key, European Central Bank sourced. Used for historical ML training data and when Alpha Vantage rate limit is hit.

```
https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CAD,AUD,CHF
https://api.frankfurter.app/2020-01-01..2025-01-01?from=EUR&to=USD
```

### Currency Pairs

```
Major:   EUR/USD  GBP/USD  USD/JPY  USD/CHF  USD/CAD  AUD/USD  NZD/USD
Cross:   EUR/GBP  EUR/JPY  GBP/JPY  AUD/JPY
EM:      USD/MXN  USD/MYR  USD/SGD  USD/BRL
```

### Redis Caching TTLs

| Data Type | TTL |
|-----------|-----|
| Real-time spot rates | 60 seconds |
| Intraday OHLCV | 5 minutes |
| Daily historical | 24 hours |
| ML predictions | 6 hours |
| Agent recommendations | 10 minutes |

---

## 5. Backend — FastAPI Service

### Complete requirements.txt

```
# Core
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.8.0
python-dotenv==1.0.0
httpx==0.27.0

# Database
sqlalchemy[asyncio]==2.0.0
asyncpg==0.29.0

# Cache
redis[asyncio]==5.0.0

# ML Stack
tensorflow==2.16.0
keras==3.3.0
scikit-learn==1.5.0
pandas==2.2.0
numpy==1.26.0
statsmodels==0.14.0
prophet==1.1.5
scipy==1.13.0
ta==0.11.0
joblib==1.4.0

# Agent Framework
langchain-core==0.3.0
langgraph==0.2.0
langchain-anthropic==0.2.0
anthropic==0.40.0

# Streaming
sse-starlette==2.1.0
```

### WebSocket Manager

The backend runs a single broadcast manager. A FastAPI startup background task polls Alpha Vantage every 60 seconds and broadcasts new rates to all subscribed clients simultaneously.

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, pair: str):
        await websocket.accept()
        self.active_connections.setdefault(pair, []).append(websocket)

    async def disconnect(self, websocket: WebSocket, pair: str):
        self.active_connections[pair].remove(websocket)

    async def broadcast_rate(self, pair: str, data: dict):
        for connection in self.active_connections.get(pair, []):
            await connection.send_json(data)

    async def broadcast_all(self, data: dict):
        for pair_connections in self.active_connections.values():
            for connection in pair_connections:
                await connection.send_json(data)
```

---

## 6. ML Engine — Predictive Modeling

### Model 1: LSTM (Primary Forecasting Model)

**Architecture**:
```python
Sequential([
    LSTM(128, return_sequences=True, input_shape=(60, n_features)),
    Dropout(0.2),
    LSTM(64, return_sequences=False),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(forecast_horizon)    # 7, 14, or 30 days
])
# Optimizer: Adam (lr=0.001) | Loss: MSE | Metric: RMSE, MAE, Directional Accuracy %
```

**Input features** (all normalized):
- OHLCV (Open, High, Low, Close, Volume)
- RSI, MACD, MACD Signal, Bollinger Bands (upper/mid/lower), ATR
- EMA 12, EMA 26, EMA 50, EMA 200
- Interest rate differential (from parity engine)
- Lookback window: 60 days

**Training data**: 5 years of daily FX_DAILY from Frankfurter API
**Split**: 70% train / 15% validation / 15% test
**Serialized to**: `ml/trained/{PAIR}_lstm.h5`

### Model 2: ARIMA (Statistical Baseline)

- Auto-selects p, d, q order via AIC criterion using `statsmodels`
- Produces 95% confidence intervals displayed as bands on forecast chart
- Interpretable baseline — useful for comparing to LSTM

### Model 3: Facebook Prophet (Trend + Seasonality)

- Captures weekly and annual FX seasonality
- Robust to outliers and structural breaks (regime changes)
- Best for 30–90 day horizon forecasts

### Ensemble Combiner

Weighted average across all three models:
- LSTM: 50% weight
- ARIMA: 25% weight
- Prophet: 25% weight
- Weights configurable via API parameter
- Reports ensemble RMSE vs. individual model RMSE for transparency

### Technical Signals Engine

Generates **Buy / Sell / Hold** per pair based on:
- RSI: overbought (>70) → Sell signal, oversold (<30) → Buy signal
- MACD: bullish crossover → Buy, bearish crossover → Sell
- EMA: 50/200 golden cross → Buy, death cross → Sell
- Bollinger Band breakout: close above upper → overbought, below lower → oversold

---

## 7. Hedging Engine — Strategy Calculations

All calculations run in `engines/hedging_engine.py`. Every strategy returns a complete P&L table across a ±15% spot rate range (not just a single number), which directly powers the visualization charts.

### Forward Contract Engine

**Inputs**: `notional, spot_rate, forward_rate, days, position (receivable|payable)`

**Outputs**:
- Locked-in domestic currency proceeds / cost
- Forward premium in points and annualized %: `[(F - S) / S] × (360 / days)`
- P&L vs. unhedged across full spot rate range

### Money Market Hedge Engine

**Inputs**: `notional, spot_rate, domestic_rates {deposit, borrow}, foreign_rates {deposit, borrow}, days, position`

**Receivable hedge logic**:
1. Borrow PV of receivable at foreign borrowing rate: `PV = notional / (1 + r_foreign_borrow)`
2. Convert borrowed foreign currency to domestic at spot
3. Invest domestic proceeds at domestic deposit rate
4. Use foreign receivable at maturity to repay foreign loan
5. Proceeds = `domestic_invested × (1 + r_domestic_deposit)`

**Payable hedge logic**:
1. Borrow domestic at domestic borrowing rate
2. Convert to foreign at spot
3. Invest foreign at foreign deposit rate: `PV = notional / (1 + r_foreign_deposit)`
4. Use foreign proceeds to pay obligation at maturity
5. Cost = `PV_foreign × spot_rate × (1 + r_domestic_borrow)`

**Output**: Step-by-step cash flow table at each node + all-in effective rate

### Options Engine

**Inputs**: `notional, spot_rate, strike_price, premium, contract_size, option_type (call|put), position`

**Call option** (right to BUY):
- Exercise if: `spot > strike`
- Buyer net profit per unit: `(spot - strike - premium)` if exercised, `-premium` if not
- Seller net profit per unit: `premium - max(0, spot - strike)`

**Put option** (right to SELL):
- Exercise if: `spot < strike`
- Buyer net profit per unit: `(strike - spot - premium)` if exercised, `-premium` if not
- Seller net profit per unit: `premium - max(0, strike - spot)`

**Straddle** (buy call + buy put, same strike):
- Total premium = call premium + put premium (max loss)
- Break-even upper: `strike + total_premium`
- Break-even lower: `strike - total_premium`
- Net profit at expiry: `|spot - strike| - total_premium`

**Strangle** (buy call at higher strike + buy put at lower strike):
- Break-even upper: `call_strike + total_premium`
- Break-even lower: `put_strike - total_premium`
- Max loss zone: `put_strike ≤ spot ≤ call_strike`

### Carry Trade Engine

**Inputs**: `own_funds, borrowed_amount, borrow_currency, invest_currency, borrow_rate, invest_rate, initial_spot, final_spot_distribution`

**Logic**:
1. Convert borrowed foreign currency to investment currency at spot
2. Pool with own funds → invest at high-yield rate
3. At maturity: convert proceeds back at ending spot rate
4. Repay borrowed currency (now potentially more expensive)
5. Profit = converted proceeds - loan repayment (in reporting currency)

**Output**: Expected P&L at base case + full sensitivity table across ending spot rate range

### Strategy Comparison Engine

`POST /api/hedging/compare` — runs all strategies simultaneously and returns a unified table:

| Strategy | Expected Outcome | Best Case | Worst Case | Hedge Cost |
|----------|-----------------|-----------|------------|------------|
| Unhedged | Probabilistic weighted avg | Spot best | Spot worst | $0 |
| Forward | Locked-in rate × notional | = Forward | = Forward | Opportunity cost |
| Money Market | ≈ Forward (may differ by IRP gap) | ≈ Fwd | ≈ Fwd | Interest differential |
| Put Option (recv) | Floor at strike, upside open | Spot - premium | Strike - premium | Premium paid |
| Call Option (pay) | Cap at strike, downside open | Spot + premium | Strike + premium | Premium paid |
| Carry Trade | Interest differential, FX risk | High if stable FX | Large loss if reversal | None (risk embedded) |

---

## 8. Scenario Engine — Stress Testing

### Monte Carlo Simulation

Uses **Geometric Brownian Motion** to simulate realistic FX rate paths:

```
dS = μ·S·dt + σ·S·dW
where μ = drift (from historical returns), σ = historical volatility, dW = Wiener process
```

- Default: 1,000 simulations, configurable up to 5,000
- Returns: full path array for chart, 5th/95th percentile bands, mean path
- Displayed as: spaghetti chart (light gray traces) + highlighted mean + confidence envelope

### Stress Tests

Pre-defined shock scenarios applied instantaneously:

| Scenario | Rate Shock | Use Case |
|----------|-----------|----------|
| Base Case | 0% | Confirm current position |
| Mild Appreciation | +5% | Moderate favorable move |
| Mild Depreciation | -5% | Moderate adverse move |
| Sharp Appreciation | +10% | Significant favorable move |
| Sharp Depreciation | -10% | Significant adverse move |
| Extreme Move | ±15% | Tail risk scenario |
| Custom | User-defined | Specific scenario testing |

**Hedge effectiveness output**: For each stress scenario, shows P&L for every hedging strategy side-by-side. This is the table that proves which hedge actually protects in which scenario.

### Parity Engine

**Interest Rate Parity (IRP)**:
```
F = S × (1 + r_domestic) / (1 + r_foreign)         # Single period
F = S × (1 + r_domestic)^n / (1 + r_foreign)^n     # Multi-year (compound)
```

**IRP Deviation**: `deviation_pct = (actual_forward - irp_forward) / irp_forward × 100`
A deviation > 0.5% signals a potential covered interest arbitrage opportunity.

**Purchasing Power Parity (PPP)**:
```
% change in foreign FX = (1 + i_foreign) / (1 + i_domestic) - 1    # Exact
                       ≈ i_foreign - i_domestic                       # Approximate
```

**Forward Curve**: Compute implied forwards at 1M, 3M, 6M, 1Y, 2Y, 3Y using current interest rate differentials from public central bank data.

---

## 9. AI Agent System

### Architecture Philosophy

The agent layer sits on top of the computation engines. It does not re-implement any math — it calls the existing FastAPI endpoints as tools. This is critical: every number in the recommendation traces to a real computed result, not an LLM estimate.

Five specialist agents, each with a narrow scope, feed into a synthesis agent. This decomposition makes the system auditable — any agent step can be expanded to show exactly which tool was called, what data was returned, and what conclusion was drawn. The "show your work" principle is essential for academic credibility.

**Model**: `claude-sonnet-4-6` — selected for its performance on financial agentic tasks and native tool-use capability.

**Framework**: LangGraph StateGraph — chosen over simple chains because financial strategy recommendation requires conditional branching, parallel execution, and human-in-the-loop checkpoints.

### Shared Agent State

```python
# backend/agents/state.py

class MarketContext(BaseModel):
    pair: str
    spot_rate: float
    bid: float
    offer: float
    spread_pct: float
    daily_change_pct: float
    volatility_30d: float
    trend: str                    # "bullish" | "bearish" | "ranging"
    irp_deviation_pct: float
    technical_signal: str         # "buy" | "sell" | "hold"

class PredictionContext(BaseModel):
    pair: str
    lstm_forecast: list[dict]     # [{date, predicted, lower_ci, upper_ci}]
    arima_forecast: list[dict]
    ensemble_forecast: list[dict]
    directional_confidence: float # 0.0–1.0
    predicted_direction: str      # "up" | "down" | "neutral"
    forecast_horizon_days: int
    model_rmse: float

class HedgingContext(BaseModel):
    position_type: str            # "receivable" | "payable"
    notional: float
    currency_pair: str
    horizon_days: int
    forward_rate: float
    forward_comparison: list[dict]
    money_market_proceeds: float
    option_put_expected: float
    option_call_expected: float
    carry_trade_expected: float | None

class RiskContext(BaseModel):
    volatility_score: float       # 0–10
    irp_arbitrage_opportunity: bool
    carry_trade_risk: str         # "low" | "medium" | "high"
    tail_risk_pct: float          # 95th percentile loss
    stress_test_results: dict
    recommended_hedge_type: str   # "full" | "partial" | "none"

class Recommendation(BaseModel):
    primary_strategy: str
    rationale: str                # Cites specific numbers
    confidence: float             # 0.0–1.0
    ranked_alternatives: list[dict]
    key_risks: list[str]
    trigger_conditions: list[str] # "Reassess if EUR/USD breaks 1.10"
    disclaimer: str

class AgentState(BaseModel):
    # Input
    user_query: str
    pair: str
    position_type: str | None = None
    notional: float | None = None
    horizon_days: int = 90

    # Populated by agents as graph executes
    market_context: MarketContext | None = None
    prediction_context: PredictionContext | None = None
    hedging_context: HedgingContext | None = None
    risk_context: RiskContext | None = None
    final_recommendation: Recommendation | None = None

    # LangGraph message history
    messages: Annotated[list, add_messages] = []

    # Audit trail
    agents_called: list[str] = []
    reasoning_trace: list[dict] = []  # [{agent, tool_calls, conclusion}]
    error: str | None = None
```

### Agent Tool Definitions

All tools are Python functions that call the existing FastAPI backend endpoints. Defined in Anthropic's tool-use format.

**`get_live_rate`** — Fetches current spot rate, bid/offer, 24h change for a pair.

**`get_irp_deviation`** — Computes how far the market forward rate deviates from IRP theory. Positive deviation = arbitrage signal.

**`get_technical_signals`** — Returns RSI value, MACD crossover status, EMA positioning, Bollinger Band location.

**`get_ensemble_forecast`** — Returns LSTM + ARIMA + Prophet ensemble forecast with confidence intervals and directional confidence score (0.0–1.0).

**`compare_hedging_strategies`** — Runs all five hedging strategies for a given position and returns the full P&L comparison table.

**`run_stress_test`** — Runs Monte Carlo (1,000 simulations) and all pre-defined stress scenarios for a pair. Returns tail risk metrics and P&L under each scenario.

**`get_ppp_signal`** — Calculates PPP-implied exchange rate given inflation differentials. Signals over/under-valuation vs. current spot.

### LangGraph Graph Definition

```python
# backend/agents/graph.py

def build_agent_graph(checkpointer) -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("market_analyst", market_analyst_node)
    graph.add_node("prediction_interpreter", prediction_interpreter_node)
    graph.add_node("hedging_strategist", hedging_strategist_node)
    graph.add_node("risk_assessor", risk_assessor_node)
    graph.add_node("synthesizer", synthesizer_node)

    graph.set_entry_point("orchestrator")

    graph.add_conditional_edges("orchestrator", route_from_orchestrator, {
        "full_analysis": "market_analyst",
        "prediction_only": "prediction_interpreter",
        "hedge_only": "hedging_strategist",
        "market_only": "market_analyst",
        "end": END
    })

    graph.add_edge("market_analyst", "prediction_interpreter")

    # Hedging strategist and risk assessor run in PARALLEL after prediction
    graph.add_edge("prediction_interpreter", "hedging_strategist")
    graph.add_edge("prediction_interpreter", "risk_assessor")

    # Both feed into synthesizer
    graph.add_edge("hedging_strategist", "synthesizer")
    graph.add_edge("risk_assessor", "synthesizer")

    graph.add_conditional_edges("synthesizer", check_human_approval_needed, {
        "human_review": "human_review_node",
        "auto_complete": END
    })

    return graph.compile(checkpointer=checkpointer)
```

### Agent System Prompts (Concise Specifications)

**Orchestrator**: Routes user intent to appropriate agents. Classifies query as: full analysis, prediction-only, hedge-only, or market-only. Never calls tools directly.

**Market Analyst**: Must use tools to gather real data — never estimates. Populates MarketContext with spot rate, spread, 30d volatility, IRP deviation, and a single technical signal. Factual and numerical only.

**Prediction Interpreter**: Reads ML forecast outputs. Assesses model agreement across LSTM/ARIMA/Prophet. Assigns directional confidence score 0.0–1.0. Flags conflicts between technical signals and forecast direction.

**Hedging Strategist**: Tool-heavy. Runs compare_hedging_strategies. Applies selection heuristics:
- High directional confidence (>0.75) + favorable direction → Options hedge (floor/ceiling with upside participation)
- Low confidence or neutral forecast → Forward contract (certainty beats expected value)
- IRP deviation >0.5% → Money market hedge (exploits mispricing)
- Carry trade only when interest differential >200bps AND rate stability is high

**Risk Assessor**: Runs parallel to Hedging Strategist. Executes stress tests, scores volatility 0–10, flags carry trade risk level, gets PPP valuation signal, extracts 95th percentile tail loss.

**Synthesizer**: Final decision layer. Synthesis rules:
1. Never recommend a strategy flagged high-risk unless expected value improvement >30% over alternatives
2. If prediction confidence <0.4: always recommend forward or money market (uncertainty = hedge fully)
3. Always cite specific numbers in rationale: "Forward locks in $X vs. expected unhedged $Y, a $Z improvement"
4. Rank alternatives honestly; if within 1% of each other, explain the non-quantitative difference
5. Trigger conditions must be specific: "If EUR/USD breaks 1.08, reassess strike price"

### Agent Trigger Modes

| Mode | Trigger | Endpoint | Latency |
|------|---------|----------|---------|
| Manual | User clicks "Run Analysis" | `POST /api/agent/recommend` | ~15s full analysis |
| Conversational | User types in chat | `POST /api/agent/chat` | ~8s with context |
| Quick Insight | Dashboard widget auto-refresh | `POST /api/agent/insight` | ~3s market analyst only |
| Automatic | Rate crosses ±2% threshold | Background task → WS push | ~3s lightweight |

---

## 10. All API Endpoints

### Rates Router `/api/rates`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rates/live` | All current spot rates |
| GET | `/api/rates/live/{pair}` | Single pair: rate, bid, offer, 24h change |
| GET | `/api/rates/historical/{pair}` | OHLCV history (params: interval, from, to) |
| GET | `/api/rates/cross/{base}/{quote}` | Cross rate computed via USD |
| GET | `/api/rates/matrix` | N×N cross rate matrix |
| WS | `/ws/rates/{pair}` | Real-time stream for one pair |
| WS | `/ws/rates/all` | Real-time stream for all tracked pairs |

### Hedging Router `/api/hedging`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/hedging/forward` | Forward contract P&L table |
| POST | `/api/hedging/money-market` | Money market hedge steps + all-in rate |
| POST | `/api/hedging/options/call` | Call option payoff across spot range |
| POST | `/api/hedging/options/put` | Put option payoff across spot range |
| POST | `/api/hedging/options/straddle` | Straddle analysis: break-evens, P&L |
| POST | `/api/hedging/options/strangle` | Strangle analysis |
| POST | `/api/hedging/carry-trade` | Carry trade P&L sensitivity |
| POST | `/api/hedging/compare` | All strategies side-by-side comparison |

### Parity Router `/api/parity`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parity/irp/{pair}` | IRP-implied forwards at 1M, 3M, 6M, 1Y, 2Y, 3Y |
| GET | `/api/parity/irp-deviation/{pair}` | Actual vs. IRP-implied deviation |
| GET | `/api/parity/ppp/{pair}` | PPP-implied rate given inflation inputs |
| POST | `/api/parity/forward-no-arbitrage` | No-arbitrage forward rate calculator |

### Predictions Router `/api/predictions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predictions/{pair}/lstm` | LSTM forecast (7/14/30d) |
| GET | `/api/predictions/{pair}/arima` | ARIMA forecast + 95% CI |
| GET | `/api/predictions/{pair}/prophet` | Prophet forecast |
| GET | `/api/predictions/{pair}/ensemble` | Combined forecast + RMSE metrics |
| GET | `/api/predictions/{pair}/signals` | Buy/Sell/Hold technical signals |
| GET | `/api/predictions/{pair}/volatility` | 30d rolling volatility |
| POST | `/api/predictions/retrain/{pair}` | Async model retrain trigger |

### Scenarios Router `/api/scenarios`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scenarios/monte-carlo` | N simulated rate paths |
| POST | `/api/scenarios/stress-test` | All shock scenarios |
| POST | `/api/scenarios/hedge-effectiveness` | P&L per strategy under each scenario |

### Agent Router `/api/agent`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/recommend` | Full multi-agent analysis (SSE stream) |
| POST | `/api/agent/chat` | Multi-turn conversational agent (SSE stream) |
| POST | `/api/agent/insight` | Lightweight market insight (JSON) |
| GET | `/api/agent/history/{session_id}` | Past recommendations for session |

---

## 11. Database Schema

```sql
-- Live rate snapshots for historical record
CREATE TABLE rate_snapshots (
    id          BIGSERIAL PRIMARY KEY,
    pair        VARCHAR(7) NOT NULL,
    open        DECIMAL(18, 6),
    high        DECIMAL(18, 6),
    low         DECIMAL(18, 6),
    close       DECIMAL(18, 6),
    interval    VARCHAR(10),              -- '1min', '5min', 'daily'
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rate_pair_time ON rate_snapshots(pair, recorded_at DESC);

-- Cached ML model predictions
CREATE TABLE predictions (
    id              BIGSERIAL PRIMARY KEY,
    pair            VARCHAR(7) NOT NULL,
    model_type      VARCHAR(20) NOT NULL,  -- 'lstm' | 'arima' | 'prophet' | 'ensemble'
    horizon_days    INT NOT NULL,
    predictions     JSONB NOT NULL,        -- [{date, predicted, lower_ci, upper_ci}]
    model_metrics   JSONB,                 -- {rmse, mae, directional_accuracy}
    generated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Agent run audit trail
CREATE TABLE agent_runs (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id           VARCHAR(100),
    pair                 VARCHAR(7),
    position_type        VARCHAR(20),
    notional             DECIMAL(18, 2),
    agents_called        JSONB,
    reasoning_trace      JSONB,            -- Full per-agent trace for audit/debug
    final_recommendation JSONB,
    total_latency_ms     INT,
    token_usage          JSONB,            -- {input_tokens, output_tokens, cost_usd}
    model_used           VARCHAR(50),
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Saved user scenarios (for re-running later)
CREATE TABLE saved_scenarios (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100),
    strategy_type VARCHAR(50),
    parameters    JSONB NOT NULL,
    results       JSONB NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. Frontend — Next.js Application

### Tech Stack

| Concern | Library | Version | Reason |
|---------|---------|---------|--------|
| Framework | Next.js App Router | 15.x | SSR + Server Components |
| Language | TypeScript | 5.x | Type safety across FX data |
| Styling | Tailwind CSS | 3.x | Utility-first, fast iteration |
| Charts (primary) | Recharts | 2.x | React-native, composable |
| Charts (advanced) | D3.js | 7.x | Payoff diagrams, Monte Carlo |
| Charts (candles) | lightweight-charts | 4.x | TradingView, best-in-class |
| State | Zustand | 4.x | Lightweight, WS-event-friendly |
| Data fetching | TanStack Query | 5.x | Server state, caching |
| WebSocket | react-use-websocket | 4.x | Managed WS connection |
| Forms | React Hook Form + Zod | — | Validated hedge inputs |
| UI primitives | shadcn/ui + Radix | — | Accessible, composable |
| Animations | Framer Motion | 11.x | Rate card transitions |
| Tables | TanStack Table | 8.x | Strategy comparison table |

### Design System

**Theme**: Dark professional trading terminal aesthetic — not a generic dashboard.

```
Background:    #0A0E1A  (deep navy — every page)
Surface:       #111827  (card backgrounds)
Border:        #1F2937  (subtle dividers)
Accent Blue:   #00D4FF  (electric — primary interactive elements)
Positive:      #00C853  (green — rate increases, profitable strategies)
Negative:      #FF3D57  (red — rate decreases, losses)
Warning:       #FFB300  (amber — risk flags)
Text Primary:  #F9FAFB  (near white)
Text Muted:    #6B7280  (labels, secondary info)

Fonts:
  Numbers/rates: Geist Mono (monospaced — critical for rate alignment)
  Interface:     Geist Sans
  
  NEVER use: Inter, Roboto, Arial, system-ui, purple gradients
```

### Global Zustand Stores

```typescript
// store/ratesStore.ts
interface RatesStore {
  rates: Record<string, LiveRate>     // keyed by pair "EUR/USD"
  lastUpdate: Date | null
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  updateRate: (pair: string, rate: LiveRate) => void
}

// store/agentStore.ts
interface AgentStore {
  activeSession: string | null
  currentAnalysis: AgentRun | null
  streamingAgent: string | null       // which agent is currently running
  reasoningTrace: TraceEntry[]
  recommendation: Recommendation | null
  chatHistory: Message[]
}
```

---

## 13. Frontend — Pages & Visualizations

### Page 1: Live Dashboard `/dashboard`

**Purpose**: Real-time market overview. The platform's landing experience.

**Components**:
- **FX Ticker** — Horizontally scrolling bar across top, all pairs with colored ▲▼ arrows and % change, animated via `requestAnimationFrame`
- **Rate Cards Grid** — 3×N grid of cards. Each card: pair name, current rate (Geist Mono, large), bid/offer, 24h % change badge, intraday sparkline (Recharts `<Sparkline>`)
- **Cross Rate Matrix** — Interactive N×N table. Hover highlights row/column. Click any cell → navigates to `/dashboard/[pair]`
- **Currency Strength Heat Map** — Color-coded grid (green = strong, red = weak) showing which currencies are performing best vs. all others today
- **AI Insight Widget** — Auto-refreshing sidebar widget showing 1-sentence summary per major pair with bullish/bearish/neutral badge. "Run full analysis →" CTA

**Charts**:
- 1D candlestick (lightweight-charts) for the selected pair, updating live via WebSocket

---

### Page 2: Currency Pair Deep-Dive `/dashboard/[pair]`

**Purpose**: Full market analysis for a single pair.

**Components**:
- **Interactive Candlestick Chart** — lightweight-charts, full width
  - Time range: 1D / 1W / 1M / 3M / 1Y / 5Y selector
  - Overlay toggles: EMA 50, EMA 200, Bollinger Bands, Volume histogram
- **Technical Signal Panel** — RSI gauge (semi-circle), MACD histogram (Recharts BarChart), signal dots on price chart
- **IRP Implied Forward Curve** — Recharts LineChart showing: implied forward rates (1M→3Y) derived from interest rate differentials vs. any actual quoted forwards user inputs. Divergence is annotated.
- **Volatility Chart** — Rolling 30d annualized volatility, Recharts AreaChart

---

### Page 3: Hedging Simulator `/hedging`

**Purpose**: Core professional tool. Three-panel layout:
- Left panel: Position input form (pair, amount, horizon, rates — auto-filled from live data)
- Center panel: Active strategy visualization
- Right panel: Strategy Comparison Table (all strategies simultaneously)

#### Sub-page: Forward Contract `/hedging/forward`

**Chart — Forward Payoff Diagram** (Recharts ComposedChart):
- X-axis: Spot rate at maturity (range: ±15% from current)
- Y-axis: Net proceeds / cost in domestic currency
- Line 1 (solid, blue): Hedged with forward — flat horizontal line (locked-in value)
- Line 2 (dashed, white): Unhedged — diagonal line crossing the forward value at current spot
- Shaded region: Green where forward outperforms, amber where unhedged outperforms
- Annotation: Current spot, forward rate, break-even labeled with dotted verticals

#### Sub-page: Money Market Hedge `/hedging/money-market`

**Chart — Cash Flow Timeline** (custom D3 horizontal timeline):
- 4 nodes: Borrow → Convert → Invest → Maturity
- Each node shows the currency amount at that step
- Arrows between nodes labeled with the operation and rate applied
- Final node shows all-in effective rate vs. forward rate comparison

#### Sub-page: Options `/hedging/options`

**Chart — Option Payoff Diagram** (D3.js):
- X-axis: Spot rate at expiration
- Y-axis: Net profit/loss per unit
- Buyer P&L: hockey-stick line (flat at -premium, then slopes up/down from strike)
- Seller P&L: inverse hockey-stick (mirrored)
- Shading: Green profit zones, red loss zones
- Annotations: Strike price, break-even point(s), current spot — all with dotted verticals
- Toggle: Switch between Call / Put / Straddle / Strangle — chart re-renders with smooth Framer Motion transition

For Straddle/Strangle: both legs drawn simultaneously, combined P&L shown as a third highlighted line.

#### Sub-page: Carry Trade `/hedging/carry-trade`

**Chart — 2D Sensitivity Heat Map** (D3.js):
- X-axis: Interest differential (bps)
- Y-axis: Ending exchange rate (% change from initial)
- Cell color: Green (profit) → Red (loss) gradient based on carry trade P&L
- Current scenario highlighted with a crosshair
- Hover: tooltip showing exact P&L for that combination

---

### Page 4: Predictive Models `/predictions`

**Purpose**: ML forecast visualizations for each pair.

**Components**:
- **Pair selector** — tab row for all tracked pairs
- **Model selector** — LSTM / ARIMA / Prophet / Ensemble
- **Forecast Chart** (Recharts ComposedChart):
  - Historical price: solid line (60d lookback)
  - Forecast: dashed line (7 / 14 / 30d horizon selector)
  - 95% Confidence band: shaded area around forecast
  - Color coding: blue for LSTM, orange for ARIMA, green for Prophet, white for Ensemble
- **Model Performance Panel**: RMSE badge, MAE badge, Directional Accuracy % badge
- **Model Comparison Overlay**: All three models + ensemble on one chart simultaneously (toggle-able)
- **Technical Signal Dashboard**: Current RSI reading, MACD status, EMA positioning, Bollinger Band location — all as labeled badges

---

### Page 5: Parity Visualizer `/parity`

**Purpose**: Visualize IRP and PPP with live data. Demonstrates theory vs. market reality.

**IRP Section**:
- **Forward Curve Chart** (Recharts LineChart): Two lines — IRP-implied forward at 1M/3M/6M/1Y/2Y/3Y vs. actual current spot. Divergence between lines indicates arbitrage opportunity.
- **IRP Deviation Gauge**: A semi-circle gauge showing current deviation percentage. Green zone (<0.5%) = no opportunity. Red zone (>0.5%) = arbitrage signal.
- **Live Arbitrage Calculator**: Input fields for notional + interest rates → real-time step-by-step covered interest arbitrage profit computation displayed as it's typed.

**PPP Section**:
- **PPP Scatter Plot** (D3.js): Each dot = a currency pair. X-axis: inflation differential vs. USD. Y-axis: actual % change in exchange rate over past 12 months. The PPP prediction line is plotted. Dots far from the line = over/undervalued currencies, labeled.
- **PPP Rate Calculator**: Input home + foreign inflation → returns theoretical future exchange rate with explanation.

---

### Page 6: Scenario Builder `/scenarios`

**Purpose**: What-if analysis engine. Stress test any position under different rate environments.

**Components**:
- **Scenario Setup Panel**: Pair, starting rate, position (receivable/payable), notional, horizon
- **Monte Carlo Chart** (D3.js): 500 simulated paths as light gray lines, mean path highlighted in blue, 5th/95th percentile envelope shaded. X-axis: time to maturity. Y-axis: exchange rate.
- **Stress Test Panel**: 6 pre-set scenario buttons (±5%, ±10%, ±15%) + custom input. Clicking a scenario instantly highlights that rate level on the Monte Carlo chart AND populates the hedge effectiveness table.
- **Hedge Effectiveness Table** (TanStack Table): Shows P&L for every hedging strategy under the selected scenario. Columns sortable. Best strategy row highlighted green.

---

## 14. Frontend — Agent UI Components

### Component 1: AI Strategy Panel

**Location**: Right-side panel on `/hedging` pages AND full-page at `/agent`

The panel streams agent progress in real time via SSE. Each agent step appears as it completes, with a check (✅), spinner (⚡), or queued indicator (⏳).

```
┌─────────────────────────────────────────────────────┐
│  🤖 FX Strategy Agent              [Run Analysis]   │
├─────────────────────────────────────────────────────┤
│  EUR/USD  ·  Receivable  ·  €1,000,000  ·  90 days  │
├─────────────────────────────────────────────────────┤
│  REASONING TRACE                                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✅ Market Analyst              2.1s         │    │
│  │    Rate: 1.0842 · Spread: 0.02%            │    │
│  │    IRP Deviation: +0.31% (slight premium)  │    │
│  │    Signal: Bearish  (RSI: 68.4)            │    │
│  │    [▼ Expand tool calls]                   │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ✅ Prediction Interpreter      4.7s         │    │
│  │    LSTM: 1.071 in 30d  (↓ 1.2%)           │    │
│  │    Model agreement: HIGH · Confidence 0.82 │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ⚡ Hedging Strategist          running...   │    │
│  │ ⏳ Risk Assessor               queued       │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  RECOMMENDATION                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  PRIMARY: Put Option Hedge   ████████░ 82%  │    │
│  │                                             │    │
│  │  Models show high-confidence EUR decline    │    │
│  │  to 1.071 over 90 days. Strike at 1.08     │    │
│  │  locks in $1.08M floor while preserving    │    │
│  │  upside. Expected value: +$18,400 vs.      │    │
│  │  forward contract.                          │    │
│  │                                             │    │
│  │  ALTERNATIVES                               │    │
│  │  2. Forward Contract      ███████░░ 77%    │    │
│  │  3. Money Market Hedge    ██████░░░ 71%    │    │
│  │                                             │    │
│  │  ⚠ RISKS                                   │    │
│  │  · Premium: $24,000 (2.4% of notional)    │    │
│  │  · If EUR/USD > 1.12, forward beats by    │    │
│  │    $31,000                                 │    │
│  │                                             │    │
│  │  🔁 REASSESS IF: EUR/USD breaks 1.10      │    │
│  └─────────────────────────────────────────────┘    │
│  [Export PDF]   [Open Chat]   [Compare on Chart]    │
└─────────────────────────────────────────────────────┘
```

### Component 2: Agent Reasoning Trace (Expandable)

Clicking "Expand tool calls" on any completed agent step reveals:
- Tool name and exact inputs sent
- Raw data returned by the tool
- Agent's conclusion drawn from that data in plain language

This is the academic credibility feature. It shows the professor that every recommendation traces to real computed data, not a language model's intuition.

### Component 3: Agent Chat Interface `/agent/chat`

Full-page conversational interface. Session state persists via LangGraph PostgreSQL checkpointing.

Example interactions the agent handles:
- "Why did you recommend the put option over the forward contract?"
- "What if I only need to hedge 60% of the exposure?"
- "What if your LSTM forecast is wrong and EUR strengthens instead?"
- "Show me the money market hedge calculation step by step"
- "What's the break-even spot rate for the put option you recommended?"

The agent has access to all tools and all prior conversation context. It re-runs calculations with modified parameters as needed.

### Component 4: Dashboard AI Insight Widget

Lightweight, auto-refreshes every 10 minutes using `/api/agent/insight` (market analyst agent only, no full graph execution). Displayed in the dashboard sidebar.

Shows per major pair:
- One-sentence market summary
- Signal badge: 🟢 Bullish / 🔴 Bearish / ⚪ Neutral
- "Run full analysis →" button that opens the full agent panel pre-loaded with that pair

---

## 15. Environment Configuration

### `.env.example` (complete)

```bash
# ─── External APIs ───────────────────────────────────────
ALPHA_VANTAGE_API_KEY=your_key_here
# Get free key at: https://www.alphavantage.co/support/#api-key

# ─── Database ────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://fxuser:fxpass@localhost:5432/fxdb

# ─── Cache ───────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── Backend ─────────────────────────────────────────────
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000

# ─── Anthropic / Agent ───────────────────────────────────
ANTHROPIC_API_KEY=your_key_here
CLAUDE_MODEL=claude-sonnet-4-6
AGENT_MAX_TOKENS=4000
AGENT_TEMPERATURE=0
AGENT_STREAM=true
AUTO_ANALYSIS_THRESHOLD_PCT=2.0    # Re-analyze when rate moves ±2%

# ─── Frontend ────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## 16. Build Phases (1–14)

Build phases are ordered strictly by dependency. Each has a concrete test to pass before advancing. Do not skip phases.

---

### Phase 1 — Backend Foundation
**Goal**: Working FastAPI server with real live forex data.

1. Create `backend/` directory structure
2. `backend/main.py` — FastAPI app, CORS middleware, router registration skeleton
3. `docker-compose.yml` — PostgreSQL + Redis services
4. `backend/services/db.py` — SQLAlchemy async engine, session factory
5. `backend/models/orm.py` — `rate_snapshots` table definition
6. `backend/services/cache.py` — Redis async wrapper (get/set/delete with TTL)
7. `backend/services/fx_fetcher.py` — Alpha Vantage client (with Frankfurter fallback), Redis caching, rate limit handling
8. `backend/services/websocket_manager.py` — ConnectionManager class
9. `backend/routers/rates.py` — `GET /api/rates/live`, `GET /api/rates/live/{pair}`, `GET /api/rates/historical/{pair}`, `WS /ws/rates/all`
10. `backend/main.py` — Add startup background task: poll Alpha Vantage every 60s → cache → broadcast

**✅ Checkpoint**: `curl http://localhost:8000/api/rates/live/EUR-USD` returns real current rate with bid, offer, and 24h change.

---

### Phase 2 — Hedging & Parity Engines
**Goal**: All strategy calculations producing correct P&L tables.

1. `backend/engines/parity_engine.py` — IRP (single + compound), PPP (exact + approx), IRP deviation computation
2. `backend/routers/parity.py` — All parity endpoints
3. `backend/engines/hedging_engine.py` — Forward, money market (recv + pay), call, put, straddle, strangle, carry trade, compare-all
4. `backend/models/schemas.py` — All Pydantic request/response models for hedging
5. `backend/routers/hedging.py` — All hedging endpoints

**✅ Checkpoint**: `POST /api/hedging/compare` with EUR/USD, €1M receivable, 90 days → returns P&L table for all 5 strategies. Numbers verified by hand against formulas.

---

### Phase 3 — ML Engine
**Goal**: LSTM and ensemble forecasts working for EUR/USD.

1. `backend/ml/features.py` — Feature engineering: OHLCV normalization, all technical indicators via `ta` library, interest rate differential feature
2. `backend/ml/lstm_model.py` — Model architecture, training script (`python train.py --pair EUR/USD`), inference function, serialization to `trained/`
3. `backend/ml/arima_model.py` — Auto-ARIMA wrapper (AIC order selection), inference with confidence intervals
4. `backend/ml/prophet_model.py` — Prophet wrapper, weekly + annual seasonality, inference
5. `backend/ml/ensemble.py` — Weighted combiner, individual vs. ensemble RMSE comparison
6. Train initial models: run training script on 5yr EUR/USD daily data from Frankfurter
7. `backend/models/schemas.py` — Add prediction request/response schemas
8. `backend/routers/predictions.py` — All prediction endpoints

**✅ Checkpoint**: `GET /api/predictions/EUR-USD/ensemble?horizon=30` returns 30-day forecast array with `predicted`, `lower_ci`, `upper_ci` per date. RMSE displayed. Model files exist in `trained/`.

---

### Phase 4 — Scenario Engine
**Goal**: Monte Carlo and stress tests operational.

1. `backend/engines/scenario_engine.py` — GBM Monte Carlo implementation, all 6 pre-defined stress scenarios, hedge effectiveness table generator
2. `backend/routers/scenarios.py` — All scenario endpoints

**✅ Checkpoint**: `POST /api/scenarios/monte-carlo` returns 1,000 simulated rate path arrays. `POST /api/scenarios/hedge-effectiveness` with EUR/USD -10% scenario returns P&L for all strategies under that shock.

---

### Phase 5 — Next.js Frontend Shell
**Goal**: App foundation: routing, design system, API integration, WebSocket connection.

1. `npx create-next-app@latest frontend --typescript --tailwind --app`
2. `npx shadcn@latest init` — configure with dark theme
3. `npm install recharts d3 zustand @tanstack/react-query react-use-websocket framer-motion lightweight-charts @tanstack/react-table react-hook-form zod`
4. `frontend/app/layout.tsx` — Root layout: sidebar navigation (Dashboard, Hedging, Predictions, Parity, Scenarios, AI Agent), global font imports (Geist Sans + Geist Mono), theme CSS variables
5. `frontend/lib/api.ts` — Typed REST client wrapping all FastAPI endpoints
6. `frontend/lib/ws.ts` — WebSocket hook: auto-reconnect, message parsing, pair subscription
7. `frontend/lib/sse.ts` — SSE client for agent streaming
8. `frontend/store/ratesStore.ts` — Zustand store, populated from WebSocket
9. `frontend/store/agentStore.ts` — Zustand store for agent state
10. `frontend/types/forex.ts` + `frontend/types/agent.ts` — All TypeScript interfaces

**✅ Checkpoint**: `npm run dev` runs. Sidebar navigation works. `ratesStore` populates from WebSocket and `console.log` shows live EUR/USD updates.

---

### Phase 6 — Dashboard Page
**Goal**: `/dashboard` fully functional with live data.

1. `components/dashboard/FXTicker.tsx` — Horizontally scrolling ticker, reads from Zustand, animated
2. `components/dashboard/RateCard.tsx` — Individual pair card: rate, spread, % change badge (green/red), Recharts Sparkline
3. `components/dashboard/CrossRateMatrix.tsx` — N×N computed cross rate table with hover states
4. `components/dashboard/TechnicalSignalBadge.tsx` — Buy/Sell/Hold badge component
5. `components/charts/CandlestickChart.tsx` — lightweight-charts wrapper, subscribes to WS for live updates
6. `app/dashboard/page.tsx` — Assemble: Ticker at top, 3-col rate cards grid, cross rate matrix, candlestick chart for selected pair, AI insight widget placeholder
7. `app/dashboard/[pair]/page.tsx` — Pair deep-dive: large candlestick + time range selector + IRP curve + volatility chart + signal panel

**✅ Checkpoint**: `/dashboard` loads with real rates. Cards update when WebSocket pushes new data (rate number animates on change). Cross rate matrix computes correctly. Clicking a pair opens deep-dive.

---

### Phase 7 — Hedging Simulator Pages
**Goal**: All hedging strategy pages with payoff diagrams.

1. `components/hedging/HedgeInputForm.tsx` — Shared form: pair selector (auto-populates from live rates), position type, notional, horizon, interest rates
2. `components/charts/ForwardPayoffDiagram.tsx` — Recharts ComposedChart: flat hedged line + diagonal unhedged line + shaded outperformance zones + annotations
3. `components/charts/OptionsPayoffDiagram.tsx` — D3.js hockey-stick: buyer P&L + seller P&L + break-even annotations + green/red shading
4. `components/hedging/CashFlowTimeline.tsx` — D3 horizontal timeline with labeled nodes
5. `components/charts/CarryTradeHeatMap.tsx` — D3 2D heat map
6. `components/hedging/StrategyComparisonTable.tsx` — TanStack Table: all strategies × metrics
7. `app/hedging/page.tsx` — Strategy overview with 5 strategy cards
8. `app/hedging/forward/page.tsx` — Form + ForwardPayoffDiagram + StrategyComparisonTable (right panel)
9. `app/hedging/money-market/page.tsx` — Form + CashFlowTimeline
10. `app/hedging/options/page.tsx` — Form + OptionsPayoffDiagram with Call/Put/Straddle/Strangle toggle
11. `app/hedging/carry-trade/page.tsx` — Form + CarryTradeHeatMap

**✅ Checkpoint**: Navigate to `/hedging/options`, input EUR/USD put option parameters, toggle between Put and Straddle — chart re-renders correctly. Strategy comparison table populates with API response.

---

### Phase 8 — Predictions & Parity Pages
**Goal**: ML forecast charts and parity visualizations.

1. `components/charts/ForecastChart.tsx` — Recharts ComposedChart: historical line + dashed forecast + confidence band area + model comparison overlay
2. `app/predictions/page.tsx` — Pair selector tabs, model selector, ForecastChart, model metrics panel
3. `app/predictions/[pair]/page.tsx` — Full pair forecast page with comparison overlay toggle
4. `components/charts/IRPCurveChart.tsx` — Two Recharts lines: IRP-implied vs. actual forwards, divergence annotated
5. `components/charts/PPPScatterPlot.tsx` — D3 scatter: inflation diff vs. FX change, PPP theory line, labeled outlier dots
6. `app/parity/page.tsx` — IRP section (curve + deviation gauge + live arbitrage calculator) + PPP section (scatter + calculator)

**✅ Checkpoint**: `/predictions` shows 30-day ensemble forecast for EUR/USD with confidence bands. `/parity` shows IRP curve and PPP scatter populated with real data.

---

### Phase 9 — Scenario Builder
**Goal**: Monte Carlo and stress test interactive page.

1. `components/charts/MonteCarloChart.tsx` — D3.js: 500 gray path traces + blue mean path + shaded confidence envelope
2. `app/scenarios/page.tsx` — Scenario setup form → MonteCarloChart → stress test button row → hedge effectiveness table
3. Wire stress test buttons to re-call API and highlight selected rate level on the Monte Carlo chart

**✅ Checkpoint**: Run Monte Carlo for EUR/USD → see 500 paths. Click "-10% shock" → table updates with P&L for all strategies under that scenario. Correct strategy highlighted green.

---

### Phase 10 — Frontend Polish & Demo Prep
**Goal**: Production-ready visual quality and demo reliability.

1. Loading skeletons (shadcn/ui Skeleton) for all async data on every page
2. Error boundary components with friendly error states (no raw error messages)
3. Empty state components when no data is available
4. Responsive layout optimization for projector / 1920×1080 display
5. CSV export button on all data tables
6. PNG chart export (using `html2canvas` on chart containers)
7. Demo mode toggle: pre-caches a snapshot of all data so demo works even if API is rate-limited
8. README.md with full setup instructions (prerequisites, env setup, boot sequence)

**✅ Checkpoint**: Full demo walkthrough completes without any broken states, loading errors, or layout issues on a 1080p display.

---

### Phase 11 — AI Agent Foundation
**Goal**: Market Analyst agent working standalone, tools callable, state model defined.

1. Install: `pip install langgraph langchain-anthropic anthropic sse-starlette`
2. `backend/agents/state.py` — Full `AgentState` with all sub-models (`MarketContext`, `PredictionContext`, `HedgingContext`, `RiskContext`, `Recommendation`)
3. `backend/agents/tools/rate_tools.py` — `get_live_rate`, `get_irp_deviation`, `get_technical_signals` tool definitions (Anthropic tool-use format)
4. `backend/agents/tools/prediction_tools.py` — `get_ensemble_forecast` tool
5. `backend/agents/tools/hedging_tools.py` — `compare_hedging_strategies` tool
6. `backend/agents/tools/scenario_tools.py` — `run_stress_test` tool
7. `backend/agents/tools/parity_tools.py` — `get_ppp_signal` tool
8. `backend/agents/market_analyst.py` — Market analyst node: agentic loop (call tools until `stop_reason == "end_turn"`), parse structured `MarketContext` from response
9. `backend/agents/prompts/market_analyst.md` — Full system prompt

**✅ Checkpoint**: Call `market_analyst_node` directly with `{"pair": "EUR/USD", "horizon_days": 90}`. Verify it calls `get_live_rate` and `get_technical_signals`, returns a fully populated `MarketContext` with real numbers.

---

### Phase 12 — Full Agent Graph
**Goal**: Complete 5-agent graph producing end-to-end recommendations.

1. `backend/agents/prediction_interpreter.py` + prompt
2. `backend/agents/hedging_strategist.py` + prompt
3. `backend/agents/risk_assessor.py` + prompt
4. `backend/agents/synthesizer.py` + prompt — enforce all synthesis rules in system prompt
5. `backend/agents/orchestrator.py` + prompt — query intent classification and routing
6. `backend/agents/graph.py` — Wire full `StateGraph`: orchestrator → market analyst → prediction interpreter → [hedging strategist ∥ risk assessor] → synthesizer. Add LangGraph `AsyncPostgresSaver` checkpointer.
7. `backend/routers/agent.py` — `/api/agent/recommend` (SSE streaming), `/api/agent/chat`, `/api/agent/insight`
8. `backend/models/orm.py` — Add `agent_runs` table, `saved_scenarios` table

**✅ Checkpoint**: `POST /api/agent/recommend` with EUR/USD, receivable, €1M, 90 days → SSE stream emits `agent_start` events for each of 5 agents → final `recommendation` event with structured `Recommendation` JSON including ranked strategies with specific numbers in rationale.

---

### Phase 13 — Agent Frontend UI
**Goal**: Streaming agent panel, reasoning trace, and chat interface.

1. `components/agent/AgentStrategyPanel.tsx` — SSE consumer, renders streaming agent steps with ✅/⚡/⏳ indicators, final recommendation block with confidence bars
2. `components/agent/AgentReasoningTrace.tsx` — Expandable per-agent trace showing tool calls and conclusions
3. `components/agent/AgentChatInterface.tsx` — Chat UI with message history, streaming response display, input form
4. `components/agent/DashboardInsightWidget.tsx` — Polling insight widget with signal badges
5. `app/agent/page.tsx` — Full-page agent: input form (left) + AgentStrategyPanel (right)
6. `app/agent/chat/page.tsx` — AgentChatInterface full page
7. Integrate DashboardInsightWidget into `/dashboard` page layout
8. Add AgentStrategyPanel as collapsible right panel on all `/hedging/*` pages

**✅ Checkpoint**: Navigate to `/agent`, input EUR/USD receivable €1M. Click "Run Analysis". Watch 5 agent steps stream in with real data. Expand Market Analyst trace — see exact tool calls. Final recommendation appears. Open chat, ask "Why not a forward?" — agent responds with context-aware reasoning.

---

### Phase 14 — Memory, Persistence & Final Polish
**Goal**: Production-ready agent with audit trail and session memory.

1. Wire `AsyncPostgresSaver` checkpointer fully for multi-turn chat memory
2. Session ID management in frontend (generated UUID, stored in `agentStore`)
3. `GET /api/agent/history/{session_id}` — retrieve past recommendations
4. `agent_runs` logging middleware — every agent invocation logged with full trace + token usage
5. Automatic re-analysis: background task monitors WebSocket rate stream → if pair crosses ±2% threshold → trigger lightweight insight → push notification to frontend
6. Final end-to-end integration test: full demo script walkthrough confirming all 7 demo steps work without interruption

**✅ Checkpoint**: Complete the demo script top to bottom. Agent chat remembers prior analysis within session. Agent run history visible in DB. Auto-notification fires when rate crosses threshold.

---

## 17. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM model | Claude Sonnet 4.6 | Top performer on Finance Agent v1.1 benchmark; native tool-use; 1M context |
| Agent framework | LangGraph | Supports conditional branching, parallel nodes, HITL checkpoints — needed for financial reasoning |
| Agent pattern | Multi-specialist (5 agents) | Auditable, debuggable, explainable — each agent's output is inspectable |
| Forex API | Alpha Vantage + Frankfurter fallback | Free tier sufficient for demo; fallback ensures demo reliability |
| ML framework | TensorFlow/Keras + statsmodels | Industry standard; strong FX research precedent for LSTM approach |
| Candlestick chart | lightweight-charts (TradingView) | Best-in-class financial chart performance; free; professional appearance |
| Charts (primary) | Recharts | React-native composable; sufficient for line/area/bar/composed charts |
| Charts (advanced) | D3.js | Required for custom payoff diagrams, Monte Carlo spaghetti, scatter |
| Real-time transport | WebSockets (backend→frontend) | Bi-directional, lower latency than SSE for live rate broadcast |
| Agent streaming | SSE (agent→frontend) | Server-to-client only; simpler than WS for one-way streaming; built-in reconnect |
| State management | Zustand | Lightweight; works naturally with event-driven WS updates |
| Database | PostgreSQL | ACID compliance for financial data; LangGraph native checkpointer support |
| Cache | Redis | Sub-millisecond reads; essential for live rate display at scale |
| Agent temperature | 0 | Deterministic financial recommendations — no randomness in strategy advice |

---

## 18. Demo Script

Walk through in this exact order for maximum impact.

**Step 1 — Live Dashboard**
> "This is the live market. Every number you see is real — fetched from Alpha Vantage 60 seconds ago."

Point to: ticker scrolling, rate cards updating, cross rate matrix. Click EUR/USD to open the pair deep-dive. Show the candlestick chart and switch time frames. Point to the IRP curve — "this is what the forward rate *should* be according to Interest Rate Parity theory. Any gap between theory and market price is a potential arbitrage."

**Step 2 — Predictive Models**
> "We trained an LSTM neural network on 5 years of daily FX data for every major pair."

Navigate to `/predictions`. Show EUR/USD 30-day ensemble forecast with confidence bands. Toggle to show individual models — LSTM, ARIMA, Prophet — on the same chart. Point to directional confidence score and RMSE.

**Step 3 — Hedging Simulator: Forward Contract**
> "A US company is expecting €1 million from a European customer in 90 days."

Navigate to `/hedging/forward`. Input the position. Show the payoff diagram: "The blue line is the forward hedge — locked in regardless of what happens to the exchange rate. The white dashed line is unhedged — your outcome moves with the market."

**Step 4 — Options Hedge**
Navigate to `/hedging/options`, select Put. Show the hockey stick: "Here's the key difference from a forward. Below the strike, you're protected. Above the strike, you still benefit from a stronger euro. You paid $24,000 for that flexibility."

Toggle to Straddle. "This is for a speculator who believes the rate will move significantly but isn't sure which direction. Profits if EUR/USD moves more than 5 cents either way."

**Step 5 — Strategy Comparison**
"Here's all five strategies on one table — expected outcome, best case, worst case, cost. This is what a treasury desk sees when they're making a hedging decision."

**Step 6 — Scenario Builder**
Navigate to `/scenarios`. Run Monte Carlo for EUR/USD. "These 500 lines are 500 possible futures for the EUR/USD rate over the next 90 days, based on historical volatility. Let's stress test our position."

Click "-10% shock scenario." Show the hedge effectiveness table updating — "Under a 10% EUR depreciation, the put option limits our loss to $24,000 (the premium). Unhedged we lose $100,000. The forward also protects, but we gave up $150,000 in potential gains."

**Step 7 — AI Agent**
> "Now instead of manually running all of that, watch this."

Navigate to `/agent`. Input EUR/USD, receivable, €1M, 90 days. Click "Run Analysis." Watch the agent panel stream: Market Analyst → Prediction Interpreter → Hedging Strategist + Risk Assessor → Synthesis.

When recommendation appears: click the Hedging Strategist's reasoning trace. "See exactly which tool it called, what data came back, and why it made the recommendation it did. This is not a black box."

Open chat. Ask: "What if EUR/USD strengthens to 1.12 instead?" Show agent re-analyzing with that scenario.

> "This is not a chatbot that guesses. Every number in that recommendation was computed by our hedging engine from live market data. The agent reads those numbers and explains what they mean for a decision-maker."

---

## 19. Quick Start Commands

```bash
# ─── Initial Setup ────────────────────────────────────────
git init fx-intelligence && cd fx-intelligence
mkdir -p backend/{routers,services,models,engines,ml/trained,agents/tools,agents/prompts}
mkdir -p frontend

# ─── Backend ──────────────────────────────────────────────
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# ─── Database & Cache (Docker) ────────────────────────────
cd ..
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: fxdb
      POSTGRES_USER: fxuser
      POSTGRES_PASSWORD: fxpass
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
volumes:
  pgdata:
EOF
docker-compose up -d

# ─── Frontend ─────────────────────────────────────────────
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npx shadcn@latest init
npm install recharts d3 zustand @tanstack/react-query react-use-websocket \
  framer-motion lightweight-charts @tanstack/react-table react-hook-form zod \
  @types/d3 html2canvas

# ─── Environment ──────────────────────────────────────────
cd ..
cp .env.example .env
# Edit .env with your ALPHA_VANTAGE_API_KEY and ANTHROPIC_API_KEY

# ─── Boot Sequence (3 terminals) ──────────────────────────
# Terminal 1:
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 2:
cd frontend && npm run dev

# Terminal 3 (ML training — run once):
cd backend && python -m ml.lstm_model --train --pair EUR/USD
```

**Verification**:
- Backend health: `curl http://localhost:8000/docs` → Swagger UI loads
- Live rates: `curl http://localhost:8000/api/rates/live/EUR-USD`
- Frontend: `http://localhost:3000` → Dashboard loads with live rates

---

*This document is the single source of truth for the FX Intelligence Platform. All architecture decisions, API contracts, data models, component specifications, and build instructions are contained here. Feed this document to Claude Code at the start of each build phase.*
