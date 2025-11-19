import { expect, test } from "@playwright/test";

/**
 * Integration tests for Security Questions and Privacy Controls API
 * Tests Requirements: 4.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

test.describe("Security Questions and Privacy Controls API", () => {
	let authToken: string;
	let createdItemId: number;

	test.beforeAll(async ({ request }) => {
		// Login to get auth token using Better Auth email/password endpoint
		const loginResponse = await request.post(
			"http://localhost:3000/api/auth/sign-in/email",
			{
				headers: {
					"Content-Type": "application/json",
				},
				data: {
					email: "admin@findhub.com",
					password: "password123",
				},
			},
		);

		expect(loginResponse.ok()).toBeTruthy();
		const cookies = loginResponse.headers()["set-cookie"];
		authToken = cookies || "";
	});

	test.describe("Admin API - Creating Items with Security Questions", () => {
		test("should create item with multiple choice security question", async ({
			request,
		}) => {
			const formData = new FormData();
			formData.append("name", "Test Laptop with Security");
			formData.append("description", "Black laptop with security questions");
			formData.append("category", "1");
			formData.append("location", "Library 2nd Floor");
			formData.append("dateFound", new Date().toISOString());
			formData.append("hideLocation", "false");
			formData.append("hideDateFound", "false");

			const securityQuestions = [
				{
					questionText: "What brand is the laptop?",
					questionType: "multiple_choice",
					options: ["Dell", "HP", "Lenovo", "Apple"],
					answer: "Dell",
					displayOrder: 0,
				},
			];
			formData.append("securityQuestions", JSON.stringify(securityQuestions));

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.securityQuestions).toHaveLength(1);
			expect(data.data.securityQuestions[0].questionText).toBe(
				"What brand is the laptop?",
			);
			expect(data.data.securityQuestions[0].answer).toBe("Dell");

			createdItemId = data.data.id;
		});

		test("should create item with free text security question", async ({
			request,
		}) => {
			const formData = new FormData();
			formData.append("name", "Blue Backpack with Security");
			formData.append("description", "Blue backpack with free text question");
			formData.append("category", "7");
			formData.append("location", "Cafeteria");
			formData.append("dateFound", new Date().toISOString());

			const securityQuestions = [
				{
					questionText: "What is inside the front pocket?",
					questionType: "free_text",
					answer: "Student ID card",
					displayOrder: 0,
				},
			];
			formData.append("securityQuestions", JSON.stringify(securityQuestions));

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.securityQuestions).toHaveLength(1);
			expect(data.data.securityQuestions[0].questionType).toBe("free_text");
			expect(data.data.securityQuestions[0].answer).toBe("Student ID card");
		});

		test("should create item with multiple security questions", async ({
			request,
		}) => {
			const formData = new FormData();
			formData.append("name", "Wallet with Multiple Questions");
			formData.append("description", "Brown leather wallet");
			formData.append("category", "2");
			formData.append("location", "Gym Locker Room");
			formData.append("dateFound", new Date().toISOString());

			const securityQuestions = [
				{
					questionText: "What color is the wallet?",
					questionType: "multiple_choice",
					options: ["Black", "Brown", "Blue", "Red"],
					answer: "Brown",
					displayOrder: 0,
				},
				{
					questionText: "What bank card is inside?",
					questionType: "free_text",
					answer: "Chase Bank",
					displayOrder: 1,
				},
			];
			formData.append("securityQuestions", JSON.stringify(securityQuestions));

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.securityQuestions).toHaveLength(2);
			expect(data.data.securityQuestions[0].displayOrder).toBe(0);
			expect(data.data.securityQuestions[1].displayOrder).toBe(1);
		});

		test("should create item without security questions", async ({
			request,
		}) => {
			const formData = new FormData();
			formData.append("name", "Simple Item No Questions");
			formData.append("description", "Item without security questions");
			formData.append("category", "3");
			formData.append("location", "Main Hall");
			formData.append("dateFound", new Date().toISOString());

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.securityQuestions).toHaveLength(0);
		});

		test("should reject invalid security question format", async ({
			request,
		}) => {
			const formData = new FormData();
			formData.append("name", "Invalid Question Item");
			formData.append("description", "Item with invalid question");
			formData.append("category", "1");
			formData.append("location", "Test Location");
			formData.append("dateFound", new Date().toISOString());

			const invalidQuestions = [
				{
					questionText: "Q", // Too short
					questionType: "multiple_choice",
					options: ["A"], // Only one option
					answer: "A",
				},
			];
			formData.append("securityQuestions", JSON.stringify(invalidQuestions));

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.status()).toBe(400);
			const data = await response.json();
			expect(data.success).toBe(false);
			expect(data.error.code).toBe("VALIDATION_ERROR");
		});
	});

	test.describe("Admin API - Privacy Controls", () => {
		test("should create item with hidden location", async ({ request }) => {
			const formData = new FormData();
			formData.append("name", "Item with Hidden Location");
			formData.append("description", "Location is hidden from public");
			formData.append("category", "1");
			formData.append("location", "Secret Location");
			formData.append("dateFound", new Date().toISOString());
			formData.append("hideLocation", "true");
			formData.append("hideDateFound", "false");

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.hideLocation).toBe(true);
			expect(data.data.hideDateFound).toBe(false);
			expect(data.data.location).toBe("Secret Location"); // Admin sees full data
		});

		test("should create item with hidden date", async ({ request }) => {
			const formData = new FormData();
			formData.append("name", "Item with Hidden Date");
			formData.append("description", "Date is hidden from public");
			formData.append("category", "2");
			formData.append("location", "Public Location");
			formData.append("dateFound", new Date().toISOString());
			formData.append("hideLocation", "false");
			formData.append("hideDateFound", "true");

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.hideLocation).toBe(false);
			expect(data.data.hideDateFound).toBe(true);
			expect(data.data.dateFound).toBeTruthy(); // Admin sees full data
		});

		test("should create item with both location and date hidden", async ({
			request,
		}) => {
			const formData = new FormData();
			formData.append("name", "Fully Private Item");
			formData.append("description", "Both location and date hidden");
			formData.append("category", "3");
			formData.append("location", "Confidential Location");
			formData.append("dateFound", new Date().toISOString());
			formData.append("hideLocation", "true");
			formData.append("hideDateFound", "true");

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.hideLocation).toBe(true);
			expect(data.data.hideDateFound).toBe(true);
		});
	});

	test.describe("Admin API - Retrieving Items with Security Questions", () => {
		test("should retrieve item with decrypted security questions", async ({
			request,
		}) => {
			// First create an item
			const formData = new FormData();
			formData.append("name", "Item for Retrieval Test");
			formData.append("description", "Testing retrieval");
			formData.append("category", "1");
			formData.append("location", "Test Location");
			formData.append("dateFound", new Date().toISOString());

			const securityQuestions = [
				{
					questionText: "What is the test answer?",
					questionType: "free_text",
					answer: "Correct Answer",
					displayOrder: 0,
				},
			];
			formData.append("securityQuestions", JSON.stringify(securityQuestions));

			const createResponse = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			const createData = await createResponse.json();
			const itemId = createData.data.id;

			// Now retrieve the item
			const getResponse = await request.get(
				`http://localhost:3000/api/admin/items/${itemId}`,
				{
					headers: {
						Cookie: authToken,
					},
				},
			);

			expect(getResponse.ok()).toBeTruthy();
			const getData = await getResponse.json();
			expect(getData.success).toBe(true);
			expect(getData.data.securityQuestions).toHaveLength(1);
			expect(getData.data.securityQuestions[0].answer).toBe("Correct Answer");
		});

		test("should retrieve security questions via dedicated endpoint", async ({
			request,
		}) => {
			if (!createdItemId) {
				test.skip();
			}

			const response = await request.get(
				`http://localhost:3000/api/admin/items/${createdItemId}/security-questions`,
				{
					headers: {
						Cookie: authToken,
					},
				},
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(Array.isArray(data.data)).toBe(true);
		});
	});

	test.describe("Admin API - Updating Security Questions", () => {
		test("should update security questions for existing item", async ({
			request,
		}) => {
			// Create item first
			const formData = new FormData();
			formData.append("name", "Item for Update Test");
			formData.append("description", "Testing updates");
			formData.append("category", "1");
			formData.append("location", "Test Location");
			formData.append("dateFound", new Date().toISOString());

			const initialQuestions = [
				{
					questionText: "Initial question?",
					questionType: "free_text",
					answer: "Initial answer",
					displayOrder: 0,
				},
			];
			formData.append("securityQuestions", JSON.stringify(initialQuestions));

			const createResponse = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			const createData = await createResponse.json();
			const itemId = createData.data.id;

			// Update security questions
			const updatedQuestions = [
				{
					questionText: "Updated question?",
					questionType: "free_text",
					answer: "Updated answer",
					displayOrder: 0,
				},
			];

			const updateResponse = await request.put(
				`http://localhost:3000/api/admin/items/${itemId}/security-questions`,
				{
					headers: {
						Cookie: authToken,
						"Content-Type": "application/json",
					},
					data: { securityQuestions: updatedQuestions },
				},
			);

			expect(updateResponse.ok()).toBeTruthy();
			const updateData = await updateResponse.json();
			expect(updateData.success).toBe(true);
			expect(updateData.data[0].questionText).toBe("Updated question?");
			expect(updateData.data[0].answer).toBe("Updated answer");
		});

		test("should update item with new privacy controls", async ({
			request,
		}) => {
			// Create item without privacy controls
			const formData = new FormData();
			formData.append("name", "Item for Privacy Update");
			formData.append("description", "Testing privacy updates");
			formData.append("category", "1");
			formData.append("location", "Public Location");
			formData.append("dateFound", new Date().toISOString());
			formData.append("hideLocation", "false");
			formData.append("hideDateFound", "false");

			const createResponse = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			const createData = await createResponse.json();
			const itemId = createData.data.id;

			// Update to hide location
			const updateFormData = new FormData();
			updateFormData.append("hideLocation", "true");

			const updateResponse = await request.patch(
				`http://localhost:3000/api/admin/items/${itemId}`,
				{
					headers: {
						Cookie: authToken,
					},
					multipart: updateFormData as any,
				},
			);

			expect(updateResponse.ok()).toBeTruthy();
			const updateData = await updateResponse.json();
			expect(updateData.success).toBe(true);
			expect(updateData.data.hideLocation).toBe(true);
		});
	});

	test.describe("Public API - Privacy Filtering", () => {
		let publicItemId: number;
		let hiddenLocationItemId: number;
		let hiddenDateItemId: number;
		let fullyHiddenItemId: number;

		test.beforeAll(async ({ request }) => {
			// Create test items with different privacy settings
			const items = [
				{
					name: "Public Item No Privacy",
					hideLocation: false,
					hideDateFound: false,
				},
				{
					name: "Item Hidden Location",
					hideLocation: true,
					hideDateFound: false,
				},
				{
					name: "Item Hidden Date",
					hideLocation: false,
					hideDateFound: true,
				},
				{
					name: "Item Fully Hidden",
					hideLocation: true,
					hideDateFound: true,
				},
			];

			for (const item of items) {
				const formData = new FormData();
				formData.append("name", item.name);
				formData.append("description", "Test item for public API");
				formData.append("category", "1");
				formData.append("location", "Test Location");
				formData.append("dateFound", new Date().toISOString());
				formData.append("hideLocation", item.hideLocation.toString());
				formData.append("hideDateFound", item.hideDateFound.toString());

				const response = await request.post(
					"http://localhost:3000/api/admin/items",
					{
						headers: {
							Cookie: authToken,
						},
						multipart: formData as any,
					},
				);

				const data = await response.json();
				if (item.name === "Public Item No Privacy") publicItemId = data.data.id;
				if (item.name === "Item Hidden Location")
					hiddenLocationItemId = data.data.id;
				if (item.name === "Item Hidden Date") hiddenDateItemId = data.data.id;
				if (item.name === "Item Fully Hidden") fullyHiddenItemId = data.data.id;
			}
		});

		test("should return full data for public item without privacy controls", async ({
			request,
		}) => {
			const response = await request.get(
				`http://localhost:3000/api/items/${publicItemId}`,
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.location).toBeTruthy();
			expect(data.data.dateFound).toBeTruthy();
			expect(data.data.securityQuestions).toBeUndefined();
		});

		test("should hide location when hideLocation is true", async ({
			request,
		}) => {
			const response = await request.get(
				`http://localhost:3000/api/items/${hiddenLocationItemId}`,
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.location).toBeNull();
			expect(data.data.dateFound).toBeTruthy();
			expect(data.data.hideLocation).toBe(true);
		});

		test("should hide date when hideDateFound is true", async ({ request }) => {
			const response = await request.get(
				`http://localhost:3000/api/items/${hiddenDateItemId}`,
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.location).toBeTruthy();
			expect(data.data.dateFound).toBeNull();
			expect(data.data.hideDateFound).toBe(true);
		});

		test("should hide both location and date when both flags are true", async ({
			request,
		}) => {
			const response = await request.get(
				`http://localhost:3000/api/items/${fullyHiddenItemId}`,
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data.location).toBeNull();
			expect(data.data.dateFound).toBeNull();
			expect(data.data.hideLocation).toBe(true);
			expect(data.data.hideDateFound).toBe(true);
		});

		test("should never expose security questions in public API", async ({
			request,
		}) => {
			// Create item with security questions
			const formData = new FormData();
			formData.append("name", "Item with Secret Questions");
			formData.append("description", "Has security questions");
			formData.append("category", "1");
			formData.append("location", "Test Location");
			formData.append("dateFound", new Date().toISOString());

			const securityQuestions = [
				{
					questionText: "Secret question?",
					questionType: "free_text",
					answer: "Secret answer",
					displayOrder: 0,
				},
			];
			formData.append("securityQuestions", JSON.stringify(securityQuestions));

			const createResponse = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					headers: {
						Cookie: authToken,
					},
					multipart: formData as any,
				},
			);

			const createData = await createResponse.json();
			const itemId = createData.data.id;

			// Try to get via public API
			const publicResponse = await request.get(
				`http://localhost:3000/api/items/${itemId}`,
			);

			expect(publicResponse.ok()).toBeTruthy();
			const publicData = await publicResponse.json();
			expect(publicData.success).toBe(true);
			expect(publicData.data.securityQuestions).toBeUndefined();
			expect(JSON.stringify(publicData.data)).not.toContain("Secret answer");
		});

		test("should include items with hidden fields in search results", async ({
			request,
		}) => {
			const response = await request.get("http://localhost:3000/api/items");

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.success).toBe(true);

			// Check that items with privacy controls are included
			const items = data.data.items;
			const hasHiddenLocationItem = items.some(
				(item: any) => item.id === hiddenLocationItemId,
			);
			const hasHiddenDateItem = items.some(
				(item: any) => item.id === hiddenDateItemId,
			);

			expect(hasHiddenLocationItem || hasHiddenDateItem).toBe(true);
		});
	});

	test.describe("Access Control - Security Question Endpoints", () => {
		test("should reject unauthenticated access to admin create endpoint", async ({
			request,
		}) => {
			const formData = new FormData();
			formData.append("name", "Unauthorized Item");
			formData.append("description", "Should fail");
			formData.append("category", "1");
			formData.append("location", "Test");
			formData.append("dateFound", new Date().toISOString());

			const response = await request.post(
				"http://localhost:3000/api/admin/items",
				{
					multipart: formData as any,
				},
			);

			expect(response.status()).toBe(401);
		});

		test("should reject unauthenticated access to admin get endpoint", async ({
			request,
		}) => {
			if (!createdItemId) {
				test.skip();
			}

			const response = await request.get(
				`http://localhost:3000/api/admin/items/${createdItemId}`,
			);

			expect(response.status()).toBe(401);
		});

		test("should reject unauthenticated access to security questions endpoint", async ({
			request,
		}) => {
			if (!createdItemId) {
				test.skip();
			}

			const response = await request.get(
				`http://localhost:3000/api/admin/items/${createdItemId}/security-questions`,
			);

			expect(response.status()).toBe(401);
		});

		test("should reject unauthenticated access to update security questions", async ({
			request,
		}) => {
			if (!createdItemId) {
				test.skip();
			}

			const response = await request.put(
				`http://localhost:3000/api/admin/items/${createdItemId}/security-questions`,
				{
					headers: {
						"Content-Type": "application/json",
					},
					data: {
						securityQuestions: [
							{
								questionText: "Unauthorized question?",
								questionType: "free_text",
								answer: "Should fail",
							},
						],
					},
				},
			);

			expect(response.status()).toBe(401);
		});

		test("should reject unauthenticated access to admin update endpoint", async ({
			request,
		}) => {
			if (!createdItemId) {
				test.skip();
			}

			const formData = new FormData();
			formData.append("hideLocation", "true");

			const response = await request.patch(
				`http://localhost:3000/api/admin/items/${createdItemId}`,
				{
					multipart: formData as any,
				},
			);

			expect(response.status()).toBe(401);
		});
	});
});
