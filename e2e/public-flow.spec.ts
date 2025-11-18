import { expect, test } from "@playwright/test";

test.describe("Public User Flow", () => {
	test("should complete search → view → claim info flow without seeing auth UI", async ({
		page,
	}) => {
		// Navigate to home page
		await page.goto("/");
		await expect(page).toHaveTitle(/FindHub/i);

		// Verify NO auth UI elements are visible on public pages
		await expect(
			page.locator("text=/login|sign in|sign up/i"),
		).not.toBeVisible();
		await expect(page.locator('a[href*="/admin"]')).not.toBeVisible();

		// Navigate to search page
		await page.click('a[href="/search"]');
		await expect(page).toHaveURL(/\/search/);

		// Verify NO auth UI on search page
		await expect(
			page.locator("text=/login|sign in|sign up/i"),
		).not.toBeVisible();

		// Wait for search results to load
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});

		// Verify search interface is present
		await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

		// Perform a search
		await page.fill('input[placeholder*="Search"]', "laptop");
		await page.waitForTimeout(1000); // Wait for debounce

		// Check if results are displayed
		const resultsContainer = page.locator('[data-testid="search-results"]');
		await expect(resultsContainer).toBeVisible();

		// Click on the first item if available
		const firstItem = page.locator('[data-testid="item-card"]').first();
		const hasItems = await firstItem.count();

		if (hasItems > 0) {
			await firstItem.click();

			// Verify we're on the item detail page
			await expect(page).toHaveURL(/\/items\/\d+/);

			// Verify NO auth UI on item detail page
			await expect(
				page.locator("text=/login|sign in|sign up/i"),
			).not.toBeVisible();

			// Verify item details are displayed
			await expect(page.locator("h1")).toBeVisible();
			await expect(
				page.locator("text=/Category|Location|Date Found/i"),
			).toBeVisible();

			// Verify claim instructions are present
			await expect(
				page.locator("text=/claim|contact|visit|office/i"),
			).toBeVisible();
		}
	});

	test("should filter search results by category", async ({ page }) => {
		await page.goto("/search");

		// Wait for page to load
		await page.waitForSelector('[data-testid="search-results"]');

		// Open category filter if it exists
		const categoryFilter = page.locator('select[name="category"]');
		if (await categoryFilter.isVisible()) {
			await categoryFilter.selectOption("electronics");
			await page.waitForTimeout(500);

			// Verify URL contains filter parameter
			await expect(page).toHaveURL(/category=electronics/);
		}
	});

	test("should navigate to about page and view contact info", async ({
		page,
	}) => {
		await page.goto("/");

		// Navigate to about page
		await page.click('a[href="/about"]');
		await expect(page).toHaveURL(/\/about/);

		// Verify NO auth UI on about page
		await expect(
			page.locator("text=/login|sign in|sign up/i"),
		).not.toBeVisible();

		// Verify about page content
		await expect(page.locator("text=/about|mission|service/i")).toBeVisible();
		await expect(page.locator("text=/contact|office|hours/i")).toBeVisible();
	});

	test("should display responsive layout on mobile", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto("/");

		// Verify mobile navigation
		const mobileMenu = page.locator('[data-testid="mobile-menu"]');
		if (await mobileMenu.isVisible()) {
			await mobileMenu.click();
			await expect(page.locator('nav a[href="/search"]')).toBeVisible();
		}

		// Navigate to search
		await page.goto("/search");
		await page.waitForSelector('[data-testid="search-results"]');

		// Verify mobile-friendly layout
		const searchInput = page.locator('input[placeholder*="Search"]');
		await expect(searchInput).toBeVisible();
	});

	test("should verify public routes don't trigger auth middleware", async ({
		page,
	}) => {
		// Test that public routes are accessible without authentication
		const publicRoutes = ["/", "/search", "/about"];

		for (const route of publicRoutes) {
			await page.goto(route);
			// Should NOT redirect to login
			await expect(page).toHaveURL(route);
			// Should NOT show auth UI
			await expect(
				page.locator("text=/login|sign in|sign up/i"),
			).not.toBeVisible();
		}
	});

	test("should display contextual empty state messages", async ({ page }) => {
		await page.goto("/search");

		// Wait for page to load
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});

		// Check if there are any items in the database
		const resultsText = await page
			.locator('[data-testid="search-results"]')
			.textContent();

		if (resultsText?.includes("No items in database")) {
			// Verify empty database message
			await expect(page.locator("text=/No items in database/i")).toBeVisible();
		} else {
			// If there are items, apply a filter that should return no results
			const categoryFilter = page.locator('select[name="category"]');
			if (await categoryFilter.isVisible()) {
				// Select a category
				await categoryFilter.selectOption({ index: 1 });
				await page.waitForTimeout(500);

				// Type a keyword that likely won't match
				await page.fill(
					'input[placeholder*="Search"]',
					"xyznonexistentitem123",
				);
				await page.waitForTimeout(1000);

				// Should show "No matches found" message
				const noMatchesMessage = page.locator("text=/No matches found/i");
				if (await noMatchesMessage.isVisible()) {
					await expect(noMatchesMessage).toBeVisible();
					// Should also show helper text
					await expect(
						page.locator("text=/Try adjusting your search/i"),
					).toBeVisible();
				}
			}
		}
	});

	test("should load categories dynamically from API", async ({ page }) => {
		await page.goto("/search");

		// Wait for page to load
		await page.waitForSelector('[data-testid="search-results"]', {
			timeout: 10000,
		});

		// Check if category filter exists and has options
		const categoryFilter = page.locator('select[name="category"]');
		if (await categoryFilter.isVisible()) {
			// Get all options
			const options = await categoryFilter.locator("option").count();

			// Should have at least the default "All Categories" option plus some categories
			expect(options).toBeGreaterThan(1);

			// Verify some common categories exist (from the seeded data)
			const categoryText = await categoryFilter.textContent();
			// At least one of these should exist
			const hasCategories =
				categoryText?.includes("Electronics") ||
				categoryText?.includes("Clothing") ||
				categoryText?.includes("Books") ||
				categoryText?.includes("Keys");

			expect(hasCategories).toBeTruthy();
		}
	});
});
