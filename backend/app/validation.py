from .models import BacktestResult, StrategySpec


def validate_run(spec: StrategySpec, result: BacktestResult) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    if len(result.trades) < 10:
        findings.append({"severity": "warning", "code": "insufficient_trade_count", "message": "Fewer than 10 trades is limited evidence, not proof of robustness."})
    if spec.fee_bps == 0 and spec.slippage_bps == 0:
        findings.append({"severity": "warning", "code": "zero_cost_assumption", "message": "Zero fees and slippage can overstate historical performance."})
    findings.append({"severity": "info", "code": "research_only", "message": "Historical results do not prove future profitability."})
    return findings
