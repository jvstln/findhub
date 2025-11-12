import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

interface ValidationResult {
	valid: boolean;
	error?: string;
}
/**
 * Upload result containing file information
 */
export interface UploadResult {
	filename: string;
	url: string;
	key: string;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "items");
const MIME_TO_EXT: Record<string, string> = {
	"image/jpeg": ".jpg",
	"image/png": ".png",
	"image/webp": ".webp",
};

/**
 * Validates file type and size
 */
export function validateFile(file: File): ValidationResult {
	// Check file type
	if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
		return {
			valid: false,
			error: "Invalid file type. Allowed types: JPEG, PNG, WebP",
		};
	}

	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: "File size exceeds maximum limit of 5MB",
		};
	}

	return { valid: true };
}

/**
 * Generates a unique filename with timestamp and UUID
 */
export function generateFilename(file: File): string {
	const timestamp = Date.now();
	const uuid = randomUUID();
	const ext = MIME_TO_EXT[file.type] || extname(file.name);
	return `${timestamp}-${uuid}${ext}`;
}

/**
 * Ensures the upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
	if (!existsSync(UPLOAD_DIR)) {
		await mkdir(UPLOAD_DIR, { recursive: true });
	}
}

/**
 * Saves an uploaded file to the server
 */
export async function saveFile(file: File): Promise<UploadResult> {
	// Validate file
	const validation = validateFile(file);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	// Ensure upload directory exists
	await ensureUploadDir();

	// Generate unique filename
	const filename = generateFilename(file);
	const filepath = join(UPLOAD_DIR, filename);

	// Convert file to buffer and save
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(filepath, buffer);

	// Return file information
	return {
		filename,
		url: `/uploads/items/${filename}`,
		key: filename,
	};
}

/**
 * Deletes a file from the server
 */
export async function deleteFile(key: string): Promise<void> {
	const filepath = join(UPLOAD_DIR, key);

	if (existsSync(filepath)) {
		await unlink(filepath);
	}
}
