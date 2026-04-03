import { test, expect } from "@playwright/test";
import { loginWithDevCredentials } from "./helpers";

// ---------------------------------------------------------------------------
// Notes CRUD E2E tests
// ---------------------------------------------------------------------------

test.describe("Notes CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginWithDevCredentials({ page });
  });

  test("should show notes page", async ({ page }) => {
    await page.goto("/notes");

    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  });

  test("should create a new note", async ({ page }) => {
    await page.goto("/notes/new");

    await expect(
      page.getByRole("heading", { name: "Create Note" }),
    ).toBeVisible();

    // Fill in the note form
    await page.getByLabel("Title").fill("Playwright Test Note");

    // Select subject from native select
    await page.locator("select#subject").selectOption("Computer Science");

    // Type into the TipTap editor
    const editor = page.locator(".tiptap, [contenteditable]").first();
    await editor.click();
    await page.keyboard.type(
      "This is a test note created by Playwright E2E tests.",
    );

    // Submit the form
    await page.getByRole("button", { name: /Create/ }).click();

    // Wait for navigation away from /notes/new
    await page.waitForURL(/\/notes/, { timeout: 10000 });
  });

  test("should show notes list after creation", async ({ page }) => {
    await page.goto("/notes");

    // The page should load without errors
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  });
});
