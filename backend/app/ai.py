import json
import os
from typing import Literal

from pydantic import BaseModel, Field


class OpenAIConfigurationError(RuntimeError):
    """Raised when the optional model-assisted audit is not configured."""


class AuditFinding(BaseModel):
    severity: Literal["info", "warning", "critical"]
    title: str
    evidence: str
    recommendation: str


class AuditReport(BaseModel):
    confidence: Literal["low", "medium", "high"]
    findings: list[AuditFinding] = Field(max_length=6)
    limitations: list[str] = Field(max_length=6)
    recommended_experiments: list[str] = Field(max_length=5)
    what_this_does_not_prove: str


def audit_run(run: dict) -> AuditReport:
    """Audit an existing deterministic run without adding external market claims."""
    if not os.environ.get("OPENAI_API_KEY"):
        raise OpenAIConfigurationError("OPENAI_API_KEY is not configured")

    from openai import OpenAI

    evidence = json.dumps(
        {
            "strategy": run["strategy"],
            "dataset": run["dataset"],
            "metrics": run["metrics"],
            "findings": run["findings"],
            "trades": run["trades"],
        },
        default=str,
    )
    client = OpenAI()
    response = client.responses.parse(
        model="gpt-5.6",
        input=[
            {
                "role": "system",
                "content": (
                    "You are StratGuard AI's research-only backtest auditor. Return only the supplied "
                    "schema. Use only the deterministic evidence provided. Do not invent market data, "
                    "performance claims, trading instructions, or certainty. Call out limitations and "
                    "explain what the run does not prove."
                ),
            },
            {"role": "user", "content": f"Audit this backtest evidence:\n{evidence}"},
        ],
        text_format=AuditReport,
    )
    for output in response.output:
        if output.type != "message":
            continue
        for item in output.content:
            if item.type == "refusal":
                raise RuntimeError(f"OpenAI refused the audit: {item.refusal}")
            if item.parsed:
                return item.parsed
    raise RuntimeError("OpenAI returned no structured audit report")
