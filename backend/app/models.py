from datetime import datetime

from pydantic import BaseModel, Field, model_validator


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

    @model_validator(mode="after")
    def periods_are_ordered(self) -> "StrategySpec":
        if self.fast_period >= self.slow_period:
            raise ValueError("fast_period must be smaller than slow_period")
        return self


class Candle(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


class Dataset(BaseModel):
    name: str
    candles: list[Candle]


class Trade(BaseModel):
    entry_timestamp: datetime
    entry_price: float
    exit_timestamp: datetime | None = None
    exit_price: float | None = None
    quantity: float
    fee_paid: float


class BacktestResult(BaseModel):
    trades: list[Trade]
    equity_curve: list[float]
