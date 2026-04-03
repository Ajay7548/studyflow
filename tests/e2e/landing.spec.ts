import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Landing page E2E tests
// ---------------------------------------------------------------------------

test.describe("Landing Page", () => {
  test("should show landing page", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Study Smarter with AI" }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: /Get Started/ }),
    ).toBeVisible();

    // Verify feature cards are displayed (use first() to avoid matching nav links)
    await expect(page.getByText("AI Flashcards").first()).toBeVisible();
    await expect(page.getByText("Smart Quizzes").first()).toBeVisible();
    await expect(page.getByText("Spaced Repetition").first()).toBeVisible();
  });

  test("should have working CTA link", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Get Started/ }).click();

    // Redirects to signin (if not logged in) or dashboard (if logged in)
    await expect(page).toHaveURL(/\/(signin|dashboard)/);
  });
});
