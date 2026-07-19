# StratGuard AI

> Turn a constrained crypto strategy into a reproducible backtest, then inspect what the result does not prove.

StratGuard AI is a research-only developer tool for auditing simple strategy ideas before paper trading or deployment. It separates deterministic evidence from AI interpretation: Python calculates signals, trade timing, costs, and metrics; GPT-5.6 is reserved for optional structured specification and evidence-based audit workflows.

## Why it exists

Backtests can create false confidence when their rules are ambiguous, trades use future information, or costs and limitations are hidden. StratGuard makes the assumptions visible and forces a critical question: does the historical result actually support the claim being made?

## Current MVP

- Offline BTC/USDT 1h demo dataset generated deterministically for repeatable judging.
- Long-only 20/50 SMA crossover workflow.
- Next-candle execution to prevent same-candle look-ahead bias.
- Position sizing, fees, slippage, and basic stop/target assumptions in the strategy schema.
- Metric cards and credibility findings.
- React dashboard that works without exchange accounts, live market data, or an OpenAI API key.

## Safety boundary

StratGuard AI is not financial advice, a profitability predictor, or trading execution software. It does not connect to exchanges, request exchange credentials, place orders, or claim a historical backtest proves future performance.

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install fastapi pydantic pytest httpx uvicorn pandas numpy
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The frontend expects the backend at `http://127.0.0.1:8000` by default.

## Verify

```powershell
cd backend
.\.venv\Scripts\python -m pytest -v

cd ..\frontend
npm test -- --run
npm run build
```

## Codex and GPT-5.6

Codex accelerated the repository design, API contracts, deterministic testing workflow, and frontend implementation. The planned GPT-5.6 layer uses structured outputs to translate constrained natural-language strategy descriptions into a typed specification and to audit stored deterministic evidence. It must not calculate price data, performance, or trade outcomes.

## Documentation

- [Project design](StratGuard-AI-Project-Design.md)
- [Implementation plan](docs/superpowers/plans/2026-07-19-stratguard-ai-mvp.md)
- [Demo script](docs/demo-script.md)
- [Devpost description](docs/devpost-description.md)

## Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for project ownership and AI-assisted development attribution.

## License

MIT. See [LICENSE](LICENSE).
