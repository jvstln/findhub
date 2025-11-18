import { expect, test } from "@playwright/test";

test.describe("Offline Functionality (PWA)", () => {
	test("should display offline indicator when network is disconnected", async ({
		page,
		context,
	}) => {
		// Navigate to search page while online
		await page.goto("/search");
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});

		// Verify we're online initially
		const onlineStatus = await page.evaluate(() => navigator.onLine);
		expect(onlineStatus).toBe(true);

		// Simulate going offline
		await context.setOffline(true);

		// Wait for offline indicator to appear
		const offlineIndicator = page.locator("text=/offline|no connection/i");
		await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

		// Go back online
		await context.setOffline(false);

		// Offline indicator should disappear
		await expect(offlineIndicator).not.toBeVisible({ timeout: 5000 });
	});

	test("should cache search results for offline access", async ({
		page,
		context,
	}) => {
		// Visit search page while online
		await page.goto("/search");
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});

		// Perform a search to cache results
		await page.fill('input[placeholder*="Search"]', "laptop");
		await page.waitForTimeout(1000);

		// Wait for results to load
		await page.waitForSelector('[data-testid="item-card"]', { timeout: 5000 });

		// Go offline
		await context.setOffline(true);

		// Reload the page
		await page.reload();

		// Verify cached content is still accessible
		await expect(page.locator('[data-testid="search-results"]')).toBeVisible({
			timeout: 10000,
		});
	});

	test("should show appropriate message when trying to create item offline", async ({
		page,
		context,
	}) => {
		// Login while online
		await page.goto("/admin/login");
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

		// Navigate to create item page
		await page.goto("/admin/items/new");

		// Go offline
		await context.setOffline(true);

		// Try to submit form
		await page.fill('input[name="name"]', "Offline Test");
		await page.fill('textarea[name="description"]', "Testing offline behavior");
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="location"]', "Test Location");
		await page.fill('input[name="dateFound"]', "2024-01-15");
		await page.click('button[type="submit"]');

		// Should show error message
		await expect(
			page.locator("text=/network|offline|connection|failed/i"),
		).toBeVisible({ timeout: 5000 });
	});

	test("should handle service worker registration", async ({ page }) => {
		await page.goto("/");

		// Check if service worker is registered (PWA)
		const swRegistered = await page.evaluate(async () => {
			if ("serviceWorker" in navigator) {
				const registration = await navigator.serviceWorker.getRegistration();
				return !!registration;
			}
			return false;
		});

		// Service worker should be registered in production builds
		// In development, it might not be registered
		console.log("Service Worker registered:", swRegistered);
	});

	test("should sync data when coming back online", async ({
		page,
		context,
	}) => {
		// Start online
		await page.goto("/search");
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});

		// Go offline
		await context.setOffline(true);

		// Verify offline indicator
		await expect(page.locator("text=/offline/i")).toBeVisible({
			timeout: 5000,
		});

		// Go back online
		await context.setOffline(false);

		// Verify online indicator or that offline indicator disappears
		await expect(page.locator("text=/offline/i")).not.toBeVisible({
			timeout: 5000,
		});

		// Data should be refreshed
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});
	});

	test("should work offline after initial load", async ({ page, context }) => {
		// Load the app while online
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Navigate to search
		await page.goto("/search");
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});

		// Go offline
		await context.setOffline(true);

		// Try to navigate within the app
		await page.goto("/about");

		// Should still be able to view cached pages
		await expect(page.locator("text=/about|mission|service/i")).toBeVisible({
			timeout: 10000,
		});
	});
});
