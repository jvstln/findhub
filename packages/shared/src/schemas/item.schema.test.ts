import { describe, expect, test } from "bun:test";
import {
	createItemSchema,
	itemStatusSchema,
	searchFiltersSchema,
	statusUpdateSchema,
	updateItemSchema,
} from "./item.schema";

describe("itemStatusSchema", () => {
	test("should accept valid status values", () => {
		expect(itemStatusSchema.parse("unclaimed")).toBe("unclaimed");
		expect(itemStatusSchema.parse("claimed")).toBe("claimed");
		expect(itemStatusSchema.parse("returned")).toBe("returned");
		expect(itemStatusSchema.parse("archived")).toBe("archived");
	});

	test("should reject invalid status values", () => {
		expect(() => itemStatusSchema.parse("invalid")).toThrow();
		expect(() => itemStatusSchema.parse("")).toThrow();
		expect(() => itemStatusSchema.parse(null)).toThrow();
	});
});

describe("createItemSchema", () => {
	const validItemData = {
		name: "Lost Wallet",
		description: "Black leather wallet found near library",
		category: "accessories",
		location: "Main Library",
		dateFound: new Date("2024-01-15"),
	};

	test("should accept valid item data", () => {
		const result = createItemSchema.parse(validItemData);
		expect(result.name).toBe("Lost Wallet");
		expect(result.description).toBe("Black leather wallet found near library");
		expect(result.category).toBe("accessories");
		expect(result.location).toBe("Main Library");
		expect(result.dateFound).toBeInstanceOf(Date);
	});

	test("should reject name shorter than 3 characters", () => {
		const invalidData = { ...validItemData, name: "AB" };
		expect(() => createItemSchema.parse(invalidData)).toThrow();
	});

	test("should reject name longer than 255 characters", () => {
		const invalidData = { ...validItemData, name: "A".repeat(256) };
		expect(() => createItemSchema.parse(invalidData)).toThrow();
	});

	test("should reject description shorter than 10 characters", () => {
		const invalidData = { ...validItemData, description: "Short" };
		expect(() => createItemSchema.parse(invalidData)).toThrow();
	});

	test("should reject description longer than 2000 characters", () => {
		const invalidData = { ...validItemData, description: "A".repeat(2001) };
		expect(() => createItemSchema.parse(invalidData)).toThrow();
	});

	test("should reject empty category", () => {
		const invalidData = { ...validItemData, category: "" };
		expect(() => createItemSchema.parse(invalidData)).toThrow();
	});

	test("should reject location shorter than 3 characters", () => {
		const invalidData = { ...validItemData, location: "AB" };
		expect(() => createItemSchema.parse(invalidData)).toThrow();
	});

	test("should accept optional keywords", () => {
		const dataWithKeywords = { ...validItemData, keywords: "wallet, leather" };
		const result = createItemSchema.parse(dataWithKeywords);
		expect(result.keywords).toBe("wallet, leather");
	});

	test("should accept optional status", () => {
		const dataWithStatus = { ...validItemData, status: "claimed" };
		const result = createItemSchema.parse(dataWithStatus);
		expect(result.status).toBe("claimed");
	});

	test("should coerce string date to Date object", () => {
		const dataWithStringDate = {
			...validItemData,
			dateFound: "2024-01-15",
		};
		const result = createItemSchema.parse(dataWithStringDate);
		expect(result.dateFound).toBeInstanceOf(Date);
	});
});

describe("updateItemSchema", () => {
	test("should accept partial item data", () => {
		const partialData = { name: "Updated Name" };
		const result = updateItemSchema.parse(partialData);
		expect(result.name).toBe("Updated Name");
	});

	test("should accept empty object", () => {
		const result = updateItemSchema.parse({});
		expect(result).toEqual({});
	});

	test("should accept status update", () => {
		const statusData = { status: "returned" };
		const result = updateItemSchema.parse(statusData);
		expect(result.status).toBe("returned");
	});

	test("should still validate provided fields", () => {
		const invalidData = { name: "AB" };
		expect(() => updateItemSchema.parse(invalidData)).toThrow();
	});
});

describe("searchFiltersSchema", () => {
	test("should accept empty filters", () => {
		const result = searchFiltersSchema.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(20);
	});

	test("should accept keyword filter", () => {
		const result = searchFiltersSchema.parse({ keyword: "wallet" });
		expect(result.query).toBe("wallet");
	});

	test("should accept category filter", () => {
		const result = searchFiltersSchema.parse({ category: "electronics" });
		expect(result.categoryId).toBe("electronics");
	});

	test("should accept location filter", () => {
		const result = searchFiltersSchema.parse({ location: "Library" });
		expect(result.location).toBe("Library");
	});

	test("should accept status filter", () => {
		const result = searchFiltersSchema.parse({ status: "unclaimed" });
		expect(result.status).toBe("unclaimed");
	});

	test("should accept date range filters", () => {
		const result = searchFiltersSchema.parse({
			dateFrom: "2024-01-01",
			dateTo: "2024-12-31",
		});
		expect(result.dateFrom).toBeInstanceOf(Date);
		expect(result.dateTo).toBeInstanceOf(Date);
	});

	test("should accept custom page number", () => {
		const result = searchFiltersSchema.parse({ page: 5 });
		expect(result.page).toBe(5);
	});

	test("should accept custom page size", () => {
		const result = searchFiltersSchema.parse({ pageSize: 50 });
		expect(result.pageSize).toBe(50);
	});

	test("should reject page size over 100", () => {
		expect(() => searchFiltersSchema.parse({ pageSize: 101 })).toThrow();
	});

	test("should reject negative page number", () => {
		expect(() => searchFiltersSchema.parse({ page: -1 })).toThrow();
	});

	test("should coerce string numbers to integers", () => {
		const result = searchFiltersSchema.parse({ page: "3", pageSize: "25" });
		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
	});
});

describe("statusUpdateSchema", () => {
	test("should accept valid status", () => {
		const result = statusUpdateSchema.parse({ status: "claimed" });
		expect(result.status).toBe("claimed");
	});

	test("should accept status with notes", () => {
		const result = statusUpdateSchema.parse({
			status: "returned",
			notes: "Item returned to owner",
		});
		expect(result.status).toBe("returned");
		expect(result.notes).toBe("Item returned to owner");
	});

	test("should reject invalid status", () => {
		expect(() => statusUpdateSchema.parse({ status: "invalid" })).toThrow();
	});

	test("should reject notes longer than 500 characters", () => {
		const longNotes = "A".repeat(501);
		expect(() =>
			statusUpdateSchema.parse({ status: "claimed", notes: longNotes }),
		).toThrow();
	});

	test("should accept optional notes", () => {
		const result = statusUpdateSchema.parse({ status: "claimed" });
		expect(result.notes).toBeUndefined();
	});
});
