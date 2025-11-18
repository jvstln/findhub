import { describe, expect, test } from "bun:test";
import { isNetworkError } from "./offline-utils";

describe("isNetworkError", () => {
	test("should return true for network-related error messages", () => {
		const networkError = new Error("Network request failed");
		expect(isNetworkError(networkError)).toBe(true);
	});

	test("should return true for fetch-related error messages", () => {
		const fetchError = new Error("Failed to fetch");
		expect(isNetworkError(fetchError)).toBe(true);
	});

	test("should return true for connection-related error messages", () => {
		const connectionError = new Error("Connection refused");
		expect(isNetworkError(connectionError)).toBe(true);
	});

	test("should return true for timeout-related error messages", () => {
		const timeoutError = new Error("Request timeout");
		expect(isNetworkError(timeoutError)).toBe(true);
	});

	test("should return true for offline-related error messages", () => {
		const offlineError = new Error("You are offline");
		expect(isNetworkError(offlineError)).toBe(true);
	});

	test("should return false for non-network errors", () => {
		const validationError = new Error("Validation failed");
		expect(isNetworkError(validationError)).toBe(false);
	});

	test("should return false for non-Error objects", () => {
		expect(isNetworkError("string error")).toBe(false);
		expect(isNetworkError(null)).toBe(false);
		expect(isNetworkError(undefined)).toBe(false);
		expect(isNetworkError(123)).toBe(false);
	});

	test("should be case-insensitive", () => {
		const upperCaseError = new Error("NETWORK ERROR");
		expect(isNetworkError(upperCaseError)).toBe(true);
	});
});
