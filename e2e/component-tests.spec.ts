import { expect, test } from "@playwright/test";

/**
 * Component Tests for Security and Privacy UI Elements
 *
 * These tests verify the functionality of:
 * - SecurityQuestionsBuilder (add/remove functionality)
 * - PrivacyControls (toggle behavior)
 * - ObscuredFieldIndicator (rendering)
 * - Form validation feedback
 *
 * Requirements: 1.9, 3.5, 4.3, 7.5
 */

test.describe("SecurityQuestionsBuilder Component", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to admin login page
		await page.goto("/login");

		// Sign in as admin
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');

		// Wait for redirect to dashboard
		await page.waitForURL("**/dashboard", { timeout: 10000 });

		// Navigate to create item page
		await page.goto("/items/new");
		await page.waitForLoadState("networkidle");
	});

	test("should display add question button and empty state", async ({
		page,
	}) => {
		// Verify the "Add Question" button is visible
		const addButton = page.getByRole("button", { name: /add question/i });
		await expect(addButton).toBeVisible();

		// Verify empty state message
		await expect(
			page.getByText(/no security questions added yet/i),
		).toBeVisible();
	});

	test("should add a new security question", async ({ page }) => {
		// Click add question button
		await page.getByRole("button", { name: /add question/i }).click();

		// Verify question card appears
		await expect(page.getByText(/question 1/i)).toBeVisible();

		// Verify question type selector is present
		await expect(page.getByText(/question type/i)).toBeVisible();

		// Verify question text field is present
		const questionTextarea = page.locator(
			'textarea[placeholder*="What color"]',
		);
		await expect(questionTextarea).toBeVisible();
	});

	test("should remove a security question", async ({ page }) => {
		// Add a question
		await page.getByRole("button", { name: /add question/i }).click();
		await expect(page.getByText(/question 1/i)).toBeVisible();

		// Remove the question
		await page.getByRole("button", { name: /remove question/i }).click();

		// Verify question is removed and empty state is shown
		await expect(page.getByText(/question 1/i)).not.toBeVisible();
		await expect(
			page.getByText(/no security questions added yet/i),
		).toBeVisible();
	});

	test("should add multiple security questions", async ({ page }) => {
		// Add first question
		await page.getByRole("button", { name: /add question/i }).click();
		await expect(page.getByText(/question 1/i)).toBeVisible();

		// Add second question
		await page.getByRole("button", { name: /add question/i }).click();
		await expect(page.getByText(/question 2/i)).toBeVisible();

		// Verify counter shows correct count
		await expect(page.getByText(/2 \/ 10 questions added/i)).toBeVisible();
	});

	test("should disable add button at maximum questions", async ({ page }) => {
		// Add 10 questions (maximum)
		for (let i = 0; i < 10; i++) {
			await page.getByRole("button", { name: /add question/i }).click();
		}

		// Verify add button is disabled
		const addButton = page.getByRole("button", { name: /add question/i });
		await expect(addButton).toBeDisabled();

		// Verify counter shows maximum
		await expect(page.getByText(/10 \/ 10 questions added/i)).toBeVisible();
	});

	test("should switch between free text and multiple choice question types", async ({
		page,
	}) => {
		// Add a question
		await page.getByRole("button", { name: /add question/i }).click();

		// Verify default is free text
		await expect(page.getByText(/expected answer/i)).toBeVisible();

		// Switch to multiple choice
		await page.getByRole("combobox").first().click();
		await page.getByRole("option", { name: /multiple choice/i }).click();

		// Verify multiple choice options appear
		await expect(page.getByText(/options/i)).toBeVisible();
		await expect(
			page.getByText(/add 2-6 options and select the correct answer/i),
		).toBeVisible();
	});

	test("should add and remove options in multiple choice questions", async ({
		page,
	}) => {
		// Add a question and switch to multiple choice
		await page.getByRole("button", { name: /add question/i }).click();
		await page.getByRole("combobox").first().click();
		await page.getByRole("option", { name: /multiple choice/i }).click();

		// Verify default 2 options exist
		const option1 = page.getByPlaceholder("Option 1");
		const option2 = page.getByPlaceholder("Option 2");
		await expect(option1).toBeVisible();
		await expect(option2).toBeVisible();

		// Add a third option
		await page.getByRole("button", { name: /add option/i }).click();
		const option3 = page.getByPlaceholder("Option 3");
		await expect(option3).toBeVisible();

		// Remove the third option
		const removeButtons = page.getByRole("button", { name: /remove option/i });
		await removeButtons.last().click();
		await expect(option3).not.toBeVisible();
	});

	test("should display drag handle for reordering", async ({ page }) => {
		// Add two questions
		await page.getByRole("button", { name: /add question/i }).click();
		await page.getByRole("button", { name: /add question/i }).click();

		// Verify drag handles are present
		const dragHandles = page.getByRole("button", {
			name: /drag to reorder/i,
		});
		await expect(dragHandles).toHaveCount(2);
	});
});

test.describe("PrivacyControls Component", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to admin login page
		await page.goto("/login");

		// Sign in as admin
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');

		// Wait for redirect to dashboard
		await page.waitForURL("**/dashboard", { timeout: 10000 });

		// Navigate to create item page
		await page.goto("/items/new");
		await page.waitForLoadState("networkidle");
	});

	test("should display privacy controls section", async ({ page }) => {
		// Verify privacy controls heading
		await expect(page.getByText(/privacy controls/i)).toBeVisible();

		// Verify description
		await expect(
			page.getByText(/control what information is visible to public users/i),
		).toBeVisible();
	});

	test("should display both toggle switches", async ({ page }) => {
		// Verify hide location toggle
		const hideLocationSwitch = page.locator("#hide-location");
		await expect(hideLocationSwitch).toBeVisible();
		await expect(
			page.getByText(/hide location from public/i).first(),
		).toBeVisible();

		// Verify hide date found toggle
		const hideDateSwitch = page.locator("#hide-date-found");
		await expect(hideDateSwitch).toBeVisible();
		await expect(
			page.getByText(/hide date found from public/i).first(),
		).toBeVisible();
	});

	test("should toggle hide location switch", async ({ page }) => {
		const hideLocationSwitch = page.locator("#hide-location");

		// Verify initial state is unchecked
		await expect(hideLocationSwitch).not.toBeChecked();

		// Click to enable
		await hideLocationSwitch.click();
		await expect(hideLocationSwitch).toBeChecked();

		// Click to disable
		await hideLocationSwitch.click();
		await expect(hideLocationSwitch).not.toBeChecked();
	});

	test("should toggle hide date found switch", async ({ page }) => {
		const hideDateSwitch = page.locator("#hide-date-found");

		// Verify initial state is unchecked
		await expect(hideDateSwitch).not.toBeChecked();

		// Click to enable
		await hideDateSwitch.click();
		await expect(hideDateSwitch).toBeChecked();

		// Click to disable
		await hideDateSwitch.click();
		await expect(hideDateSwitch).not.toBeChecked();
	});

	test("should show public view preview when location is hidden", async ({
		page,
	}) => {
		// Enable hide location
		await page.locator("#hide-location").click();

		// Verify preview section appears
		await expect(page.getByText(/public view preview/i)).toBeVisible();

		// Verify location preview message
		await expect(
			page.getByText(
				/this information is hidden\. please contact the admin office for details/i,
			),
		).toBeVisible();
	});

	test("should show public view preview when date is hidden", async ({
		page,
	}) => {
		// Enable hide date found
		await page.locator("#hide-date-found").click();

		// Verify preview section appears
		await expect(page.getByText(/public view preview/i)).toBeVisible();

		// Verify date preview message
		await expect(
			page.getByText(
				/this information is hidden\. please contact the admin office for details/i,
			),
		).toBeVisible();
	});

	test("should show preview for both fields when both are hidden", async ({
		page,
	}) => {
		// Enable both toggles
		await page.locator("#hide-location").click();
		await page.locator("#hide-date-found").click();

		// Verify preview section appears
		await expect(page.getByText(/public view preview/i)).toBeVisible();

		// Verify both preview items are shown
		const previewItems = page.locator(".bg-background.p-2");
		await expect(previewItems).toHaveCount(2);
	});

	test("should hide preview when both toggles are disabled", async ({
		page,
	}) => {
		// Enable a toggle first
		await page.locator("#hide-location").click();
		await expect(page.getByText(/public view preview/i)).toBeVisible();

		// Disable it
		await page.locator("#hide-location").click();

		// Verify preview is hidden
		await expect(page.getByText(/public view preview/i)).not.toBeVisible();
	});
});

test.describe("ObscuredFieldIndicator Component", () => {
	test.beforeEach(async ({ page }) => {
		// We need to create an item with hidden fields first
		// Navigate to admin and login
		await page.goto("/login");
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');
		await page.waitForURL("**/dashboard", { timeout: 10000 });
	});

	test("should display obscured field indicator for hidden location", async ({
		page,
	}) => {
		// Create an item with hidden location
		await page.goto("/items/new");
		await page.waitForLoadState("networkidle");

		// Fill in required fields
		await page.fill('input[name="name"]', "Test Item with Hidden Location");
		await page.fill(
			'textarea[name="description"]',
			"This item has hidden location",
		);
		await page.fill('input[name="location"]', "Secret Location");

		// Enable hide location
		await page.locator("#hide-location").click();

		// Submit form
		await page.getByRole("button", { name: /create item/i }).click();

		// Wait for success and get item ID from URL
		await page.waitForURL("**/items/*");
		const itemUrl = page.url();
		const itemId = itemUrl.split("/").pop();

		// Navigate to public view
		await page.goto(`http://localhost:3001/items/${itemId}`);
		await page.waitForLoadState("networkidle");

		// Verify obscured field indicator is shown
		await expect(page.getByText(/location is hidden/i)).toBeVisible();
		await expect(
			page.getByText(/please contact the admin office for details/i),
		).toBeVisible();

		// Verify lock icon is present
		const lockIcon = page.locator("svg").filter({ hasText: "" }).first();
		await expect(lockIcon).toBeVisible();
	});

	test("should display obscured field indicator for hidden date", async ({
		page,
	}) => {
		// Create an item with hidden date
		await page.goto("/items/new");
		await page.waitForLoadState("networkidle");

		// Fill in required fields
		await page.fill('input[name="name"]', "Test Item with Hidden Date");
		await page.fill(
			'textarea[name="description"]',
			"This item has hidden date",
		);
		await page.fill('input[name="location"]', "Library");

		// Enable hide date found
		await page.locator("#hide-date-found").click();

		// Submit form
		await page.getByRole("button", { name: /create item/i }).click();

		// Wait for success and get item ID from URL
		await page.waitForURL("**/items/*");
		const itemUrl = page.url();
		const itemId = itemUrl.split("/").pop();

		// Navigate to public view
		await page.goto(`http://localhost:3001/items/${itemId}`);
		await page.waitForLoadState("networkidle");

		// Verify obscured field indicator is shown
		await expect(page.getByText(/date found is hidden/i)).toBeVisible();
		await expect(
			page.getByText(/please contact the admin office for details/i),
		).toBeVisible();
	});

	test("should not display obscured indicators when fields are visible", async ({
		page,
	}) => {
		// Create an item without hidden fields
		await page.goto("/items/new");
		await page.waitForLoadState("networkidle");

		// Fill in required fields
		await page.fill('input[name="name"]', "Test Item Visible");
		await page.fill(
			'textarea[name="description"]',
			"This item is fully visible",
		);
		await page.fill('input[name="location"]', "Library 3rd Floor");

		// Do NOT enable privacy controls

		// Submit form
		await page.getByRole("button", { name: /create item/i }).click();

		// Wait for success and get item ID from URL
		await page.waitForURL("**/items/*");
		const itemUrl = page.url();
		const itemId = itemUrl.split("/").pop();

		// Navigate to public view
		await page.goto(`http://localhost:3001/items/${itemId}`);
		await page.waitForLoadState("networkidle");

		// Verify obscured indicators are NOT shown
		await expect(page.getByText(/is hidden/i)).not.toBeVisible();

		// Verify actual location is shown
		await expect(page.getByText(/library 3rd floor/i)).toBeVisible();
	});
});

test.describe("Form Validation Feedback", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to admin login page
		await page.goto("/login");

		// Sign in as admin
		await page.fill('input[type="email"]', "admin@findhub.com");
		await page.fill('input[type="password"]', "password123");
		await page.click('button[type="submit"]');

		// Wait for redirect to dashboard
		await page.waitForURL("**/dashboard", { timeout: 10000 });

		// Navigate to create item page
		await page.goto("/items/new");
		await page.waitForLoadState("networkidle");
	});

	test("should show validation error for empty question text", async ({
		page,
	}) => {
		// Add a security question
		await page.getByRole("button", { name: /add question/i }).click();

		// Fill in basic item info
		await page.fill('input[name="name"]', "Test Item");
		await page.fill('textarea[name="description"]', "Test description");
		await page.fill('input[name="location"]', "Test location");

		// Leave question text empty and try to submit
		await page.getByRole("button", { name: /create item/i }).click();

		// Wait a moment for validation
		await page.waitForTimeout(500);

		// Verify validation error appears (the form should not submit)
		// The URL should still be the create page
		expect(page.url()).toContain("/items/new");
	});

	test("should show validation error for multiple choice without correct answer", async ({
		page,
	}) => {
		// Add a security question
		await page.getByRole("button", { name: /add question/i }).click();

		// Switch to multiple choice
		await page.getByRole("combobox").first().click();
		await page.getByRole("option", { name: /multiple choice/i }).click();

		// Fill in question text and options but don't select correct answer
		const questionTextarea = page.locator("textarea").first();
		await questionTextarea.fill("What color is the item?");

		await page.getByPlaceholder("Option 1").fill("Red");
		await page.getByPlaceholder("Option 2").fill("Blue");

		// Fill in basic item info
		await page.fill('input[name="name"]', "Test Item");
		await page.fill('textarea[name="description"]', "Test description");
		await page.fill('input[name="location"]', "Test location");

		// Try to submit without selecting correct answer
		await page.getByRole("button", { name: /create item/i }).click();

		// Wait a moment for validation
		await page.waitForTimeout(500);

		// Verify form doesn't submit
		expect(page.url()).toContain("/items/new");
	});

	test("should successfully submit with valid security question", async ({
		page,
	}) => {
		// Add a security question
		await page.getByRole("button", { name: /add question/i }).click();

		// Fill in question text
		const questionTextarea = page.locator("textarea").first();
		await questionTextarea.fill("What is inside the bag?");

		// Fill in answer for free text question
		await page.fill('input[placeholder="e.g., Blue"]', "Laptop");

		// Fill in basic item info
		await page.fill('input[name="name"]', "Test Item with Question");
		await page.fill('textarea[name="description"]', "Test description");
		await page.fill('input[name="location"]', "Test location");

		// Submit form
		await page.getByRole("button", { name: /create item/i }).click();

		// Verify successful submission by checking URL change
		await page.waitForURL("**/items/*", { timeout: 5000 });
		expect(page.url()).toContain("/items/");
		expect(page.url()).not.toContain("/new");
	});

	test("should validate minimum question text length", async ({ page }) => {
		// Add a security question
		await page.getByRole("button", { name: /add question/i }).click();

		// Fill in very short question text (less than 5 characters)
		const questionTextarea = page.locator("textarea").first();
		await questionTextarea.fill("Hi");

		// Fill in answer
		await page.fill('input[placeholder="e.g., Blue"]', "Answer");

		// Fill in basic item info
		await page.fill('input[name="name"]', "Test Item");
		await page.fill('textarea[name="description"]', "Test description");
		await page.fill('input[name="location"]', "Test location");

		// Try to submit
		await page.getByRole("button", { name: /create item/i }).click();

		// Wait a moment for validation
		await page.waitForTimeout(500);

		// Verify form doesn't submit
		expect(page.url()).toContain("/items/new");
	});
});
