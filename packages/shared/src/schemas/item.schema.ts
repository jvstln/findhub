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
	images: z
		.array(
			z
				.file()
				.max(5 * 1024 * 1024, "Each image must be less than 5MB")
				.mime(
					["image/jpeg", "image/png", "image/webp"],
					"Images must be JPEG, PNG, or WebP format",
				),
		)
		.max(10, "Maximum 10 images allowed")
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

// Category schemas
export const createCategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.max(100, "Category name must be less than 100 characters"),
	description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdSchema = z.object({
	id: z.coerce.number().int().positive(),
});
// Image-specific schemas
export const imageUploadSchema = z.object({
	file: z
		.file()
		.max(5 * 1024 * 1024, "Image must be less than 5MB")
		.mime(
			["image/jpeg", "image/png", "image/webp"],
			"Image must be JPEG, PNG, or WebP format",
		),
	displayOrder: z.coerce.number().int().min(0).default(0),
});

export const imageUpdateSchema = z.object({
	displayOrder: z.coerce.number().int().min(0).optional(),
});

export const imageIdSchema = z.object({
	id: z.coerce.number().int().positive(),
});
