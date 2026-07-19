from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .ai import OpenAIConfigurationError, audit_run
from .engine import run_backtest
from .metrics import calculate_metrics
from .models import Candle, Dataset, StrategySpec
from .validation import validate_run
from .reports import render_codex_review_packet, render_markdown
from .store import RunStore


app = FastAPI(title="StratGuard AI", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
store = RunStore(Path(__file__).resolve().parents[1] / ".stratguard" / "runs.db")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "product": "StratGuard AI"}


class BacktestRequest(BaseModel):
    strategy: StrategySpec = StrategySpec()


def demo_dataset() -> Dataset:
    candles: list[Candle] = []
    start = datetime(2025, 1, 1, tzinfo=timezone.utc)
    price = 100.0
    for index in range(180):
        direction = 1 if (index // 18) % 2 == 0 else -1
        drift = direction * 0.9 + ((index % 5) - 2) * 0.08
        open_price = price
        price = max(10, price + drift)
        candles.append(Candle(timestamp=start + timedelta(hours=index), open=open_price, high=max(open_price, price) + 0.4, low=min(open_price, price) - 0.4, close=price, volume=100 + index))
    return Dataset(name="btc_usdt_1h_demo_v1", candles=candles)


@app.post("/api/backtests", status_code=status.HTTP_201_CREATED)
def create_backtest(request: BacktestRequest) -> dict:
    result = run_backtest(request.strategy, demo_dataset())
    run = {
        "run_id": str(uuid4()),
        "strategy": request.strategy.model_dump(),
        "metrics": calculate_metrics(result, request.strategy.starting_capital),
        "findings": validate_run(request.strategy, result),
        "trades": [trade.model_dump(mode="json") for trade in result.trades],
        "equity_curve": result.equity_curve,
        "dataset": "btc_usdt_1h_demo_v1",
    }
    store.save(run["run_id"], run)
    return run


@app.get("/api/backtests/{run_id}/report")
def export_report(run_id: str, format: str = "markdown") -> Response:
    run = store.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Backtest run not found")
    if format == "json":
        return JSONResponse(run)
    if format == "markdown":
        return Response(render_markdown(run), media_type="text/markdown")
    raise HTTPException(status_code=422, detail="format must be markdown or json")


@app.get("/api/backtests/{run_id}/codex-review-packet")
def export_codex_review_packet(run_id: str) -> Response:
    run = store.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Backtest run not found")
    return Response(render_codex_review_packet(run), media_type="text/markdown")


@app.post("/api/backtests/{run_id}/audit")
def create_ai_audit(run_id: str) -> dict:
    run = store.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Backtest run not found")
    try:
        return audit_run(run).model_dump()
    except OpenAIConfigurationError:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "code": "openai_not_configured",
                "message": "Configure OPENAI_API_KEY to enable the optional GPT-5.6 audit.",
            },
        )


static_dir = Path(__file__).resolve().parent / "static"
app.mount("/", StaticFiles(directory=static_dir, html=True, check_dir=False), name="frontend")
