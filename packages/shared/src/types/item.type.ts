import type z from "zod";
import type {
	createItemSchema,
	searchFiltersSchema,
	statusUpdateSchema,
	updateItemSchema,
} from "../schemas/item.schema";

export type * from "@findhub/db/types/item";

export type NewItem = z.infer<typeof createItemSchema>;
export type ItemUpdate = z.infer<typeof updateItemSchema>;

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
