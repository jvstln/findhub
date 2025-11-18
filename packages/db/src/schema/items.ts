import { relations } from "drizzle-orm";
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
import { users } from "./auth";
import { timestamps } from "./schema";

export const itemStatusEnum = pgEnum("item_status", [
	"unclaimed",
	"claimed",
	"returned",
	"archived",
]);

export const lostItems = pgTable(
	"lost_items",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description").notNull(),
		categoryId: integer("category_id").references(() => itemCategories.id),
		keywords: text("keywords").array(),
		location: varchar("location", { length: 255 }).notNull(),
		dateFound: timestamp("date_found").notNull(),
		status: itemStatusEnum("status").notNull().default("unclaimed"),
		createdById: text("created_by_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		index("lost_items_status_idx").on(table.status),
		index("lost_items_category_idx").on(table.categoryId),
		index("lost_items_date_found_idx").on(table.dateFound),
		index("lost_items_created_at_idx").on(table.createdAt),
	],
);

export const itemImages = pgTable(
	"item_images",
	{
		id: serial("id").primaryKey(),
		itemId: integer("item_id")
			.notNull()
			.references(() => lostItems.id, { onDelete: "cascade" }),
		url: text("url").notNull(),
		key: text("key").notNull(), // Storage key for deletion
		filename: varchar("filename", { length: 255 }).notNull(),
		mimeType: varchar("mime_type", { length: 100 }).notNull(),
		size: integer("size").notNull(), // File size in bytes
		displayOrder: integer("display_order").notNull().default(0),
		uploadedById: text("uploaded_by_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		...timestamps,
	},
	(table) => [
		index("item_images_item_id_idx").on(table.itemId),
		index("item_images_display_order_idx").on(table.itemId, table.displayOrder),
	],
);

export const itemCategories = pgTable("item_categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	...timestamps,
});

export const itemStatusHistories = pgTable("item_status_histories", {
	id: serial("id").primaryKey(),
	itemId: integer("item_id")
		.notNull()
		.references(() => lostItems.id, { onDelete: "cascade" }),
	previousStatus: itemStatusEnum("previous_status").notNull(),
	newStatus: itemStatusEnum("new_status").notNull(),
	changedById: text("changed_by_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	notes: text("notes"),
	...timestamps,
});

export const lostItemsRelations = relations(lostItems, ({ many }) => ({
	images: many(itemImages),
}));

export const imagesRelations = relations(itemImages, ({ one }) => ({
	images: one(lostItems, {
		fields: [itemImages.itemId],
		references: [lostItems.id],
	}),
}));

export type LostItem = typeof lostItems.$inferSelect;
export type ItemImage = typeof itemImages.$inferSelect;
export type StatusHistoryEntry = typeof itemStatusHistories.$inferSelect;
export type ItemStatus = (typeof itemStatusEnum.enumValues)[number];

// Extended types with relations
export type LostItemWithImages = LostItem & {
	images: ItemImage[];
};

export type LostItemWithImagesAndHistory = LostItemWithImages & {
	statusHistory: StatusHistoryEntry[];
};
