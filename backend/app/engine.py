from .models import BacktestResult, Dataset, StrategySpec, Trade


def run_backtest(spec: StrategySpec, dataset: Dataset) -> BacktestResult:
    closes = [candle.close for candle in dataset.candles]
    cash = spec.starting_capital
    trades: list[Trade] = []
    equity_curve: list[float] = []
    position: Trade | None = None
    for index, candle in enumerate(dataset.candles):
        if index >= spec.slow_period:
            prior_fast = sum(closes[index - spec.fast_period : index]) / spec.fast_period
            prior_slow = sum(closes[index - spec.slow_period : index]) / spec.slow_period
            current_fast = sum(closes[index - spec.fast_period + 1 : index + 1]) / spec.fast_period
            current_slow = sum(closes[index - spec.slow_period + 1 : index + 1]) / spec.slow_period
            bullish_cross = prior_fast <= prior_slow and current_fast > current_slow
            if bullish_cross and position is None and index + 1 < len(dataset.candles):
                next_candle = dataset.candles[index + 1]
                entry_price = next_candle.open * (1 + spec.slippage_bps / 10_000)
                gross = cash * spec.position_fraction
                fee = gross * spec.fee_bps / 10_000
                quantity = (gross - fee) / entry_price
                position = Trade(
                    entry_timestamp=next_candle.timestamp,
                    entry_price=entry_price,
                    quantity=quantity,
                    fee_paid=fee,
                )
                trades.append(position)
                cash -= gross
        equity_curve.append(cash + (position.quantity * candle.close if position else 0))
    return BacktestResult(trades=trades, equity_curve=equity_curve)
