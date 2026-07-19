import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("StratGuard AI", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the research-only safety boundary", () => {
    render(<App />);

    expect(screen.getByText(/no exchange connection/i)).toBeTruthy();
  });

  it("renders the evidence-first research promise and run action", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /backtests need evidence, not belief/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^run audit$/i })).toBeTruthy();
  });

  it("offers a report download after an audit run", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ run_id: "run-1", dataset: "demo", metrics: { trade_count: 1 }, findings: [], trades: [], equity_curve: [] }),
    }));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /^run audit$/i }));

    expect(await screen.findByRole("link", { name: /open markdown report/i })).toBeTruthy();
  });

  it("renders evidence metrics and the equity curve after a run", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ run_id: "run-2", dataset: "demo", metrics: { final_equity: 10420, total_return_pct: 4.2, max_drawdown_pct: -2.1, trade_count: 8 }, findings: [], trades: [], equity_curve: [10000, 10120, 10420] }),
    }));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /^run audit$/i }));

    expect(await screen.findByRole("region", { name: /equity curve/i })).toBeTruthy();
    expect(screen.getByText(/fixed btc\/usdt 1h demo data/i)).toBeTruthy();
  });

  it("explains when the optional GPT audit is not configured", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "run-1", dataset: "demo", metrics: {}, findings: [], trades: [], equity_curve: [] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Configure OPENAI_API_KEY to enable the optional GPT-5.6 audit." }) }));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /^run audit$/i }));
    await userEvent.click(await screen.findByRole("button", { name: /request structured audit/i }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/configure openai_api_key/i);
  });

  it("keeps the Codex review packet available when the optional GPT audit is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "run-3", dataset: "demo", metrics: {}, findings: [], trades: [], equity_curve: [] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Configure OPENAI_API_KEY to enable the optional GPT-5.6 audit." }) }));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /^run audit$/i }));
    await userEvent.click(await screen.findByRole("button", { name: /request structured audit/i }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("link", { name: /export codex review packet/i })).toBeTruthy();
  });
});
