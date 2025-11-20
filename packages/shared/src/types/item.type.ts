import type z from "zod";
import type {
	createItemSchema,
	searchFiltersSchema,
	statusUpdateSchema,
	updateItemSchema,
} from "../schemas/item.schema";

// Re-export database types
export type {
	ItemImage,
	ItemStatus,
	LostItem,
	LostItemWithDecryptedSecurity,
	LostItemWithImages,
	LostItemWithImagesAndHistory,
	LostItemWithSecurity,
	PublicLostItem,
	SecurityQuestion,
	SecurityQuestionInput,
	SecurityQuestionWithDecryptedAnswer,
	StatusHistoryEntry,
} from "@findhub/db/schemas/items";

export type NewItem = z.infer<typeof createItemSchema>;
export type NewItemInput = z.input<typeof createItemSchema>;
export type ItemUpdate = z.infer<typeof updateItemSchema>;
export type ItemUpdateInput = z.input<typeof updateItemSchema>;

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
