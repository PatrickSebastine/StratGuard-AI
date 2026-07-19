# StratGuard AI Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the StratGuard AI dashboard into a polished, portfolio-inspired research product while retaining the existing deterministic no-key workflow.

**Architecture:** Keep `App.tsx` as the API-state container and extract presentational React sections for the hero, evidence metrics, chart, methodology, and review actions. Keep backend contracts unchanged. Use Recharts, already installed in the frontend, for the equity curve and use CSS variables plus responsive grid layouts for the visual system.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, Recharts, FastAPI.

## Global Constraints

- Maintain the research-only boundary and no exchange connectivity.
- Core deterministic demo, Markdown report, and Codex review packet must work without `OPENAI_API_KEY`.
- The optional GPT-5.6 audit must remain visibly separate from deterministic calculation.
- Use near-black graphite, warm amber, cream type, and restrained cyan data cues.
- Preserve keyboard-accessible native buttons and links, responsive behavior, and readable contrast.
- Do not copy the portfolio's personal copy or identity.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `frontend/src/types.ts` | Shared result and finding types used by page sections. |
| `frontend/src/components/Hero.tsx` | Floating navigation, product promise, demo status, and run action. |
| `frontend/src/components/EvidenceDashboard.tsx` | Result summary, metric cards, equity chart, and methodology card. |
| `frontend/src/components/ReviewPanel.tsx` | Credibility findings, reports, GPT audit, and Codex review handoff. |
| `frontend/src/App.tsx` | API request state and composition of presentational sections. |
| `frontend/src/styles.css` | Portfolio-inspired design tokens, layouts, components, and responsive rules. |
| `frontend/src/App.test.tsx` | Judge-flow, safety boundary, and no-key UI regression coverage. |

### Task 1: Extract typed UI contracts and hero

**Files:**
- Create: `frontend/src/types.ts`, `frontend/src/components/Hero.tsx`
- Modify: `frontend/src/App.tsx`, `frontend/src/App.test.tsx`

**Interfaces:**
- Produces: `BacktestRun`, `Finding`, and `Hero({ onRun, loading }: HeroProps)`.
- Consumes: `onRun(): Promise<void>` from `App`.

- [ ] **Step 1: Write failing UI test**

```tsx
it("renders the portfolio-inspired research promise and run action", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /backtests need evidence, not belief/i })).toBeTruthy();
  expect(screen.getByRole("button", { name: /run audit/i })).toBeTruthy();
});
```

- [ ] **Step 2: Verify failure**

Run: `cd frontend; npm test -- --run`

Expected: the heading assertion fails because the new hero has not been rendered.

- [ ] **Step 3: Add shared types and the hero**

```tsx
export type Finding = { severity: string; code: string; message: string };
export type BacktestRun = {
  run_id: string; dataset: string; metrics: Record<string, number>;
  findings: Finding[]; trades: unknown[]; equity_curve: number[];
};
```

```tsx
export function Hero({ onRun, loading }: { onRun: () => void; loading: boolean }) {
  return <>
    <nav className="top-nav"><a href="#top" className="brand">SG / 01</a><a href="#methodology">Methodology</a><a href="#evidence">Evidence</a><a href="#reports">Reports</a><button onClick={onRun} disabled={loading}>{loading ? "Running audit..." : "Run audit"}</button></nav>
    <header id="top" className="hero"><div><p className="kicker">RESEARCH TERMINAL / BTC-USDT / 1H</p><h1>Backtests need <em>evidence</em>, not belief.</h1><p>StratGuard makes strategy assumptions, costs, execution timing, and limitations explicit before paper trading or deployment.</p><button onClick={onRun} disabled={loading}>{loading ? "Running audit..." : "Run the deterministic audit"}</button></div><aside className="status-card"><span>OFFLINE JUDGE DEMO</span><strong>20 / 50 SMA</strong><p>Next-candle execution<br />10 bps fee · 5 bps slippage</p><small>No exchange connection. No order placement.</small></aside></header>
  </>;
}
```

- [ ] **Step 4: Compose the hero in `App.tsx` and run tests**

Replace the current page header and action panel with `<Hero onRun={runDemo} loading={loading} />`, keeping fetch logic unchanged.

Run: `cd frontend; npm test -- --run`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/types.ts frontend/src/components/Hero.tsx frontend/src/App.tsx frontend/src/App.test.tsx
git commit -m "feat: add portfolio-inspired StratGuard hero"
```

### Task 2: Build the evidence dashboard and equity chart

**Files:**
- Create: `frontend/src/components/EvidenceDashboard.tsx`
- Modify: `frontend/src/App.tsx`, `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: `BacktestRun` from `types.ts`.
- Produces: `EvidenceDashboard({ result }: { result: BacktestRun })`.

- [ ] **Step 1: Write failing dashboard test**

```tsx
it("renders evidence metrics and the equity curve after a run", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => demoRun }));
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /run audit/i }));
  expect(await screen.findByRole("region", { name: /equity curve/i })).toBeTruthy();
  expect(screen.getByText(/methodology/i)).toBeTruthy();
});
```

- [ ] **Step 2: Verify failure**

Run: `cd frontend; npm test -- --run`

Expected: no equity-curve region exists.

- [ ] **Step 3: Implement the dashboard**

```tsx
const chartData = result.equity_curve.map((equity, index) => ({ index, equity }));
return <section id="evidence" className="evidence-grid">
  <article className="result-card"><p>DETERMINISTIC RESULT</p><strong>{result.metrics.final_equity.toLocaleString()}</strong><span>Final equity from a fixed demo dataset</span></article>
  <section className="metric-grid">{metricEntries.map(([label, value]) => <article className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
  <article className="chart-card"><div><p>EQUITY PATH</p><h2>Historic evidence, not a forecast.</h2></div><div role="region" aria-label="Equity curve"><ResponsiveContainer width="100%" height={260}><AreaChart data={chartData}><Area dataKey="equity" stroke="#ffb84d" fill="#ffb84d22" /></AreaChart></ResponsiveContainer></div></article>
  <article id="methodology" className="method-card"><p>METHODOLOGY</p><ul><li>20 / 50 SMA crossover</li><li>Next-candle execution</li><li>10 bps fee and 5 bps slippage</li><li>Fixed BTC/USDT 1h demo data</li></ul></article>
</section>;
```

- [ ] **Step 4: Render dashboard after a completed run and verify**

Run: `cd frontend; npm test -- --run; npm run build`

Expected: all tests pass and Vite build succeeds.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/components/EvidenceDashboard.tsx frontend/src/App.tsx frontend/src/App.test.tsx
git commit -m "feat: add evidence dashboard and equity chart"
```

### Task 3: Redesign evidence review and no-key actions

**Files:**
- Create: `frontend/src/components/ReviewPanel.tsx`
- Modify: `frontend/src/App.tsx`, `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: `BacktestRun`, audit state, `onAudit(): Promise<void>`, and API base URL.
- Produces: `ReviewPanel` with report and Codex review packet links.

- [ ] **Step 1: Write failing no-key test**

```tsx
it("keeps the Codex review packet available when the optional GPT audit is unavailable", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => demoRun })
    .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Configure OPENAI_API_KEY to enable the optional GPT-5.6 audit." }) }));
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /run audit/i }));
  await userEvent.click(await screen.findByRole("button", { name: /request structured audit/i }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByRole("link", { name: /export codex review packet/i })).toBeTruthy();
});
```

- [ ] **Step 2: Verify failure**

Run: `cd frontend; npm test -- --run`

Expected: the new review-panel labels do not exist.

- [ ] **Step 3: Implement `ReviewPanel`**

```tsx
export function ReviewPanel({ result, onAudit, loading, audit, api }: Props) {
  return <section id="reports" className="review-grid">
    <article className="findings-card"><p>EVIDENCE REVIEW</p><h2>What this run does not prove.</h2><ul>{result.findings.map(finding => <li className={finding.severity} key={finding.code}><span>{finding.severity}</span><p>{finding.message}</p></li>)}</ul></article>
    <article className="actions-card"><p>REPRODUCIBLE OUTPUT</p><a href={`${api}/api/backtests/${result.run_id}/report?format=markdown`} target="_blank" rel="noreferrer">Open Markdown report ↗</a><a href={`${api}/api/backtests/${result.run_id}/codex-review-packet`} target="_blank" rel="noreferrer">Export Codex review packet ↗</a><div className="optional-audit"><span>OPTIONAL GPT-5.6 REVIEW</span><p>Structured interpretation of saved evidence only. It never calculates trades or performance.</p><button onClick={onAudit} disabled={loading}>{loading ? "Reviewing evidence..." : "Request structured audit"}</button></div>{audit && <p>{audit.what_this_does_not_prove}</p>}</article>
  </section>;
}
```

- [ ] **Step 4: Verify no-key state and build**

Run: `cd frontend; npm test -- --run; npm run build`

Expected: no-key alert and packet link both render, and the build passes.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/components/ReviewPanel.tsx frontend/src/App.tsx frontend/src/App.test.tsx
git commit -m "feat: elevate evidence review actions"
```

### Task 4: Apply the portfolio-inspired responsive visual system

**Files:**
- Modify: `frontend/src/styles.css`
- Test: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes semantic classes from Tasks 1 through 3.
- Produces responsive desktop and mobile layouts without changing API behavior.

- [ ] **Step 1: Add a responsive visual smoke test**

```tsx
it("retains a visible research-only boundary", () => {
  render(<App />);
  expect(screen.getByText(/no exchange connection/i)).toBeTruthy();
});
```

- [ ] **Step 2: Verify failure only if the copy was removed**

Run: `cd frontend; npm test -- --run`

Expected: existing safety copy remains visible before styling work.

- [ ] **Step 3: Replace the stylesheet with design tokens and component layouts**

```css
:root { --ink:#0b0a0d; --panel:#141217; --line:#2d2931; --cream:#f4eee4; --muted:#b8b0a6; --amber:#ffb448; --cyan:#87d7e7; color:var(--cream); background:var(--ink); font-family:Inter,ui-sans-serif,system-ui,sans-serif; }
body { margin:0; background:radial-gradient(circle at 0 0,#4b321a 0,transparent 34rem),var(--ink); }
.top-nav { position:sticky; top:18px; z-index:3; display:flex; gap:22px; align-items:center; width:max-content; max-width:calc(100% - 32px); margin:18px auto; padding:10px 12px 10px 18px; border:1px solid var(--line); border-radius:999px; background:#0d0c10dd; backdrop-filter:blur(16px); }
.hero h1 { max-width:760px; font-family:Georgia,serif; font-size:clamp(4rem,9vw,8.5rem); font-weight:400; line-height:.9; letter-spacing:-.07em; } .hero h1 em { color:var(--amber); }
.hero,.evidence-grid,.review-grid { display:grid; gap:18px; grid-template-columns:repeat(12,minmax(0,1fr)); } .hero>div { grid-column:span 8; } .status-card { grid-column:span 4; }
.result-card,.metric-card,.chart-card,.method-card,.findings-card,.actions-card,.status-card { border:1px solid var(--line); border-radius:20px; background:linear-gradient(145deg,#17141a,#101015); padding:24px; }
@media (max-width:760px) { .top-nav a:not(.brand){display:none}.hero,.evidence-grid,.review-grid{display:block}.hero>*,.evidence-grid>*,.review-grid>*{margin-bottom:14px}.hero h1{font-size:clamp(3.5rem,17vw,5.6rem)} }
```

- [ ] **Step 4: Run visual and automated verification**

Run: `cd frontend; npm test -- --run; npm run build`

Expected: tests and the production build pass.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/styles.css frontend/src/App.test.tsx
git commit -m "feat: apply StratGuard research product visual system"
```

### Task 5: Judge-flow verification and release assets

**Files:**
- Modify: `docs/build-sequence.md`, `docs/verification-2026-07-19.md`, `docs/demo-video/narration.txt`
- Create: revised screenshot files in `docs/screenshots/`

- [ ] **Step 1: Start local backend and frontend, then complete the no-key path**

Run: `cd backend; .\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` and `cd frontend; npm run dev -- --host 127.0.0.1 --port 5173`.

Expected: health endpoint returns `{"status":"ok","product":"StratGuard AI"}` and the redesigned UI runs the demo.

- [ ] **Step 2: Capture revised screenshots after browser verification**

Capture landing, evidence dashboard, and evidence-review actions at readable desktop dimensions.

- [ ] **Step 3: Replace synthetic narration only after Patrick supplies a recorded voice track**

Use the supplied audio file as the narration input to the existing faceless video pipeline. Verify with `ffprobe` that the video is below 180 seconds and contains H.264 video plus AAC audio.

- [ ] **Step 4: Run full verification**

Run: `cd backend; .\.venv\Scripts\python -m pytest -q; cd ..\frontend; npm test -- --run; npm run build`.

Expected: all backend and frontend tests pass and the production build succeeds.

- [ ] **Step 5: Commit and push**

```powershell
git add frontend docs
git commit -m "feat: redesign StratGuard judge experience"
git push origin main
```

## Plan self-review

- Spec coverage: Tasks 1-4 implement the hero, card system, evidence metrics, equity chart, methodology, no-key review, responsive design, and safety boundary. Task 5 covers revised media and verification.
- Scope: No backend contract, exchange, market-data, or execution change is proposed.
- Consistency: All section components consume the single `BacktestRun` type and keep `App` as the only request-state owner.
- No placeholder scan: no TBD, TODO, or undefined interface names remain.
