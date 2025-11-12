// Shared Zod validation schemas for lost items feature
import { z } from "zod";

export const itemStatusSchema = z.enum([
	"unclaimed",
	"claimed",
	"returned",
	"archived",
]);

export const createItemSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters").max(255),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(2000),
	category: z.string().min(1, "Category is required"),
	keywords: z.string().optional(),
	location: z
		.string()
		.min(3, "Location must be at least 3 characters")
		.max(255),
	dateFound: z.coerce.date(),
	image: z
		.file()
		.max(5 * 1024 * 1024, "Image must be less than 5MB")
		.mime(
			["image/jpeg", "image/png", "image/webp"],
			"Image must be JPEG, PNG, or WebP format",
		)
		.optional(),
	status: itemStatusSchema.optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const searchFiltersSchema = z.object({
	keyword: z.string().optional(),
	category: z.string().optional(),
	location: z.string().optional(),
	status: itemStatusSchema.optional(),
	dateFrom: z.coerce.date().optional(),
	dateTo: z.coerce.date().optional(),
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const statusUpdateSchema = z.object({
	status: itemStatusSchema,
	notes: z
		.string()
		.max(500, "Notes must be less than 500 characters")
		.optional(),
});

export const itemIdSchema = z.object({
	id: z.coerce.number().int().positive(),
});
