import type {
	ItemUpdate,
	LostItemWithImages,
} from "@findhub/shared/types/item";
import { patch } from "@findhub/ui/lib/api-client";

/**
 * Update an existing lost item
 * @param id - The item ID
 * @param data - The partial item data to update
 * @returns The updated lost item
 */
export async function updateItem(
	id: number,
	data: ItemUpdate,
): Promise<LostItemWithImages> {
	// If there are image files, use FormData
	if (data.images && data.images.length > 0) {
		const formData = new FormData();

		if (data.name) formData.append("name", data.name);
		if (data.description) formData.append("description", data.description);
		if (data.categoryId)
			formData.append("categoryId", data.categoryId.toString());
		if (data.location) formData.append("location", data.location);
		if (data.dateFound)
			formData.append("dateFound", data.dateFound.toISOString());
		if (data.keywords)
			formData.append("keywords", JSON.stringify(data.keywords));
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

		return patch<LostItemWithImages>(`/api/admin/items/${id}`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	}

	// Otherwise, use FormData for all updates to match server expectations
	const formData = new FormData();

	if (data.name !== undefined) formData.append("name", data.name);
	if (data.description !== undefined)
		formData.append("description", data.description);
	if (data.categoryId !== undefined)
		formData.append("categoryId", data.categoryId.toString());
	if (data.location !== undefined) formData.append("location", data.location);
	if (data.dateFound !== undefined)
		formData.append("dateFound", data.dateFound.toISOString());
	if (data.keywords !== undefined)
		formData.append("keywords", JSON.stringify(data.keywords));
	if (data.status !== undefined) formData.append("status", data.status);
	if (data.hideLocation !== undefined)
		formData.append("hideLocation", String(data.hideLocation));
	if (data.hideDateFound !== undefined)
		formData.append("hideDateFound", String(data.hideDateFound));
	if (data.securityQuestions !== undefined)
		formData.append(
			"securityQuestions",
			JSON.stringify(data.securityQuestions),
		);

	return patch<LostItemWithImages>(`/api/admin/items/${id}`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
}
