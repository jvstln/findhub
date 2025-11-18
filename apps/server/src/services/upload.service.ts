import { supabase } from "../lib/supabase";

const BUCKET_NAME = "lost-items";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Validates file type and size
 */
function validateFile(file: File): void {
	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		throw new Error(
			`Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
		);
	}

	if (file.size > MAX_FILE_SIZE) {
		throw new Error(
			`File size exceeds limit: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 5MB`,
		);
	}
}

/**
 * Generates a unique filename using UUID
 */
function generateUniqueFilename(originalFilename: string): string {
	const extension = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
	const uuid = crypto.randomUUID();
	return `${uuid}.${extension}`;
}

/**
 * Uploads an item image to Supabase Storage
 * @param file - The image file to upload
 * @returns Object containing the public URL and storage key
 */
export async function uploadItemImage(
	file: File,
): Promise<{ url: string; key: string }> {
	// Validate file
	validateFile(file);

	// Generate unique filename
	const filename = generateUniqueFilename(file.name);

	// Upload to Supabase Storage
	const { error } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(filename, file, {
			contentType: file.type,
			upsert: false,
		});

	if (error) {
		throw new Error(`Failed to upload image: ${error.message}`);
	}

	// Get public URL
	const {
		data: { publicUrl },
	} = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);

	return {
		url: publicUrl,
		key: filename,
	};
}

/**
 * Deletes an item image from Supabase Storage
 * @param key - The storage key (filename) of the image to delete
 */
export async function deleteItemImage(key: string): Promise<void> {
	const { error } = await supabase.storage.from(BUCKET_NAME).remove([key]);

	if (error) {
		throw new Error(`Failed to delete image: ${error.message}`);
	}
}
