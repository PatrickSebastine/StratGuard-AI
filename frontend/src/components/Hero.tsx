type HeroProps = {
  onRun: () => void;
  loading: boolean;
};

export function Hero({ onRun, loading }: HeroProps) {
  const runLabel = loading ? "Running audit..." : "Run audit";

  return (
    <>
      <nav className="top-nav" aria-label="Primary navigation">
        <a href="#top" className="brand">SG / 01</a>
        <a href="#methodology">Methodology</a>
        <a href="#evidence">Evidence</a>
        <a href="#reports">Reports</a>
        <button onClick={onRun} disabled={loading}>{runLabel}</button>
      </nav>
      <header id="top" className="hero">
        <div className="hero-copy">
          <p className="kicker">RESEARCH TERMINAL / BTC-USDT / 1H</p>
          <h1>Backtests need <em>evidence</em>, not belief.</h1>
          <p className="hero-lede">StratGuard makes strategy assumptions, costs, execution timing, and limitations explicit before paper trading or deployment.</p>
          <button className="primary-action" onClick={onRun} disabled={loading}>
            {loading ? "Running deterministic audit..." : "Run the deterministic audit"}
          </button>
        </div>
        <aside className="status-card">
          <span className="card-label">OFFLINE JUDGE DEMO</span>
          <strong>20 / 50 SMA</strong>
          <p>Next-candle execution<br />10 bps fee · 5 bps slippage</p>
          <small>No exchange connection. No order placement.</small>
        </aside>
      </header>
    </>
  );
}
