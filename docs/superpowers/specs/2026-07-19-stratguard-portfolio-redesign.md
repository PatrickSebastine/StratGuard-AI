# StratGuard AI Portfolio-Inspired Redesign

## Goal

Rebuild the StratGuard AI judge experience as a premium research product that draws from Patrick Sebastine's portfolio language: near-black surfaces, warm amber accents, editorial typography, a floating pill navigation bar, and a modular card layout. The redesign must improve clarity and credibility without copying the portfolio's name, copy, or personal content.

## Product principles

- Lead with the product question: a backtest needs evidence, not belief.
- Keep the research-only boundary visible at every decision point.
- Show the main offline demo and its methodology before any optional AI action.
- Make the deterministic metrics, limitations, report export, and Codex review path look intentional and judge-ready.
- Preserve keyboard access, readable contrast, responsive layout, and no-key usability.

## Visual system

- Canvas: near-black graphite with a restrained warm amber glow at the page edge.
- Type: editorial serif display headings, clean sans-serif body copy, and compact mono-style labels for method and dataset identity.
- Accent: amber for the primary action and emphasis, cream for primary content, muted graphite borders, cyan only for neutral data-state cues.
- Layout: centered floating navigation pill, oversized split hero, and asymmetrical research cards on desktop that collapse into a single column on mobile.

## Screen structure

### Header and hero

- Floating navigation with product mark, anchor links for methodology, evidence, and reports, plus a `Run audit` button.
- Hero copy: `Backtests need evidence, not belief.`
- Supporting statement explains deterministic execution, explicit costs, and research-only constraints.
- A right-side run-status card shows the demo market, time frame, execution policy, and no-exchange status.

### Run and results

- The run button starts the existing deterministic backtest endpoint.
- Results appear in a dedicated evidence grid rather than as a linear stack.
- A large result card highlights ending equity and total return with a clear limitation label.
- Metric cards show drawdown, trade count, execution timing, and costs.
- A chart card renders the existing equity curve and contextualizes it as historic evidence, not a forecast.

### Evidence and review

- Credibility findings become a ranked `Evidence review` panel with visible severity and explicit next questions.
- The methodology panel lists the 20/50 SMA rule, next-candle execution, fees, slippage, and fixed demo dataset.
- Report export remains a first-class action.
- The optional GPT-5.6 audit remains clearly separated from deterministic calculation.
- The Codex review packet remains available without API credit and is described as a manual evidence-review handoff.

## Components and data boundaries

- `App` remains the orchestrator for the existing API calls and request state.
- Presentational sections are split into header/hero, metric cards, equity chart, evidence review, methodology, and report/review actions.
- Existing API contracts and the safe 503 missing-key state remain unchanged.
- No exchange connectivity, new market data, trading execution, or financial claims are introduced.

## Video follow-up

- Replace the synthetic narration with Patrick's provided audio track.
- Retain the faceless product footage, update captures after the redesign, and keep the final video under three minutes.
- The final narration must explain the working product, how Codex accelerated development, and GPT-5.6's structured evidence-only role.

## Verification

- Add UI tests for the new research-only hero, run action, evidence panel, and no-key review path.
- Run backend tests, frontend tests, and production build.
- Exercise the full no-key flow in a browser, then capture revised screenshots and regenerate the demo video after Patrick supplies narration.

## Non-goals

- Copying portfolio-specific content or personal information.
- Introducing an API key requirement for core functionality.
- Completing the Devpost submission before the revised site and human voiceover are verified.
