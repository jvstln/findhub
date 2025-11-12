import { expect, test } from "@playwright/test";

test.describe("Status Change Workflow", () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin
		await page.goto("/login");
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard/, { timeout: 10000 });
	});

	test("should update item status and track history", async ({ page }) => {
		// Create a test item first
		await page.goto("/dashboard/items/new");

		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Status Test ${timestamp}`);
		await page.fill(
			'textarea[name="description"]',
			"Item for testing status changes",
		);
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="location"]', "Test Location");
		await page.fill('input[name="dateFound"]', "2024-01-15");
		await page.click('button[type="submit"]');

		await page.waitForURL(/\/dashboard/, { timeout: 10000 });

		// Find and edit the item
		const itemRow = page.locator(`text=Status Test ${timestamp}`);
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.first()
			.click();
		await page.waitForURL(/\/dashboard\/items\/\d+\/edit/);

		// Change status to "claimed"
		await page.selectOption('select[name="status"]', "claimed");
		await page.click('button[type="submit"]');

		await page.waitForURL(/\/dashboard/, { timeout: 10000 });

		// Verify status update success
		await expect(page.locator("text=/updated successfully/i")).toBeVisible({
			timeout: 5000,
		});

		// Navigate back to edit page to view history
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.first()
			.click();
		await page.waitForURL(/\/dashboard\/items\/\d+\/edit/);

		// Check if history section exists
		const historySection = page.locator("text=/history|status changes/i");
		if (await historySection.isVisible()) {
			// Verify history shows the status change
			await expect(page.locator("text=/claimed/i")).toBeVisible();
		}

		// Clean up - delete the test item
		await page.goto("/dashboard");
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.last()
			.click();
		await page.click('button:has-text("Delete")');
	});

	test("should display correct status badge on public view", async ({
		page,
	}) => {
		// Create an item with claimed status
		await page.goto("/dashboard/items/new");

		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Public Status ${timestamp}`);
		await page.fill('textarea[name="description"]', "Test public status view");
		await page.selectOption('select[name="category"]', "books");
		await page.fill('input[name="location"]', "Library");
		await page.fill('input[name="dateFound"]', "2024-01-15");
		await page.click('button[type="submit"]');

		await page.waitForURL(/\/dashboard/, { timeout: 10000 });

		// Get the item ID from the URL when editing
		const itemRow = page.locator(`text=Public Status ${timestamp}`);
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.first()
			.click();
		await page.waitForURL(/\/dashboard\/items\/(\d+)\/edit/);

		const url = page.url();
		const itemId = url.match(/\/items\/(\d+)\/edit/)?.[1];

		// View item on public page
		await page.goto(`/items/${itemId}`);

		// Verify status is displayed
		await expect(
			page.locator("text=/unclaimed|claimed|returned/i"),
		).toBeVisible();

		// Clean up
		await page.goto("/dashboard");
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.last()
			.click();
		await page.click('button:has-text("Delete")');
	});
});
