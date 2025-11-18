import { describe, expect, test } from "bun:test";

// Test the validation logic without requiring Supabase connection
// These tests focus on the file validation rules

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateFile(file: File): { valid: boolean; error?: string } {
	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return {
			valid: false,
			error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
		};
	}

	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File size exceeds limit: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 5MB`,
		};
	}

	return { valid: true };
}

function generateUniqueFilename(originalFilename: string): string {
	const extension = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
	const uuid = crypto.randomUUID();
	return `${uuid}.${extension}`;
}

describe("File validation", () => {
	test("should reject file with invalid MIME type", () => {
		const invalidFile = new File(["content"], "test.pdf", {
			type: "application/pdf",
		});

		const result = validateFile(invalidFile);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("Invalid file type");
	});

	test("should reject file exceeding size limit", () => {
		// Create a file larger than 5MB
		const largeContent = new Uint8Array(6 * 1024 * 1024); // 6MB
		const largeFile = new File([largeContent], "large.jpg", {
			type: "image/jpeg",
		});

		const result = validateFile(largeFile);
		expect(result.valid).toBe(false);
		expect(result.error).toContain("File size exceeds limit");
	});

	test("should accept valid JPEG file", () => {
		const validFile = new File(["content"], "test.jpg", {
			type: "image/jpeg",
		});

		const result = validateFile(validFile);
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	test("should accept valid PNG file", () => {
		const validFile = new File(["content"], "test.png", {
			type: "image/png",
		});

		const result = validateFile(validFile);
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	test("should accept valid WebP file", () => {
		const validFile = new File(["content"], "test.webp", {
			type: "image/webp",
		});

		const result = validateFile(validFile);
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	test("should accept file at exactly 5MB", () => {
		const exactContent = new Uint8Array(5 * 1024 * 1024); // Exactly 5MB
		const exactFile = new File([exactContent], "exact.jpg", {
			type: "image/jpeg",
		});

		const result = validateFile(exactFile);
		expect(result.valid).toBe(true);
	});

	test("should reject file just over 5MB", () => {
		const overContent = new Uint8Array(5 * 1024 * 1024 + 1); // 5MB + 1 byte
		const overFile = new File([overContent], "over.jpg", {
			type: "image/jpeg",
		});

		const result = validateFile(overFile);
		expect(result.valid).toBe(false);
	});
});

describe("Filename generation", () => {
	test("should generate unique filename with UUID", () => {
		const filename1 = generateUniqueFilename("test.jpg");
		const filename2 = generateUniqueFilename("test.jpg");

		// Filenames should be different even with same input
		expect(filename1).not.toBe(filename2);
	});

	test("should preserve file extension", () => {
		const jpegFilename = generateUniqueFilename("photo.jpg");
		const pngFilename = generateUniqueFilename("image.png");
		const webpFilename = generateUniqueFilename("picture.webp");

		expect(jpegFilename).toMatch(/\.jpg$/);
		expect(pngFilename).toMatch(/\.png$/);
		expect(webpFilename).toMatch(/\.webp$/);
	});

	test("should convert extension to lowercase", () => {
		const filename = generateUniqueFilename("photo.JPG");
		expect(filename).toMatch(/\.jpg$/);
		expect(filename).not.toMatch(/\.JPG$/);
	});

	test("should use UUID format", () => {
		const filename = generateUniqueFilename("test.jpg");
		// UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
		expect(filename).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/,
		);
	});

	test("should handle files without extension", () => {
		const filename = generateUniqueFilename("noextension");
		// When no extension is found, the whole filename becomes the extension
		expect(filename).toMatch(/\.noextension$/);
	});

	test("should handle multiple dots in filename", () => {
		const filename = generateUniqueFilename("my.photo.file.png");
		expect(filename).toMatch(/\.png$/);
	});
});
