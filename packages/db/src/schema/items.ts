import {
	index,
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
		category: varchar("category", { length: 100 }).notNull(),
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
	(table) => ({
		statusIdx: index("lost_item_status_idx").on(table.status),
		categoryIdx: index("lost_item_category_idx").on(table.category),
		dateFoundIdx: index("lost_item_date_found_idx").on(table.dateFound),
		createdAtIdx: index("lost_item_created_at_idx").on(table.createdAt),
	}),
);

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
