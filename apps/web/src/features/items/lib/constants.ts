/**
 * Predefined item categories for the lost and found system
 */
export const ITEM_CATEGORIES = [
	{ value: "electronics", label: "Electronics" },
	{ value: "clothing", label: "Clothing" },
	{ value: "accessories", label: "Accessories" },
	{ value: "books", label: "Books & Stationery" },
	{ value: "keys", label: "Keys & Cards" },
	{ value: "bags", label: "Bags & Backpacks" },
	{ value: "sports", label: "Sports Equipment" },
	{ value: "jewelry", label: "Jewelry" },
	{ value: "documents", label: "Documents & IDs" },
	{ value: "other", label: "Other" },
] as const;

export type ItemCategoryValue = (typeof ITEM_CATEGORIES)[number]["value"];
