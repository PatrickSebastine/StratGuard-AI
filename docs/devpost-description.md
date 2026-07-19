# Devpost Project Description

## Inspiration

Backtests often look convincing because their assumptions are invisible. We wanted a developer tool that treats reproducibility and skepticism as first-class product features.

## What it does

StratGuard AI runs a constrained strategy through a deterministic backtest, applies next-candle execution, includes costs, and surfaces evidence-based credibility findings. Its optional GPT-5.6 layer converts strategy intent into typed specifications and audits the deterministic results, without inventing market data or performance.

## How we built it

React provides the guided audit experience. FastAPI and Pydantic validate contracts. The Python engine calculates signals, trade timing, equity, and metrics. Codex accelerated the test-first build and documentation workflow. GPT-5.6 is used only for structured interpretation and audit output.

## Challenges

The key challenge was maintaining an honest boundary between AI reasoning and deterministic financial calculation. We chose a deliberately narrow SMA vertical slice so execution timing and assumptions can be tested and demonstrated clearly.

## What's next

Add structured GPT-5.6 calls, saved comparisons, report export, CSV import, more constrained strategy families, and sensitivity/regime analysis while preserving the research-only safety boundary.
