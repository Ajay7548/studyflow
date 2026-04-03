import { test, expect } from "@playwright/test";
import { loginWithDevCredentials } from "./helpers";

// ---------------------------------------------------------------------------
// Auth E2E tests
// ---------------------------------------------------------------------------

test.describe("Authentication", () => {
  test("should show sign in page", async ({ page }) => {
    await page.goto("/signin");

    await expect(page.getByText("Sign In", { exact: true }).first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("should sign in with dev credentials", async ({ page }) => {
    await loginWithDevCredentials({ page });

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should redirect unauthenticated users to signin", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/signin/);
  });

  test("should show sign up page", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByText("Create Account").first()).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});
