from datetime import datetime, timedelta, timezone

from app.engine import run_backtest
from app.models import Candle, Dataset, StrategySpec


def test_bullish_crossover_enters_at_next_candle_open() -> None:
    closes = [10, 9, 8, 9, 11, 12]
    candles = [
        Candle(
            timestamp=datetime(2025, 1, 1, tzinfo=timezone.utc) + timedelta(hours=index),
            open=close,
            high=close + 0.5,
            low=close - 0.5,
            close=close,
            volume=1,
        )
        for index, close in enumerate(closes)
    ]
    result = run_backtest(
        StrategySpec(fast_period=2, slow_period=3, stop_loss_pct=None, take_profit_pct=None),
        Dataset(name="fixture", candles=candles),
    )

    assert result.trades[0].entry_timestamp == candles[5].timestamp
    assert result.trades[0].entry_price == candles[5].open * 1.0005
