import type {
	LostItemWithImages,
	NewItemWithSecurity,
} from "@findhub/shared/types/item";
import { postFormData } from "@/lib/api-client";

/**
 * Create a new lost item with optional multiple image uploads, security questions, and privacy controls
 * @param data - The item data including name, description, category, location, dateFound, optional images, security questions, and privacy settings
 * @returns The created lost item
 */
export async function createItem(
	data: NewItemWithSecurity,
): Promise<LostItemWithImages> {
	const formData = new FormData();

	formData.append("name", String(data.name));
	formData.append("description", String(data.description));
	formData.append("category", String(data.category));
	formData.append("location", String(data.location));
	formData.append("dateFound", data.dateFound.toISOString());

	if (data.keywords) {
		formData.append("keywords", String(data.keywords));
	}

	if (data.status) {
		formData.append("status", String(data.status));
	}

	// Add privacy controls
	formData.append("hideLocation", String(data.hideLocation ?? false));
	formData.append("hideDateFound", String(data.hideDateFound ?? false));

	// Add security questions if provided
	if (data.securityQuestions && data.securityQuestions.length > 0) {
		formData.append(
			"securityQuestions",
			JSON.stringify(data.securityQuestions),
		);
	}

	if (data.images && data.images.length > 0) {
		for (const image of data.images) {
			formData.append("images", image);
		}
	}

	return postFormData<LostItemWithImages>("/api/items", formData);
}
