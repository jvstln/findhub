import type {
	ItemUpdateWithSecurity,
	LostItemWithImages,
} from "@findhub/shared/types/item";
import { patch, postFormData } from "@/lib/api-client";

/**
 * Update an existing lost item
 * @param id - The item ID
 * @param data - The partial item data to update
 * @returns The updated lost item
 */
export async function updateItem(
	id: number,
	data: ItemUpdateWithSecurity,
): Promise<LostItemWithImages> {
	// If there are image files, use FormData
	if (data.images && data.images.length > 0) {
		const formData = new FormData();

		if (data.name) formData.append("name", data.name);
		if (data.description) formData.append("description", data.description);
		if (data.category) formData.append("category", data.category);
		if (data.location) formData.append("location", data.location);
		if (data.dateFound)
			formData.append("dateFound", data.dateFound.toISOString());
		if (data.keywords) formData.append("keywords", data.keywords);
		if (data.status) formData.append("status", data.status);
		if (data.hideLocation !== undefined)
			formData.append("hideLocation", String(data.hideLocation));
		if (data.hideDateFound !== undefined)
			formData.append("hideDateFound", String(data.hideDateFound));
		if (data.securityQuestions)
			formData.append(
				"securityQuestions",
				JSON.stringify(data.securityQuestions),
			);

		for (const image of data.images) {
			formData.append("images", image);
		}

		// Use POST with _method override or a different endpoint for multipart updates
		// Since PATCH with FormData can be tricky, we'll use the postFormData helper
		return postFormData<LostItemWithImages>(`/api/items/${id}`, formData);
	}

	// Otherwise, use regular JSON PATCH
	const updateData: Record<string, unknown> = {};

	if (data.name !== undefined) updateData.name = data.name;
	if (data.description !== undefined) updateData.description = data.description;
	if (data.category !== undefined) updateData.category = data.category;
	if (data.location !== undefined) updateData.location = data.location;
	if (data.dateFound !== undefined)
		updateData.dateFound = data.dateFound.toISOString();
	if (data.keywords !== undefined) updateData.keywords = data.keywords;
	if (data.status !== undefined) updateData.status = data.status;
	if (data.hideLocation !== undefined)
		updateData.hideLocation = data.hideLocation;
	if (data.hideDateFound !== undefined)
		updateData.hideDateFound = data.hideDateFound;
	if (data.securityQuestions !== undefined)
		updateData.securityQuestions = data.securityQuestions;

	return patch<LostItemWithImages>(`/api/items/${id}`, updateData);
}
