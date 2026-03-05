import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import { AI_SETTINGS_STORAGE_KEY } from "../../src/lib/aiSettings";

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

    await user.click(screen.getByRole("button", { name: "Add Job" }));
    await user.type(screen.getByLabelText(/Company/i), "Acme Inc");
    await user.type(screen.getByLabelText(/Role Title/i), "Platform Engineer");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Save Job" }));

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(await screen.findByRole("button", { name: "Export JSON" }));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("shows add-job dropdown only when api key is configured", async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);

    expect(screen.queryByRole("menuitem", { name: "Paste Job Description" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add Job" }));
    expect(screen.queryByRole("menuitem", { name: "Paste Job Description" })).not.toBeInTheDocument();
    firstRender.unmount();

    window.localStorage.setItem(
      AI_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        openAiApiKey: "sk-test",
        openAiModel: "gpt-4.1-mini"
      })
    );

    render(<App />);
    await user.click(screen.getByRole("button", { name: "Add Job" }));
    expect(screen.getByRole("menuitem", { name: "Paste Job Description" })).toBeInTheDocument();
  });

  it("closes open modals when Escape is pressed", async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);

    await user.click(screen.getByRole("button", { name: "Add Job" }));
    expect(screen.getByRole("heading", { name: "Add Job" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Add Job" })).not.toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: "Settings" })[0]);
    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Settings" })).not.toBeInTheDocument();
    });

    firstRender.unmount();
    window.localStorage.setItem(
      AI_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        openAiApiKey: "sk-test",
        openAiModel: "gpt-4.1-mini"
      })
    );

    render(<App />);
    await user.click(screen.getByRole("button", { name: "Add Job" }));
    await user.click(screen.getByRole("menuitem", { name: "Paste Job Description" }));
    expect(await screen.findByRole("heading", { name: "Paste Job Description" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Paste Job Description" })).not.toBeInTheDocument();
    });
  });

  it("returns to list from job detail when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add Job" }));
    await user.type(screen.getByLabelText(/Company/i), "Acme Inc");
    await user.type(screen.getByLabelText(/Role Title/i), "Platform Engineer");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Save Job" }));

    await user.click(screen.getByRole("link", { name: /Open details for Acme Inc, Platform Engineer/i }));
    expect(await screen.findByRole("heading", { name: /Acme Inc - Platform Engineer/ })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(await screen.findByRole("heading", { name: "Job Application Tracker" })).toBeInTheDocument();
  });

  it("sorts table rows from column headers", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add Job" }));
    await user.type(screen.getByLabelText("Company *"), "Acme Inc");
    await user.type(screen.getByLabelText("Role Title *"), "Backend Engineer");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Save Job" }));

    await user.click(screen.getByRole("button", { name: "Add Job" }));
    await user.type(screen.getByLabelText("Company *"), "Beta Corp");
    await user.type(screen.getByLabelText("Role Title *"), "Frontend Engineer");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Save Job" }));

    const table = screen.getByRole("table");
    await user.click(within(table).getByRole("button", { name: "Sort by Company" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Acme Inc");

    await user.click(within(table).getByRole("button", { name: "Sort by Company" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Beta Corp");

    expect(screen.queryByText("Sort By")).not.toBeInTheDocument();
    expect(screen.queryByText("Direction")).not.toBeInTheDocument();
  });
});
