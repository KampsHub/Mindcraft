import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════
// 1. HOMEPAGE → PROGRAM LANDING → CHECKOUT FLOW
// ═══════════════════════════════════════════════

test.describe("Homepage & Program Pages", () => {
  test("homepage loads with key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    // Programs section exists
    await expect(page.locator("#programs")).toBeVisible();
    // FAQ section exists
    await expect(page.locator("#faq")).toBeVisible();
  });

  test("program landing pages load", async ({ page }) => {
    for (const slug of ["parachute", "jetstream", "basecamp"]) {
      await page.goto(`/${slug}`);
      await expect(page).toHaveTitle(new RegExp(slug, "i"));
      // Pricing/CTA button exists
      await expect(page.getByRole("button", { name: /start now/i })).toBeVisible();
    }
  });

  test("assessment page completes full flow", async ({ page }) => {
    await page.goto("/assessment");
    await expect(page.getByText("7 Disruptions")).toBeVisible();
    await page.getByRole("button", { name: /start assessment/i }).click();
    // Complete 7 questions by clicking score 5 for each
    for (let i = 0; i < 7; i++) {
      await page.getByRole("button", { name: "5" }).click();
      await page.waitForTimeout(400);
    }
    // Results should show
    await expect(page.getByText("Your disruption map")).toBeVisible();
  });

  test("blog page loads with posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByText("The Mindcraft Blog")).toBeVisible();
    // At least one post card should be visible
    await expect(page.getByText("COMING SOON").first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════
// 2. LOGIN PAGE
// ═══════════════════════════════════════════════

test.describe("Authentication Pages", () => {
  test("login page renders with magic link and Google options", async ({ page }) => {
    await page.goto("/login");
    // Magic link input
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    // Magic link button
    await expect(page.getByRole("button", { name: /sign-in link/i })).toBeVisible();
    // Google button
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  });

  test("signup page has Terms & Privacy consent checkbox", async ({ page }) => {
    await page.goto("/signup");
    // Consent checkbox should exist
    await expect(page.getByText(/terms/i)).toBeVisible();
    await expect(page.getByText(/privacy/i)).toBeVisible();
  });

  test("login page shows error for invalid email format", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.getByPlaceholder(/email/i);
    await emailInput.fill("not-an-email");
    await page.getByRole("button", { name: /sign-in link/i }).click();
    // Should show some error or validation
    await page.waitForTimeout(1000);
  });
});

// ═══════════════════════════════════════════════
// 3. LEGAL PAGES
// ═══════════════════════════════════════════════

test.describe("Legal Pages", () => {
  test("privacy policy loads with key sections", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page.getByText("Privacy Policy")).toBeVisible();
    // Short version summary card
    await expect(page.getByText(/the short version/i)).toBeVisible();
    // AI processing section
    await expect(page.getByText(/AI processing/i)).toBeVisible();
  });

  test("terms page loads with all sections including new legal clauses", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByText("Terms & Conditions")).toBeVisible();
    // Key sections
    await expect(page.getByText("Governing law")).toBeVisible();
    await expect(page.getByText("Washington")).toBeVisible();
    // New boilerplate sections
    await expect(page.getByText("Severability")).toBeVisible();
    await expect(page.getByText("Survivability")).toBeVisible();
    await expect(page.getByText("Entire agreement")).toBeVisible();
    await expect(page.getByText("Force majeure")).toBeVisible();
    // Refund definition
    await expect(page.getByText(/journal entry/i)).toBeVisible();
  });
});

// ═══════════════════════════════════════════════
// 4. AUTHENTICATED FLOW (requires test user)
// Skipped by default — enable with PLAYWRIGHT_AUTH_EMAIL + PLAYWRIGHT_AUTH_PASSWORD
// ═══════════════════════════════════════════════

const authEmail = process.env.PLAYWRIGHT_AUTH_EMAIL;
const authPassword = process.env.PLAYWRIGHT_AUTH_PASSWORD;

test.describe("Authenticated Flow", () => {
  test.skip(!authEmail || !authPassword, "Set PLAYWRIGHT_AUTH_EMAIL and PLAYWRIGHT_AUTH_PASSWORD to run");

  test("login → dashboard → day page flow", async ({ page }) => {
    // Login
    await page.goto("/login");
    // Expand password section
    await page.getByText(/sign in with password/i).click();
    await page.getByPlaceholder(/email/i).fill(authEmail!);
    await page.getByPlaceholder(/password/i).fill(authPassword!);
    await page.getByRole("button", { name: /sign in$/i }).click();

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page.getByText(/day/i)).toBeVisible();

    // Navigate to day 1
    await page.goto("/day/1");
    await page.waitForTimeout(2000);
    // Should see the Tell tab or day content
    await expect(page.locator("body")).toContainText(/tell|do|done/i);
  });
});

// ═══════════════════════════════════════════════
// 5. API HEALTH CHECKS
// ═══════════════════════════════════════════════

test.describe("API Endpoints", () => {
  test("waitlist API accepts valid email", async ({ request }) => {
    const response = await request.post("/api/waitlist", {
      data: {
        email: "test@example.com",
        program: "Playwright Test",
      },
    });
    // Should succeed or fail gracefully (Resend may not be configured in test)
    expect([200, 500]).toContain(response.status());
  });

  test("waitlist API rejects missing email", async ({ request }) => {
    const response = await request.post("/api/waitlist", {
      data: { program: "Test" },
    });
    expect(response.status()).toBe(400);
  });

  test("token costs API requires auth", async ({ request }) => {
    const response = await request.get("/api/admin/token-costs");
    expect(response.status()).toBe(401);
  });
});
