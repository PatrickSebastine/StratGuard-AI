import { useState } from "react";

type Finding = { severity: string; code: string; message: string };
type AuditFinding = { severity: string; title: string; evidence: string; recommendation: string };
type Audit = { confidence: string; findings: AuditFinding[]; limitations: string[]; recommended_experiments: string[]; what_this_does_not_prove: string };
type Result = {
  run_id: string;
  dataset: string;
  metrics: Record<string, number>;
  findings: Finding[];
  trades: unknown[];
  equity_curve: number[];
};

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function App() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  async function runDemo() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/backtests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ strategy: {} }) });
      if (!response.ok) throw new Error("The offline backtest could not be completed.");
      setResult(await response.json());
      setAudit(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unexpected request failure.");
    } finally {
      setLoading(false);
    }
  }

  async function runAiAudit() {
    if (!result) return;
    setAuditLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/backtests/${result.run_id}/audit`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "The GPT-5.6 audit could not be completed.");
      setAudit(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unexpected audit failure.");
    } finally {
      setAuditLoading(false);
    }
  }

  return <main>
    <header>
      <p className="eyebrow">STRATGUARD AI / DEVELOPER TOOLS</p>
      <h1>Research-only strategy audit</h1>
      <p className="lede">Turn a constrained strategy into a reproducible backtest, then inspect what the result does not prove.</p>
      <p className="disclaimer">No exchange connection. No order placement. Not financial advice.</p>
    </header>
    <section className="panel action-panel">
      <div><h2>Offline judge demo</h2><p>BTC/USDT 1h, 20/50 SMA crossover, next-candle execution, 10 bps fees, 5 bps slippage.</p></div>
      <button onClick={runDemo} disabled={loading}>{loading ? "Running deterministic backtest…" : "Run demo audit"}</button>
    </section>
    {error && <p className="error" role="alert">{error}</p>}
    {result && <section className="results">
      <div className="panel"><p className="eyebrow">DATASET</p><h2>{result.dataset}</h2><p>{result.trades.length} recorded entries. Signals execute at the next candle open.</p></div>
      <section className="metric-grid" aria-label="Backtest metrics">
        {Object.entries(result.metrics).map(([name, value]) => <div className="metric" key={name}><span>{name.replaceAll("_", " ")}</span><strong>{typeof value === "number" ? value.toLocaleString() : value}</strong></div>)}
      </section>
      <section className="panel"><h2>Credibility findings</h2><ul>{result.findings.map((finding) => <li key={finding.code} className={finding.severity}><strong>{finding.severity}</strong><span>{finding.message}</span></li>)}</ul></section>
      <section className="panel"><h2>Reproducible report</h2><p>Export the exact strategy assumptions, deterministic metrics, and credibility findings.</p><a className="report-link" href={`${API}/api/backtests/${result.run_id}/report?format=markdown`} target="_blank" rel="noreferrer">Download Markdown report</a></section>
      <section className="panel"><h2>AI review options</h2><p>Use a configured API key for an in-app GPT-5.6 audit, or export this exact evidence packet and review it manually in Codex with your existing subscription. A Codex sign-in cannot be passed through to this app.</p><button onClick={runAiAudit} disabled={auditLoading}>{auditLoading ? "Reviewing evidence..." : "Run GPT-5.6 audit"}</button><a className="report-link" href={`${API}/api/backtests/${result.run_id}/codex-review-packet`} target="_blank" rel="noreferrer">Export Codex review packet</a>{audit && <div className="audit-result"><p><strong>Confidence:</strong> {audit.confidence}</p><p>{audit.what_this_does_not_prove}</p><ul>{audit.findings.map((finding) => <li key={finding.title}><strong>{finding.title}</strong><span>{finding.recommendation}</span></li>)}</ul></div>}</section>
    </section>}
  </main>;
}
