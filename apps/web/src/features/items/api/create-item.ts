import type { LostItem, NewItem } from "@findhub/shared/types/item";
import { postFormData } from "@/lib/api-client";

/**
 * Create a new lost item with optional image upload
 * @param data - The item data including name, description, category, location, dateFound, and optional image
 * @returns The created lost item
 */
export async function createItem(data: NewItem): Promise<LostItem> {
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

	if (data.image) {
		formData.append("image", data.image);
	}

	return postFormData<LostItem>("/api/items", formData);
}
