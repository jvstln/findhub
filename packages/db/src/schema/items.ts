import {
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const itemStatusEnum = pgEnum("item_status", [
	"unclaimed",
	"claimed",
	"returned",
	"archived",
]);

export const lostItem = pgTable(
	"lost_item",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description").notNull(),
		categoryId: integer("category").references(() => itemCategory.id),
		keywords: text("keywords"),
		location: varchar("location", { length: 255 }).notNull(),
		dateFound: timestamp("date_found").notNull(),
		status: itemStatusEnum("status").notNull().default("unclaimed"),
		imageUrl: text("image_url"),
		imageKey: text("image_key"),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("lost_item_status_idx").on(table.status),
		index("lost_item_category_idx").on(table.categoryId),
		index("lost_item_date_found_idx").on(table.dateFound),
		index("lost_item_created_at_idx").on(table.createdAt),
	],
);

export const itemCategory = pgTable("item_category", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
});

export const itemStatusHistory = pgTable("item_status_history", {
	id: serial("id").primaryKey(),
	itemId: serial("item_id")
		.notNull()
		.references(() => lostItem.id, { onDelete: "cascade" }),
	previousStatus: itemStatusEnum("previous_status").notNull(),
	newStatus: itemStatusEnum("new_status").notNull(),
	changedById: text("changed_by_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	changedAt: timestamp("changed_at").notNull().defaultNow(),
	notes: text("notes"),
});

export type LostItem = typeof lostItem.$inferSelect;
export type StatusHistoryEntry = typeof itemStatusHistory.$inferSelect;
export type ItemStatus = (typeof itemStatusEnum.enumValues)[number];
