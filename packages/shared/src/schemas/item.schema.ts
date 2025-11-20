// Shared Zod validation schemas for lost items feature
import { z } from "zod";
import { securityQuestionsArraySchema } from "./security-questions.schema";

// Re-export security questions schemas for convenience
export * from "./security-questions.schema";

export const itemStatusSchema = z.enum([
	"unclaimed",
	"claimed",
	"returned",
	"archived",
]);

const imageSchema = z
	.file()
	.max(5 * 1024 * 1024, "Each image must be less than 5MB")
	.mime(
		["image/jpeg", "image/png", "image/webp"],
		"Images must be JPEG, PNG, or WebP format",
	);

export const createItemSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters").max(255),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(2000),
	categoryId: z
		.string()
		.min(1, "Category is required")
		.transform((val) => Number.parseInt(val, 10))
		.optional(),
	keywords: z
		.union([
			z.string().transform((val) => val.trim().split(/\s*,\s*/g)),
			z.array(z.string()),
		])
		.default([]),
	location: z
		.string()
		.min(3, "Location must be at least 3 characters")
		.max(255),
	dateFound: z.coerce.date(),
	images: z.union([
		imageSchema.transform((val) => [val]),
		z
			.array(imageSchema)
			.max(10, "Maximum 10 images allowed")
			.min(1, "At least one image is required"),
	]),
	status: itemStatusSchema.optional(),
	securityQuestions: z
		.union([
			securityQuestionsArraySchema,
			z.string().transform((val, ctx) => {
				try {
					const parsed = JSON.parse(val);
					if (!Array.isArray(parsed)) {
						ctx.issues.push({
							code: "custom",
							message: "Security questions must be an array",
							input: val,
						});
						return z.NEVER;
					}

					return parsed;
				} catch {
					ctx.issues.push({
						code: "custom",
						message: "Invalid JSON for security questions",
						input: val,
					});
					return z.NEVER;
				}
			}),
		])
		.optional(),
	hideLocation: z.union([z.boolean(), z.stringbool()]).default(false),
	hideDateFound: z.union([z.boolean(), z.stringbool()]).default(false),
});

export const updateItemSchema = z
	.object({
		...createItemSchema.shape,
		images: z.union([
			imageSchema.transform((val) => [val]).optional(),
			z.array(imageSchema).max(10, "Maximum 10 images allowed").optional(),
		]),
	})
	.partial();

export const searchFiltersSchema = z.object({
	query: z.string().optional(),
	categoryId: z.string().optional(),
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
