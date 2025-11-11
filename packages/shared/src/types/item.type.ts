// Shared TypeScript types for lost items feature
// Note: LostItem, StatusHistoryEntry, and ItemStatus types are inferred from the database schema
import type { ItemStatus } from "@findhub/db/types/item";
export type * from "@findhub/db/types/item";

export type ItemCategory =
  | "electronics"
  | "clothing"
  | "accessories"
  | "books"
  | "keys"
  | "cards"
  | "bags"
  | "other";

export interface SearchFilters {
  keyword?: string;
  category?: ItemCategory;
  location?: string;
  status?: ItemStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}
