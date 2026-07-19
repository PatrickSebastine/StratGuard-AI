# StratGuard AI MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Build a judge-ready, research-only web app that turns a constrained crypto strategy into a reproducible backtest and an evidence-based audit.

**Architecture:** A React/Vite client renders a single guided judge path. FastAPI owns Pydantic contracts, bundled-data validation, deterministic long-only backtesting, metrics, validation, report export, SQLite history, and optional OpenAI Responses API calls. GPT-5.6 generates schema-valid specifications and audits stored evidence; it never calculates a price, trade, or metric.

**Tech Stack:** Python 3.12, FastAPI, Pydantic, pandas, NumPy, pytest, SQLite, React, TypeScript, Vite, Recharts, Vitest, OpenAI Python SDK.

## Global Constraints

- Bundle BTC/USDT OHLCV CSV and make the default demo fully offline.
- Scope v1 to a long-only SMA crossover: one position, next-candle entry, reverse-crossover exit, percentage sizing, fees, slippage, stop loss, and take profit.
- Do not connect to exchanges, request credentials, place orders, or present financial advice.
- Save strategy, dataset identity, engine version, assumptions, metrics, findings, and report for every run.
- A missing \`OPENAI_API_KEY\` must not disable local backtests or report export.
- The README must give judges a no-key route, an optional-key route, tests, demo instructions, and clear Codex/GPT-5.6 evidence.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| \`backend/app/models.py\` | API, strategy, run, metric, finding, and AI schemas |
| \`backend/app/data.py\` | OHLCV validation and bundled-data loader |
| \`backend/app/engine.py\` | Indicator alignment, execution, equity, and trades |
| \`backend/app/metrics.py\` | Deterministic performance statistics |
| \`backend/app/validation.py\` | Evidence-based credibility findings |
| \`backend/app/ai.py\` | Optional structured specification and audit calls |
| \`backend/app/store.py\` | SQLite history and comparison |
| \`backend/app/reports.py\` | Markdown and JSON report export |
| \`backend/app/main.py\` | FastAPI composition and endpoints |
| \`frontend/src/App.tsx\` | Guided app workflow |
| \`frontend/src/components/*.tsx\` | Form, metrics, charts, warnings, and audit views |
| \`backend/tests/*.py\` | Unit and endpoint tests |
| \`frontend/src/*.test.tsx\` | UI and degraded-state tests |

### Task 1: Project shell and health contract

**Files:**
- Create: \`.gitignore\`, \`README.md\`, \`backend/pyproject.toml\`, \`backend/app/__init__.py\`, \`backend/app/main.py\`, \`backend/tests/test_api.py\`, \`frontend/package.json\`, \`frontend/vite.config.ts\`, \`frontend/src/main.tsx\`

**Interfaces:**
- Produces: \`GET /api/health -> {status: "ok", product: "StratGuard AI"}\`.

- [ ] **Step 1: Write the failing test**

\`\`\`python
def test_health_returns_product_identity(client):
    assert client.get("/api/health").json() == {"status": "ok", "product": "StratGuard AI"}
\`\`\`

- [ ] **Step 2: Verify it fails**

Run: \`cd backend; pytest tests/test_api.py::test_health_returns_product_identity -v\`  
Expected: FAIL because \`app.main\` does not exist.

- [ ] **Step 3: Add the smallest runnable app**

\`\`\`python
from fastapi import FastAPI
app = FastAPI(title="StratGuard AI")

@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "product": "StratGuard AI"}
\`\`\`

- [ ] **Step 4: Verify and commit**

Run: \`cd backend; pytest -q\`  
Expected: PASS.

\`\`\`powershell
git add .gitignore README.md backend frontend
git commit -m "chore: scaffold StratGuard AI"
\`\`\`

### Task 2: Contracts and deterministic dataset validation

**Files:**
- Create: \`backend/app/models.py\`, \`backend/app/data.py\`, \`backend/data/btcusdt_1h_sample.csv\`, \`backend/tests/test_data.py\`

**Interfaces:**
- Produces: \`StrategySpec\`, \`Dataset\`, and \`load_dataset(path) -> Dataset\`.

- [ ] **Step 1: Write failing tests**

\`\`\`python
def test_rejects_duplicate_timestamps(tmp_path):
    path = tmp_path / "bad.csv"
    path.write_text("timestamp,open,high,low,close,volume\n2025-01-01T00:00:00Z,1,2,0.5,1.5,1\n2025-01-01T00:00:00Z,1,2,0.5,1.5,1\n")
    with pytest.raises(ValueError, match="duplicate timestamp"):
        load_dataset(path)
\`\`\`

- [ ] **Step 2: Verify failure**

Run: \`cd backend; pytest tests/test_data.py -v\`  
Expected: FAIL because \`load_dataset\` is undefined.

- [ ] **Step 3: Implement**

\`\`\`python
class StrategySpec(BaseModel):
    symbol: str = "BTC/USDT"
    timeframe: str = "1h"
    fast_period: int = Field(default=20, ge=2)
    slow_period: int = Field(default=50, ge=3)
    starting_capital: float = Field(default=10_000, gt=0)
    position_fraction: float = Field(default=1.0, gt=0, le=1)
    fee_bps: float = Field(default=10, ge=0)
    slippage_bps: float = Field(default=5, ge=0)
    stop_loss_pct: float | None = Field(default=0.05, gt=0, lt=1)
    take_profit_pct: float | None = Field(default=0.10, gt=0, lt=1)
\`\`\`

Validate required columns, UTC timestamps, ascending unique rows, positive OHLCV values, and \`low <= min(open, close) <= max(open, close) <= high\`.

- [ ] **Step 4: Verify and commit**

Run: \`cd backend; pytest tests/test_data.py -v\`  
Expected: PASS for valid data and duplicate, invalid-price, invalid-OHLC, and insufficient-history cases.

\`\`\`powershell
git add backend/app/models.py backend/app/data.py backend/data backend/tests/test_data.py
git commit -m "feat: validate deterministic OHLCV data"
\`\`\`

### Task 3: No-look-ahead engine, metrics, and validation

**Files:**
- Create: \`backend/app/engine.py\`, \`backend/app/metrics.py\`, \`backend/app/validation.py\`, \`backend/tests/test_engine.py\`, \`backend/tests/test_metrics.py\`, \`backend/tests/test_validation.py\`

**Interfaces:**
- Consumes: \`StrategySpec\` and \`Dataset\`.
- Produces: \`run_backtest(spec, dataset) -> BacktestResult\`, \`calculate_metrics(result) -> Metrics\`, \`validate_run(...) -> list[Finding]\`.

- [ ] **Step 1: Write timing and credibility failures**

\`\`\`python
def test_crossover_executes_at_next_candle_open(dataset):
    result = run_backtest(StrategySpec(fast_period=2, slow_period=3), dataset)
    assert result.trades[0].entry_timestamp == dataset.candles[4].timestamp

def test_flags_insufficient_trade_evidence(result_with_one_trade, dataset):
    findings = validate_run(StrategySpec(), dataset, result_with_one_trade, metrics)
    assert any(f.code == "insufficient_trade_count" for f in findings)
\`\`\`

- [ ] **Step 2: Verify failure**

Run: \`cd backend; pytest tests/test_engine.py tests/test_metrics.py tests/test_validation.py -v\`  
Expected: FAIL because the engine and evidence functions do not exist.

- [ ] **Step 3: Implement the deterministic rules**

Compute SMA values through candle \`t\`; on a bullish crossover at \`t\`, enter at the open of \`t + 1\` plus buy slippage. Exit with reverse crossover, stop loss, or take profit, deducting fee at every fill. One open position maximum. Calculate total return, buy-and-hold return, maximum drawdown, trade count, win rate, profit factor, average trade, exposure, total fees, and Sharpe only when enough return observations exist. Emit evidence-bearing findings for insufficient history, few or no trades, zero costs, high drawdown, and missing stop protection.

\`\`\`python
def execution_price(open_price: float, bps: float, side: Literal["buy", "sell"]) -> float:
    return open_price * (1 + bps / 10_000 if side == "buy" else 1 - bps / 10_000)
\`\`\`

- [ ] **Step 4: Verify and commit**

Run: \`cd backend; pytest tests/test_engine.py tests/test_metrics.py tests/test_validation.py -v\`  
Expected: PASS, including next-candle timing, fee/slippage, stop/target, and one-position tests.

\`\`\`powershell
git add backend/app/engine.py backend/app/metrics.py backend/app/validation.py backend/tests
git commit -m "feat: add deterministic backtesting evidence engine"
\`\`\`

### Task 4: Offline APIs, persistence, comparison, and exports

**Files:**
- Create: \`backend/app/store.py\`, \`backend/app/reports.py\`, \`backend/tests/test_store.py\`
- Modify: \`backend/app/main.py\`, \`backend/tests/test_api.py\`

**Interfaces:**
- Produces: \`POST /api/backtests\`, \`GET /api/backtests/{id}\`, \`GET /api/backtests/{id}/report?format=markdown|json\`, \`GET /api/backtests/{id}/compare/{other_id}\`.

- [ ] **Step 1: Write a failing endpoint test**

\`\`\`python
def test_demo_backtest_returns_evidence(client):
    response = client.post("/api/backtests", json={"strategy": {}})
    body = response.json()
    assert response.status_code == 201
    assert "metrics" in body and "findings" in body and "trades" in body
\`\`\`

- [ ] **Step 2: Verify failure**

Run: \`cd backend; pytest tests/test_api.py::test_demo_backtest_returns_evidence -v\`  
Expected: FAIL with HTTP 404.

- [ ] **Step 3: Implement the API flow**

Use the bundled dataset without a request upload, issue a \`uuid4\` run id, run Tasks 2-3 functions, persist JSON in one SQLite \`runs\` table, and export a Markdown report containing dataset identity, exact strategy, engine version, assumptions, metrics, findings, and limitations. Return HTTP 422 for invalid strategies and HTTP 400 for invalid CSV data.

- [ ] **Step 4: Verify and commit**

Run: \`cd backend; pytest tests/test_api.py tests/test_store.py -v\`  
Expected: PASS for offline run, invalid input, retrieval, comparison delta, and both report formats.

\`\`\`powershell
git add backend/app/main.py backend/app/store.py backend/app/reports.py backend/tests
git commit -m "feat: expose offline audit and comparison APIs"
\`\`\`

### Task 5: Optional GPT-5.6 specification and audit services

**Files:**
- Create: \`backend/app/ai.py\`, \`backend/tests/test_ai.py\`
- Modify: \`backend/app/main.py\`, \`backend/app/models.py\`

**Interfaces:**
- Produces: \`POST /api/specifications/generate\` and \`POST /api/backtests/{id}/audit\`.

- [ ] **Step 1: Write the missing-key failure test**

\`\`\`python
def test_audit_returns_configuration_error_without_api_key(client, monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = client.post("/api/backtests/demo-run/audit")
    assert response.status_code == 503
    assert response.json()["code"] == "openai_not_configured"
\`\`\`

- [ ] **Step 2: Verify failure**

Run: \`cd backend; pytest tests/test_ai.py::test_audit_returns_configuration_error_without_api_key -v\`  
Expected: FAIL with HTTP 404.

- [ ] **Step 3: Implement structured calls**

Define Pydantic \`GeneratedSpecification\` and \`AuditReport\` models. Call \`gpt-5.6\` through the Responses API with structured output. Reject rules outside SMA-crossover support. Audit prompts receive only strategy, saved deterministic metrics, validation findings, and a summarized trade history. Map missing key, timeout, refusal, schema, and provider errors to explicit API codes; local results remain available.

- [ ] **Step 4: Verify and commit**

Run: \`cd backend; pytest tests/test_ai.py -v\`  
Expected: PASS for missing key, mocked valid specification/audit, and rejected unsupported rule.

\`\`\`powershell
git add backend/app/ai.py backend/app/models.py backend/app/main.py backend/tests/test_ai.py
git commit -m "feat: add optional GPT-5.6 structured audits"
\`\`\`

### Task 6: React judge experience

**Files:**
- Create: \`frontend/src/api.ts\`, \`frontend/src/types.ts\`, \`frontend/src/App.tsx\`, \`frontend/src/styles.css\`, \`frontend/src/components/StrategyForm.tsx\`, \`frontend/src/components/MetricGrid.tsx\`, \`frontend/src/components/FindingList.tsx\`, \`frontend/src/components/EquityChart.tsx\`, \`frontend/src/components/AuditPanel.tsx\`, \`frontend/src/App.test.tsx\`

**Interfaces:**
- Consumes: Task 4 and 5 API responses.
- Produces: configure, run, inspect, audit, compare, and export in one guided screen.

- [ ] **Step 1: Write the UI test**

\`\`\`tsx
it("runs the bundled strategy and renders credibility findings", async () => {
  render(<App />)
  await userEvent.click(screen.getByRole("button", {name: /run demo audit/i}))
  expect(await screen.findByText(/credibility findings/i)).toBeInTheDocument()
})
\`\`\`

- [ ] **Step 2: Verify failure**

Run: \`cd frontend; npm test -- --run\`  
Expected: FAIL because \`App\` does not exist.

- [ ] **Step 3: Implement visual hierarchy**

Show the research-only boundary; prefill 20/50 SMA and realistic costs; state next-candle execution; render metrics, a Recharts equity/drawdown chart, trade/benchmark summary, severity-ranked findings, report links, saved-run comparison, and an AI panel that says “Configure API key to enable” while leaving the rest usable.

- [ ] **Step 4: Verify and commit**

Run: \`cd frontend; npm test -- --run; npm run build\`  
Expected: PASS and no TypeScript errors.

\`\`\`powershell
git add frontend
git commit -m "feat: build StratGuard audit dashboard"
\`\`\`

### Task 7: Submission assets and end-to-end verification

**Files:**
- Modify: \`README.md\`
- Create: \`LICENSE\`, \`docs/demo-script.md\`, \`docs/devpost-description.md\`, \`docs/screenshots/.gitkeep\`, \`docs/verification-2026-07-19.md\`

- [ ] **Step 1: Write acceptance checklist**

\`\`\`markdown
- [ ] A judge can run the offline demo in two commands.
- [ ] The README distinguishes deterministic calculations from GPT-5.6 reasoning.
- [ ] The app works without an API key or exchange account.
- [ ] The demo script explains the problem, proof, limitation, Codex, and GPT-5.6 in under three minutes.
\`\`\`

- [ ] **Step 2: Add artefacts**

Document setup, no-key demo, optional key configuration, tests, architecture, data provenance, safety limitations, Codex contribution, GPT-5.6 Structured Outputs usage, the build thread’s \`/feedback\` ID placeholder, screenshot checklist, Devpost copy, and shot-by-shot video script.

- [ ] **Step 3: Run full verification**

Run: \`cd backend; pytest -q\` and \`cd frontend; npm test -- --run; npm run build\`  
Expected: all tests PASS and production build completes.

- [ ] **Step 4: Manually verify the offline flow**

Run both servers, complete the default 20/50 strategy, inspect a metric and warning, download a Markdown report, then reload the saved run. Record exact results, commit SHA, screenshots, and whether a real OpenAI smoke test ran in \`docs/verification-2026-07-19.md\`.

- [ ] **Step 5: Commit**

\`\`\`powershell
git add README.md LICENSE docs
git commit -m "docs: prepare StratGuard submission evidence"
\`\`\`

## Plan Self-Review

- Coverage: Tasks 2-4 build reproducible backtesting, validation, history, comparison, and export; Task 5 applies GPT-5.6 only as structured interpretation; Task 6 creates a coherent product experience; Task 7 covers the judge path and submission artefacts.
- Scope: SMA is intentionally the only v1 strategy. EMA, RSI, breakouts, uploads, regime analysis, and sensitivity sweeps remain post-submission extensions.
- Safety: no task creates exchange connectivity or financial advice.
- The only submission-time value not available today is the \`/feedback\` session ID, which must be collected after core functionality is built.

