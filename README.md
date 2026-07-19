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
- Saved Markdown and JSON reports for each completed run.
- Optional GPT-5.6 structured audit of a saved run's deterministic evidence.
- React dashboard that works without exchange accounts, live market data, or an OpenAI API key.

## Safety boundary

StratGuard AI is not financial advice, a profitability predictor, or trading execution software. It does not connect to exchanges, request exchange credentials, place orders, or claim a historical backtest proves future performance.

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -e .
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

## Optional GPT-5.6 audit

Set `OPENAI_API_KEY` before starting the backend to enable `POST /api/backtests/{run_id}/audit`. The endpoint uses the Responses API structured-output helper with a Pydantic schema and `gpt-5.6`. It receives only the saved strategy, metrics, findings, and trades from that deterministic run. The model cannot calculate market data, alter results, connect to an exchange, or place trades.

Without a key, the dashboard and deterministic reports remain fully available. The audit endpoint returns `503` with `openai_not_configured` so the UI never implies an AI review happened when it did not.

### Using your Codex subscription without API credit

Codex subscription sign-in authorizes the Codex desktop app, CLI, and IDE extension, not a separate web application's backend. StratGuard therefore includes an **Export Codex review packet** option. Open the generated Markdown in Codex and ask it to perform the included evidence-only review. This uses your existing Codex session while keeping the resulting review explicitly manual and reproducible.

## Deploy

The repository includes a Dockerfile and `render.yaml` for a single-service Render deployment. The container builds the React dashboard and serves it through FastAPI, keeping the no-key demo available at the same public URL as the API.

1. Sign in to [Render](https://render.com/) and create a Blueprint from this GitHub repository.
2. Review the generated `stratguard-ai` web service, then deploy it on the free plan.
3. Open `https://<your-service>.onrender.com/api/health` and then the root URL to run the no-key judge flow.

Do not set `OPENAI_API_KEY` unless you intentionally want usage-based API billing. The Codex review-packet export works without it.

## Codex contribution

Codex accelerated the repository design, API contracts, deterministic testing workflow, frontend implementation, and documentation.

## Documentation

- [Project design](StratGuard-AI-Project-Design.md)
- [Implementation plan](docs/superpowers/plans/2026-07-19-stratguard-ai-mvp.md)
- [Demo script](docs/demo-script.md)
- [Devpost description](docs/devpost-description.md)
- [Judge-ready build sequence](docs/build-sequence.md)
- [Verification record](docs/verification-2026-07-19.md)

## Contributors

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for project ownership and AI-assisted development attribution.

## License

MIT. See [LICENSE](LICENSE).
