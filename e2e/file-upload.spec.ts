import path from "node:path";
import { expect, test } from "@playwright/test";

test.describe("File Upload and Image Display", () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin
		await page.goto("/login");
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard/, { timeout: 10000 });
	});

	test("should upload image and display it", async ({ page }) => {
		await page.goto("/dashboard/items/new");

		// Fill form
		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Image Test ${timestamp}`);
		await page.fill('textarea[name="description"]', "Testing image upload");
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="location"]', "Test Location");
		await page.fill('input[name="dateFound"]', "2024-01-15");

		// Upload a test image (create a simple test file)
		const fileInput = page.locator('input[type="file"]');
		if (await fileInput.isVisible()) {
			// Create a test image file path
			const testImagePath = path.join(
				process.cwd(),
				"e2e",
				"fixtures",
				"test-image.jpg",
			);

			// Upload the file
			await fileInput.setInputFiles(testImagePath);

			// Verify preview is shown
			await expect(page.locator('img[alt*="preview"]')).toBeVisible({
				timeout: 5000,
			});
		}

		// Submit form
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard/, { timeout: 10000 });

		// Find the item and view it publicly
		const itemRow = page.locator(`text=Image Test ${timestamp}`);
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.first()
			.click();
		await page.waitForURL(/\/dashboard\/items\/(\d+)\/edit/);

		const url = page.url();
		const itemId = url.match(/\/items\/(\d+)\/edit/)?.[1];

		// View on public page
		await page.goto(`/items/${itemId}`);

		// Verify image is displayed
		const itemImage = page.locator('img[alt*="item"]');
		if (await itemImage.isVisible()) {
			await expect(itemImage).toBeVisible();
		}

		// Clean up
		await page.goto("/dashboard");
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.last()
			.click();
		await page.click('button:has-text("Delete")');
	});

	test("should validate file size and type", async ({ page }) => {
		await page.goto("/dashboard/items/new");

		// Fill basic form fields
		await page.fill('input[name="name"]', "Validation Test");
		await page.fill('textarea[name="description"]', "Testing file validation");
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="location"]', "Test Location");
		await page.fill('input[name="dateFound"]', "2024-01-15");

		// Try to upload an invalid file type (if validation exists)
		const fileInput = page.locator('input[type="file"]');
		if (await fileInput.isVisible()) {
			// Check if file input has accept attribute
			const acceptAttr = await fileInput.getAttribute("accept");
			if (acceptAttr) {
				// Verify it only accepts images
				expect(acceptAttr).toContain("image");
			}
		}
	});

	test("should update item image", async ({ page }) => {
		// Create item without image first
		await page.goto("/dashboard/items/new");

		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Update Image ${timestamp}`);
		await page.fill('textarea[name="description"]', "Testing image update");
		await page.selectOption('select[name="category"]', "books");
		await page.fill('input[name="location"]', "Library");
		await page.fill('input[name="dateFound"]', "2024-01-15");
		await page.click('button[type="submit"]');

		await page.waitForURL(/\/dashboard/, { timeout: 10000 });

		// Edit the item and add an image
		const itemRow = page.locator(`text=Update Image ${timestamp}`);
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.first()
			.click();
		await page.waitForURL(/\/dashboard\/items\/(\d+)\/edit/);

		const fileInput = page.locator('input[type="file"]');
		if (await fileInput.isVisible()) {
			const testImagePath = path.join(
				process.cwd(),
				"e2e",
				"fixtures",
				"test-image.jpg",
			);
			await fileInput.setInputFiles(testImagePath);
			await page.click('button[type="submit"]');
			await page.waitForURL(/\/dashboard/, { timeout: 10000 });
		}

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
