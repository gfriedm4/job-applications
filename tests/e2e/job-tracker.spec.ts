import { expect, test } from "@chromatic-com/playwright";
import type { Page } from "@playwright/test";

const createJob = async (page: Page, company: string, roleTitle: string) => {
  await page.getByRole("button", { name: "Add Job" }).click();
  await page.getByLabel("Company *").fill(company);
  await page.getByLabel("Role Title *").fill(roleTitle);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Save Job" }).click();
};

const openJobDetail = async (page: Page, company: string) => {
  const isMobile = (page.viewportSize()?.width ?? 1200) < 768;
  if (isMobile) {
    const card = page.locator(".mobile-card").filter({ has: page.getByRole("heading", { name: company }) }).first();
    await expect(card.getByRole("heading", { name: company })).toBeVisible();
    await card.getByRole("link", { name: "Open" }).click();
  } else {
    const row = page.getByRole("row").filter({ has: page.getByRole("cell", { name: company }) }).first();
    await expect(row.getByRole("cell", { name: company })).toBeVisible();
    await row.getByRole("link", { name: "Open" }).click();
  }
};

const openSettings = async (page: Page) => {
  await page.locator(".app-header").getByRole("button", { name: "Settings" }).click();
};

test("create and inspect a job", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.getByRole("heading", { name: "Job Application Tracker" })).toBeVisible();

  await createJob(page, "Acme Co", "Backend Engineer");
  await openJobDetail(page, "Acme Co");
  await expect(page.getByRole("heading", { name: /Acme Co - Backend Engineer/ })).toBeVisible();
});

test("save dark mode preference in settings", async ({ page }) => {
  await page.goto("/#/");

  await openSettings(page);
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("checkbox", { name: "Dark Mode" }).check();
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await openSettings(page);
  await expect(page.getByRole("checkbox", { name: "Dark Mode" })).toBeChecked();
});

test("add and complete reminders, then log timeline notes", async ({ page }) => {
  await page.goto("/#/");
  await createJob(page, "Delta Labs", "Platform Engineer");
  await openJobDetail(page, "Delta Labs");

  await page.locator(".reminders-form input[type='date']").fill("2030-01-15");
  await page.getByPlaceholder("What needs to happen next?").fill("Send follow-up email");
  await page.getByRole("button", { name: "Add Reminder" }).click();

  const reminderItem = page.locator(".reminder-item").filter({ hasText: "Send follow-up email" }).first();
  await expect(reminderItem.getByText("Send follow-up email")).toBeVisible();
  await reminderItem.getByRole("checkbox").check();
  await expect(reminderItem.getByText("Done")).toBeVisible();

  await page.getByPlaceholder("What changed, and why?").fill("Reached out to recruiter");
  await page.getByRole("button", { name: "Log Note" }).click();
  await expect(page.getByText("Reached out to recruiter")).toBeVisible();
});

test("show validation error when importing invalid JSON in settings", async ({ page }) => {
  await page.goto("/#/");
  await openSettings(page);

  await page.locator(".io-panel input[type='file']").setInputFiles("tests/fixtures/invalid-import.json");
  await expect(page.getByText("Import file is not valid JSON.")).toBeVisible();
});

test("clear dashboard data from settings", async ({ page }) => {
  await page.goto("/#/");
  await createJob(page, "Reset Corp", "SRE");

  await openSettings(page);
  await page.getByRole("button", { name: "Clear Dashboard Data" }).click();
  await page.getByRole("button", { name: "Yes, Clear Data" }).click();

  await expect(page.getByRole("heading", { name: "Start Tracking Your Applications" })).toBeVisible();
});
