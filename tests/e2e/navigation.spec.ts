import { test, expect } from "@playwright/test";
import { loginWithDevCredentials } from "./helpers";

// ---------------------------------------------------------------------------
// Navigation E2E tests
// ---------------------------------------------------------------------------

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginWithDevCredentials({ page });
  });

  test("should navigate between main sections", async ({ page }) => {
    // Dashboard should already be visible after login
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Notes via sidebar
    await page.getByRole("link", { name: "Notes" }).first().click();
    await expect(page).toHaveURL(/\/notes/);

    // Navigate to Review via sidebar
    await page.getByRole("link", { name: "Review" }).first().click();
    await expect(page).toHaveURL(/\/review/);

    // Navigate to Quizzes via sidebar
    await page.getByRole("link", { name: "Quizzes" }).first().click();
    await expect(page).toHaveURL(/\/quizzes/);

    // Navigate to Analytics via sidebar
    await page.getByRole("link", { name: "Analytics" }).first().click();
    await expect(page).toHaveURL(/\/analytics/);

    // Navigate back to Dashboard via sidebar
    await page.getByRole("link", { name: "Dashboard" }).first().click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should show 404 for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent");

    await expect(page.getByText("404")).toBeVisible();
  });
});
