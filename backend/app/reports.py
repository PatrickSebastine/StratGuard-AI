import json


def render_markdown(run: dict) -> str:
    metrics = "\n".join(f"- **{key.replace('_', ' ').title()}:** {value}" for key, value in run["metrics"].items())
    findings = "\n".join(f"- **{item['severity'].title()}:** {item['message']}" for item in run["findings"])
    return f"""# StratGuard AI Audit Report

## Reproducibility

- **Run ID:** {run['run_id']}
- **Dataset:** {run['dataset']}
- **Engine:** deterministic SMA crossover v1
- **Strategy:** {json.dumps(run['strategy'], indent=2)}

## Metrics

{metrics}

## Credibility Findings

{findings}

## Limitation

Historical backtest results do not prove future profitability. This report is research tooling, not financial advice or order execution.
"""


def render_codex_review_packet(run: dict) -> str:
    return f"""# StratGuard AI Codex Review Packet

You are reviewing a research-only deterministic backtest. Use only the evidence below. Do not invent market data, calculate new performance results, give trading instructions, or claim future profitability. Identify unclear assumptions, evidence limitations, likely sources of bias, and the next most useful validation experiments.

## Deterministic evidence

{render_markdown(run)}

## Required response

Return concise sections for: Evidence-grounded findings, limitations, validation experiments, and what this result does not prove.
"""
