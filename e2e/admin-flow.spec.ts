import { expect, test } from "@playwright/test";

test.describe("Admin User Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to admin login page
		await page.goto("/admin/login");
	});

	test("should complete login → create → update → delete flow", async ({
		page,
	}) => {
		// Login
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');

		// Wait for redirect to admin dashboard
		await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
		await expect(page).toHaveURL(/\/admin\/dashboard/);

		// Navigate to create new item page
		await page.click('a[href="/admin/items/new"]');
		await expect(page).toHaveURL(/\/admin\/items\/new/);

		// Fill out the item form
		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Test Item ${timestamp}`);
		await page.fill(
			'textarea[name="description"]',
			"This is a test item created by E2E tests",
		);
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="keywords"]', "test, e2e, automated");
		await page.fill('input[name="location"]', "Test Building Room 101");
		await page.fill('input[name="dateFound"]', "2024-01-15");

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for redirect back to dashboard
		await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

		// Verify success message
		await expect(page.locator("text=/created successfully/i")).toBeVisible({
			timeout: 5000,
		});

		// Find the created item in the table
		const itemRow = page.locator(`text=Test Item ${timestamp}`);
		await expect(itemRow).toBeVisible();

		// Click edit button for the item
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.first()
			.click();

		// Wait for edit page
		await page.waitForURL(/\/admin\/items\/\d+\/edit/);

		// Update the item
		await page.fill(
			'textarea[name="description"]',
			"Updated description for E2E test",
		);
		await page.click('button[type="submit"]');

		// Wait for redirect
		await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

		// Verify update success
		await expect(page.locator("text=/updated successfully/i")).toBeVisible({
			timeout: 5000,
		});

		// Delete the item
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.last()
			.click();

		// Confirm deletion in dialog
		await page.click('button:has-text("Delete")');

		// Verify deletion success
		await expect(page.locator("text=/deleted successfully/i")).toBeVisible({
			timeout: 5000,
		});

		// Verify item is no longer in the list
		await expect(itemRow).not.toBeVisible();
	});

	test("should handle form validation errors", async ({ page }) => {
		// Login
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');

		await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

		// Navigate to create new item
		await page.goto("/admin/items/new");

		// Try to submit empty form
		await page.click('button[type="submit"]');

		// Verify validation errors are displayed
		await expect(page.locator("text=/required/i")).toBeVisible();
	});

	test("should redirect unauthenticated users to login", async ({ page }) => {
		// Try to access admin dashboard without authentication
		await page.goto("/admin/dashboard");

		// Should redirect to admin login
		await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
		await expect(page).toHaveURL(/\/admin\/login/);
	});

	test("should verify admin routes are properly protected", async ({
		page,
	}) => {
		// Test multiple admin routes without authentication
		const protectedRoutes = [
			"/admin/dashboard",
			"/admin/items/new",
			"/admin/items/1/edit",
		];

		for (const route of protectedRoutes) {
			await page.goto(route);
			// Should redirect to login
			await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
			await expect(page).toHaveURL(/\/admin\/login/);
		}
	});
});
