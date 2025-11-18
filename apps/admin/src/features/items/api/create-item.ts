import type { LostItemWithImages, NewItem } from "@findhub/shared/types/item";
import { postFormData } from "@/lib/api-client";

/**
 * Create a new lost item with optional multiple image uploads
 * @param data - The item data including name, description, category, location, dateFound, and optional images
 * @returns The created lost item
 */
export async function createItem(data: NewItem): Promise<LostItemWithImages> {
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

	if (data.images && data.images.length > 0) {
		for (const image of data.images) {
			formData.append("images", image);
		}
	}

	return postFormData<LostItemWithImages>("/api/items", formData);
}
