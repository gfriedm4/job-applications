import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

describe("app integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = "#/";
  });

  it("creates a job and displays it in list", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add Job" }));
    await user.type(screen.getByLabelText(/Company/i), "Acme Inc");
    await user.type(screen.getByLabelText(/Role Title/i), "Platform Engineer");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Save Job" }));

    expect(await screen.findAllByText("Acme Inc")).not.toHaveLength(0);
    expect(screen.getAllByText("Platform Engineer")).not.toHaveLength(0);
  });

  it("exports json", async () => {
    const user = userEvent.setup();
    render(<App />);

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    await user.click(screen.getByRole("button", { name: "Export JSON" }));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
