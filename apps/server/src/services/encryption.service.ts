import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

export interface EncryptedData {
	encryptedText: string;
	iv: string;
	authTag: string;
}

/**
 * Get the encryption key from environment
 */
function getKey(): string {
	const key = process.env.ENCRYPTION_KEY;
	if (!key) {
		throw new Error(
			"ENCRYPTION_KEY environment variable is not set. Generate one using: bun run scripts/generate-encryption-key.ts",
		);
	}

	if (key.length !== 64) {
		throw new Error(
			"ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate one using: bun run scripts/generate-encryption-key.ts",
		);
	}

	// Validate it's a valid hex string
	if (!/^[0-9a-fA-F]{64}$/.test(key)) {
		throw new Error(
			"ENCRYPTION_KEY must be a valid 64-character hex string. Generate one using: bun run scripts/generate-encryption-key.ts",
		);
	}

	return key;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plainText - The text to encrypt
 * @returns Object containing encrypted text, IV, and authentication tag
 * @throws Error if encryption fails or key is not configured
 */
export function encrypt(plainText: string): EncryptedData {
	try {
		const key = getKey();

		// Generate random initialization vector
		const iv = crypto.randomBytes(16);

		// Create cipher
		const cipher = crypto.createCipheriv(
			ALGORITHM,
			Buffer.from(key, "hex"),
			iv,
		);

		// Encrypt
		let encrypted = cipher.update(plainText, "utf8", "hex");
		encrypted += cipher.final("hex");

		// Get authentication tag
		const authTag = cipher.getAuthTag();

		return {
			encryptedText: encrypted,
			iv: iv.toString("hex"),
			authTag: authTag.toString("hex"),
		};
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Encryption failed: ${error.message}`);
		}
		throw new Error("Encryption failed: Unknown error");
	}
}

/**
 * Decrypt sensitive data using AES-256-GCM
 * @param encryptedText - The encrypted text
 * @param iv - The initialization vector used during encryption
 * @param authTag - The authentication tag from encryption
 * @returns The decrypted plain text
 * @throws Error if decryption fails, authentication fails, or key is not configured
 */
export function decrypt(
	encryptedText: string,
	iv: string,
	authTag: string,
): string {
	try {
		const key = getKey();

		// Create decipher
		const decipher = crypto.createDecipheriv(
			ALGORITHM,
			Buffer.from(key, "hex"),
			Buffer.from(iv, "hex"),
		);

		// Set authentication tag
		decipher.setAuthTag(Buffer.from(authTag, "hex"));

		// Decrypt
		let decrypted = decipher.update(encryptedText, "hex", "utf8");
		decrypted += decipher.final("utf8");

		return decrypted;
	} catch (error) {
		if (error instanceof Error) {
			// Authentication tag verification failure indicates tampering or wrong key
			if (
				error.message.includes(
					"Unsupported state or unable to authenticate data",
				)
			) {
				throw new Error(
					"Decryption failed: Authentication tag verification failed. Data may have been tampered with or encryption key is incorrect.",
				);
			}
			throw new Error(`Decryption failed: ${error.message}`);
		}
		throw new Error("Decryption failed: Unknown error");
	}
}
