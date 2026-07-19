import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("StratGuard AI", () => {
  it("shows the research-only safety boundary", () => {
    render(<App />);

    expect(screen.getByText(/research-only strategy audit/i)).toBeTruthy();
  });
});
