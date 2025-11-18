import { describe, expect, it } from "bun:test";
import { decrypt, encrypt } from "./encryption.service";

// Set test encryption key before running tests
process.env.ENCRYPTION_KEY =
	"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("EncryptionService", () => {
	it("should encrypt and decrypt text correctly", () => {
		const plainText = "Dell Laptop";
		const { encryptedText, iv, authTag } = encrypt(plainText);
		const decrypted = decrypt(encryptedText, iv, authTag);
		expect(decrypted).toBe(plainText);
	});

	it("should generate unique IVs for each encryption", () => {
		const text = "Same text";
		const result1 = encrypt(text);
		const result2 = encrypt(text);

		// IVs should be different
		expect(result1.iv).not.toBe(result2.iv);
		// Encrypted text should be different due to different IVs
		expect(result1.encryptedText).not.toBe(result2.encryptedText);
		// But both should decrypt to the same text
		expect(decrypt(result1.encryptedText, result1.iv, result1.authTag)).toBe(
			text,
		);
		expect(decrypt(result2.encryptedText, result2.iv, result2.authTag)).toBe(
			text,
		);
	});

	it("should fail decryption with wrong auth tag", () => {
		const { encryptedText, iv } = encrypt("test");
		expect(() => {
			decrypt(encryptedText, iv, "0".repeat(32));
		}).toThrow(/Authentication tag verification failed/);
	});

	it("should fail decryption with wrong IV", () => {
		const { encryptedText, authTag } = encrypt("test");
		const wrongIv = "0".repeat(32);
		expect(() => {
			decrypt(encryptedText, wrongIv, authTag);
		}).toThrow(/Decryption failed/);
	});

	it("should fail decryption with tampered encrypted text", () => {
		const { encryptedText, iv, authTag } = encrypt("test");
		// Tamper with the encrypted text
		const tamperedText = `${encryptedText.slice(0, -2)}00`;
		expect(() => {
			decrypt(tamperedText, iv, authTag);
		}).toThrow(/Authentication tag verification failed/);
	});

	it("should handle empty string encryption", () => {
		const plainText = "";
		const { encryptedText, iv, authTag } = encrypt(plainText);
		const decrypted = decrypt(encryptedText, iv, authTag);
		expect(decrypted).toBe(plainText);
	});

	it("should handle long text encryption", () => {
		const plainText = "A".repeat(10000);
		const { encryptedText, iv, authTag } = encrypt(plainText);
		const decrypted = decrypt(encryptedText, iv, authTag);
		expect(decrypted).toBe(plainText);
	});

	it("should handle special characters", () => {
		const plainText = "Test with special chars: !@#$%^&*()_+-=[]{}|;:',.<>?/~`";
		const { encryptedText, iv, authTag } = encrypt(plainText);
		const decrypted = decrypt(encryptedText, iv, authTag);
		expect(decrypted).toBe(plainText);
	});

	it("should handle unicode characters", () => {
		const plainText = "Unicode test: 你好世界 🌍 émojis 🎉";
		const { encryptedText, iv, authTag } = encrypt(plainText);
		const decrypted = decrypt(encryptedText, iv, authTag);
		expect(decrypted).toBe(plainText);
	});

	it("should throw error when encryption key is not set", () => {
		const originalKey = process.env.ENCRYPTION_KEY;
		delete process.env.ENCRYPTION_KEY;

		expect(() => {
			encrypt("test");
		}).toThrow(/ENCRYPTION_KEY environment variable is not set/);

		// Restore key
		process.env.ENCRYPTION_KEY = originalKey;
	});

	it("should throw error when encryption key is invalid length", () => {
		const originalKey = process.env.ENCRYPTION_KEY;
		process.env.ENCRYPTION_KEY = "tooshort";

		expect(() => {
			encrypt("test");
		}).toThrow(/ENCRYPTION_KEY must be a 64-character hex string/);

		// Restore key
		process.env.ENCRYPTION_KEY = originalKey;
	});

	it("should throw error when encryption key is not valid hex", () => {
		const originalKey = process.env.ENCRYPTION_KEY;
		process.env.ENCRYPTION_KEY = "z".repeat(64); // Invalid hex characters

		expect(() => {
			encrypt("test");
		}).toThrow(/ENCRYPTION_KEY must be a valid 64-character hex string/);

		// Restore key
		process.env.ENCRYPTION_KEY = originalKey;
	});
});
