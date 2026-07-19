import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BacktestRun } from "../types";

const metricLabels: Record<string, string> = {
  final_equity: "Final equity",
  total_return_pct: "Total return",
  max_drawdown_pct: "Max drawdown",
  trade_count: "Trade count",
};

function formatMetric(name: string, value: number) {
  if (name.endsWith("_pct")) return `${value.toFixed(2)}%`;
  if (name === "final_equity") return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return value.toLocaleString();
}

export function EvidenceDashboard({ result }: { result: BacktestRun }) {
  const chartData = result.equity_curve.map((equity, index) => ({ index, equity }));
  const metricEntries = Object.entries(result.metrics);

  return (
    <section id="evidence" className="evidence-grid" aria-label="Evidence dashboard">
      <article className="result-card">
        <p className="card-label">DETERMINISTIC RESULT</p>
        <strong>{formatMetric("final_equity", result.metrics.final_equity ?? 0)}</strong>
        <span>Final equity from a fixed demo dataset</span>
      </article>
      <article className="dataset-card">
        <p className="card-label">DATASET</p>
        <h2>{result.dataset}</h2>
        <p>{result.trades.length} recorded entries. Signals execute at the next candle open.</p>
      </article>
      <section className="metric-grid" aria-label="Backtest metrics">
        {metricEntries.map(([name, value]) => (
          <article className="metric-card" key={name}>
            <span>{metricLabels[name] ?? name.replaceAll("_", " ")}</span>
            <strong>{formatMetric(name, value)}</strong>
          </article>
        ))}
      </section>
      <article className="chart-card">
        <div className="section-heading">
          <p className="card-label">EQUITY PATH</p>
          <h2>Historic evidence, not a forecast.</h2>
        </div>
        <div role="region" aria-label="Equity curve" className="chart-region">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 16, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="equityFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffb448" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#ffb448" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ background: "#17141a", border: "1px solid #38313a", borderRadius: "10px" }} labelStyle={{ color: "#b8b0a6" }} />
              <Area type="monotone" dataKey="equity" stroke="#ffb448" strokeWidth={2} fill="url(#equityFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
      <article id="methodology" className="method-card">
        <p className="card-label">METHODOLOGY</p>
        <ul>
          <li>20 / 50 SMA crossover</li>
          <li>Next-candle execution</li>
          <li>10 bps fee and 5 bps slippage</li>
          <li>Fixed BTC/USDT 1h demo data</li>
        </ul>
      </article>
    </section>
  );
}
