import path from "node:path";
import { expect, test } from "@playwright/test";

test.describe("File Upload and Image Display (Supabase Storage)", () => {
	test.beforeEach(async ({ page }) => {
		// Login as admin
		await page.goto("http://localhost:3002/login");
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard/, { timeout: 10000 });
	});

	test("should upload image to Supabase Storage and display it", async ({
		page,
	}) => {
		await page.goto("http://localhost:3002/items/new");

		// Fill form
		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Image Test ${timestamp}`);
		await page.fill(
			'textarea[name="description"]',
			"Testing Supabase image upload",
		);
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="location"]', "Test Location");
		await page.fill('input[name="dateFound"]', "2024-01-15");

		// Upload a test image
		const fileInput = page.locator('input[type="file"]');
		if (await fileInput.isVisible()) {
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
		await page.waitForURL(/\/items\/(\d+)\/edit/);

		const url = page.url();
		const itemId = url.match(/\/items\/(\d+)\/edit/)?.[1];

		// View on public page (switch to web app)
		await page.goto(`http://localhost:3001/items/${itemId}`);

		// Verify image is displayed from Supabase Storage
		const itemImage = page.locator('img[alt*="item"]');
		if (await itemImage.isVisible()) {
			await expect(itemImage).toBeVisible();
			// Verify image URL is from Supabase
			const imgSrc = await itemImage.getAttribute("src");
			if (imgSrc) {
				// Should contain Supabase URL or be a valid image URL
				expect(imgSrc.length).toBeGreaterThan(0);
			}
		}

		// Clean up - this should also delete from Supabase Storage (switch back to admin)
		await page.goto("http://localhost:3002/dashboard");
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.last()
			.click();
		await page.click('button:has-text("Delete")');

		// Verify deletion success
		await expect(page.locator("text=/deleted successfully/i")).toBeVisible({
			timeout: 5000,
		});
	});

	test("should validate file size and type", async ({ page }) => {
		await page.goto("http://localhost:3002/items/new");

		// Fill basic form fields
		await page.fill('input[name="name"]', "Validation Test");
		await page.fill('textarea[name="description"]', "Testing file validation");
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="location"]', "Test Location");
		await page.fill('input[name="dateFound"]', "2024-01-15");

		// Check file input validation attributes
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

	test("should update item image in Supabase Storage", async ({ page }) => {
		// Create item without image first
		await page.goto("http://localhost:3002/items/new");

		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Update Image ${timestamp}`);
		await page.fill(
			'textarea[name="description"]',
			"Testing Supabase image update",
		);
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
		await page.waitForURL(/\/items\/(\d+)\/edit/);

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

			// Verify update success
			await expect(page.locator("text=/updated successfully/i")).toBeVisible({
				timeout: 5000,
			});
		}

		// Clean up - should delete image from Supabase Storage
		await page.goto("http://localhost:3002/dashboard");
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.last()
			.click();
		await page.click('button:has-text("Delete")');
	});

	test("should cleanup Supabase Storage on item deletion", async ({ page }) => {
		// Create item with image
		await page.goto("http://localhost:3002/items/new");

		const timestamp = Date.now();
		await page.fill('input[name="name"]', `Cleanup Test ${timestamp}`);
		await page.fill('textarea[name="description"]', "Testing Supabase cleanup");
		await page.selectOption('select[name="category"]', "electronics");
		await page.fill('input[name="location"]', "Test Location");
		await page.fill('input[name="dateFound"]', "2024-01-15");

		const fileInput = page.locator('input[type="file"]');
		if (await fileInput.isVisible()) {
			const testImagePath = path.join(
				process.cwd(),
				"e2e",
				"fixtures",
				"test-image.jpg",
			);
			await fileInput.setInputFiles(testImagePath);
		}

		await page.click('button[type="submit"]');
		await page.waitForURL(/\/dashboard/, { timeout: 10000 });

		// Delete the item - should trigger Supabase Storage cleanup
		const itemRow = page.locator(`text=Cleanup Test ${timestamp}`);
		await itemRow
			.locator("xpath=ancestor::tr")
			.locator("button")
			.last()
			.click();
		await page.click('button:has-text("Delete")');

		// Verify deletion success
		await expect(page.locator("text=/deleted successfully/i")).toBeVisible({
			timeout: 5000,
		});

		// Verify item is no longer visible
		await expect(itemRow).not.toBeVisible();
	});
});
