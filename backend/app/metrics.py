from .models import BacktestResult


def calculate_metrics(result: BacktestResult, starting_capital: float) -> dict[str, float | int]:
    final_equity = result.equity_curve[-1] if result.equity_curve else starting_capital
    peak = starting_capital
    max_drawdown = 0.0
    for value in result.equity_curve:
        peak = max(peak, value)
        max_drawdown = min(max_drawdown, (value / peak) - 1 if peak else 0)
    return {
        "total_return_pct": round(((final_equity / starting_capital) - 1) * 100, 2),
        "max_drawdown_pct": round(max_drawdown * 100, 2),
        "trade_count": len(result.trades),
        "final_equity": round(final_equity, 2),
    }
