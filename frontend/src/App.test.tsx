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

    expect(screen.getByText(/research-only strategy audit/i)).toBeTruthy();
  });

  it("offers a report download after an audit run", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ run_id: "run-1", dataset: "demo", metrics: { trade_count: 1 }, findings: [], trades: [], equity_curve: [] }),
    }));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /run demo audit/i }));

    expect(await screen.findByRole("link", { name: /download markdown report/i })).toBeTruthy();
  });

  it("explains when the optional GPT audit is not configured", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ run_id: "run-1", dataset: "demo", metrics: {}, findings: [], trades: [], equity_curve: [] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "Configure OPENAI_API_KEY to enable the optional GPT-5.6 audit." }) }));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /run demo audit/i }));
    await userEvent.click(await screen.findByRole("button", { name: /run gpt-5.6 audit/i }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/configure openai_api_key/i);
  });
});
