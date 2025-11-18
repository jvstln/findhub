import { describe, expect, test } from "bun:test";
import {
	formatItemDate,
	formatItemDateLong,
	formatItemDateTime,
	formatRelativeTime,
} from "./date-utils";

describe("formatItemDate", () => {
	test("should format Date object correctly", () => {
		const date = new Date("2024-01-15T10:30:00");
		const result = formatItemDate(date);
		expect(result).toBe("Jan 15, 2024");
	});

	test("should format string date correctly", () => {
		const result = formatItemDate("2024-01-15T10:30:00");
		expect(result).toBe("Jan 15, 2024");
	});

	test("should handle different months", () => {
		const date = new Date("2024-12-25T10:30:00");
		const result = formatItemDate(date);
		expect(result).toBe("Dec 25, 2024");
	});
});

describe("formatItemDateLong", () => {
	test("should format Date object with weekday", () => {
		const date = new Date("2024-01-15T10:30:00");
		const result = formatItemDateLong(date);
		expect(result).toContain("January 15, 2024");
		expect(result).toContain("Monday");
	});

	test("should format string date with weekday", () => {
		const result = formatItemDateLong("2024-01-15T10:30:00");
		expect(result).toContain("January 15, 2024");
	});
});

describe("formatItemDateTime", () => {
	test("should format Date object with time", () => {
		const date = new Date("2024-01-15T14:30:00");
		const result = formatItemDateTime(date);
		expect(result).toContain("Jan 15, 2024");
		expect(result).toContain("2:30 PM");
	});

	test("should format string date with time", () => {
		const result = formatItemDateTime("2024-01-15T09:15:00");
		expect(result).toContain("Jan 15, 2024");
		expect(result).toContain("9:15 AM");
	});
});

describe("formatRelativeTime", () => {
	test("should return 'Today' for current date", () => {
		const today = new Date();
		const result = formatRelativeTime(today);
		expect(result).toBe("Today");
	});

	test("should return 'Yesterday' for date 1 day ago", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const result = formatRelativeTime(yesterday);
		expect(result).toBe("Yesterday");
	});

	test("should return days ago for dates within a week", () => {
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
		const result = formatRelativeTime(threeDaysAgo);
		expect(result).toBe("3 days ago");
	});

	test("should return weeks ago for dates within a month", () => {
		const twoWeeksAgo = new Date();
		twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
		const result = formatRelativeTime(twoWeeksAgo);
		expect(result).toBe("2 weeks ago");
	});

	test("should return singular week for 7 days ago", () => {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		const result = formatRelativeTime(oneWeekAgo);
		expect(result).toBe("1 week ago");
	});

	test("should return months ago for dates within a year", () => {
		const twoMonthsAgo = new Date();
		twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
		const result = formatRelativeTime(twoMonthsAgo);
		expect(result).toBe("2 months ago");
	});

	test("should return singular month for ~30 days ago", () => {
		const oneMonthAgo = new Date();
		oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
		const result = formatRelativeTime(oneMonthAgo);
		expect(result).toBe("1 month ago");
	});

	test("should return years ago for dates over a year", () => {
		const twoYearsAgo = new Date();
		twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
		const result = formatRelativeTime(twoYearsAgo);
		expect(result).toBe("2 years ago");
	});

	test("should return singular year for ~365 days ago", () => {
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
		const result = formatRelativeTime(oneYearAgo);
		expect(result).toBe("1 year ago");
	});

	test("should handle string dates", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const result = formatRelativeTime(yesterday.toISOString());
		expect(result).toBe("Yesterday");
	});
});
