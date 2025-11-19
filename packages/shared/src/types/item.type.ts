import type z from "zod";
import type {
	createItemSchema,
	createItemWithSecuritySchema,
	searchFiltersSchema,
	statusUpdateSchema,
	updateItemSchema,
	updateItemWithSecuritySchema,
} from "../schemas/item.schema";

// Re-export database types
export type {
	ItemImage,
	ItemStatus,
	LostItem,
	LostItemWithImages,
	LostItemWithImagesAndHistory,
	PublicLostItem,
	StatusHistoryEntry,
} from "@findhub/db/schemas/items";

export type NewItem = z.infer<typeof createItemSchema>;
export type ItemUpdate = z.infer<typeof updateItemSchema>;

export type NewItemWithSecurity = z.infer<typeof createItemWithSecuritySchema>;
export type ItemUpdateWithSecurity = z.infer<
	typeof updateItemWithSecuritySchema
>;

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
