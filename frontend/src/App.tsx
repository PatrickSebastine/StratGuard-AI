import { useState } from "react";
import { EvidenceDashboard } from "./components/EvidenceDashboard";
import { Hero } from "./components/Hero";
import { ReviewPanel } from "./components/ReviewPanel";
import type { Audit, BacktestRun } from "./types";


const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function App() {
  const [result, setResult] = useState<BacktestRun | null>(null);
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
    <Hero onRun={runDemo} loading={loading} />
    {error && <p className="error" role="alert">{error}</p>}
    {result && <section className="results">
      <EvidenceDashboard result={result} />
      <ReviewPanel result={result} onAudit={runAiAudit} loading={auditLoading} audit={audit} api={API} />
    </section>}
  </main>;
}
