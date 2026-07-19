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
});
