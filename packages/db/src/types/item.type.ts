import { itemStatusHistory, lostItem, itemStatusEnum } from "../schema/items";

export type LostItem = typeof lostItem.$inferSelect;
export type StatusHistoryEntry = typeof itemStatusHistory.$inferSelect;
export type ItemStatus = (typeof itemStatusEnum.enumValues)[number];
