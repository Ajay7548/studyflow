import { type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEV_EMAIL = "dev@studyflow.local";
const DEV_PASSWORD = "devpassword";

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

/**
 * Signs in using the dev credentials bypass. Navigates to /signin,
 * fills the credentials form, submits, and waits for the /dashboard redirect.
 */
export const loginWithDevCredentials = async ({ page }: { page: Page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");
};
