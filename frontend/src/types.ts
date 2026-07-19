export type Finding = { severity: string; code: string; message: string };

export type AuditFinding = {
  severity: string;
  title: string;
  evidence: string;
  recommendation: string;
};

export type Audit = {
  confidence: string;
  findings: AuditFinding[];
  limitations: string[];
  recommended_experiments: string[];
  what_this_does_not_prove: string;
};

export type BacktestRun = {
  run_id: string;
  dataset: string;
  metrics: Record<string, number>;
  findings: Finding[];
  trades: unknown[];
  equity_curve: number[];
};
