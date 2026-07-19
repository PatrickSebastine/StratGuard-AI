import type { Audit, BacktestRun } from "../types";

type Props = {
  result: BacktestRun;
  onAudit: () => void;
  loading: boolean;
  audit: Audit | null;
  api: string;
};

export function ReviewPanel({ result, onAudit, loading, audit, api }: Props) {
  return (
    <section id="reports" className="review-grid">
      <article className="findings-card">
        <p className="card-label">EVIDENCE REVIEW</p>
        <h2>What this run does not prove.</h2>
        <ul>{result.findings.map((finding) => <li className={finding.severity} key={finding.code}><span>{finding.severity}</span><p>{finding.message}</p></li>)}</ul>
      </article>
      <article className="actions-card">
        <p className="card-label">REPRODUCIBLE OUTPUT</p>
        <h2>Take the evidence with you.</h2>
        <a href={`${api}/api/backtests/${result.run_id}/report?format=markdown`} target="_blank" rel="noreferrer">Open Markdown report</a>
        <a href={`${api}/api/backtests/${result.run_id}/codex-review-packet`} target="_blank" rel="noreferrer">Export Codex review packet</a>
        <div className="optional-audit">
          <span>OPTIONAL GPT-5.6 REVIEW</span>
          <p>Structured interpretation of saved evidence only. It never calculates trades or performance.</p>
          <button onClick={onAudit} disabled={loading}>{loading ? "Reviewing evidence..." : "Request structured audit"}</button>
        </div>
        {audit && <div className="audit-result"><p><strong>Confidence:</strong> {audit.confidence}</p><p>{audit.what_this_does_not_prove}</p></div>}
      </article>
    </section>
  );
}
