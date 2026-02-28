import { expect, test } from "@playwright/test";

test("create and inspect a job", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.getByRole("heading", { name: "Job Application Tracker" })).toBeVisible();

  await page.getByRole("button", { name: "Add Job" }).click();
  await page.getByLabel("Company *").fill("Acme Co");
  await page.getByLabel("Role Title *").fill("Backend Engineer");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Save Job" }).click();

  const isMobile = (page.viewportSize()?.width ?? 1200) < 768;
  if (isMobile) {
    const card = page.locator(".mobile-card").filter({ has: page.getByRole("heading", { name: "Acme Co" }) }).first();
    await expect(card.getByRole("heading", { name: "Acme Co" })).toBeVisible();
    await card.getByRole("link", { name: "Open" }).click();
  } else {
    const row = page.getByRole("row").filter({ has: page.getByRole("cell", { name: "Acme Co" }) }).first();
    await expect(row.getByRole("cell", { name: "Acme Co" })).toBeVisible();
    await row.getByRole("link", { name: "Open" }).click();
  }

  await expect(page.getByRole("heading", { name: /Acme Co - Backend Engineer/ })).toBeVisible();
});
