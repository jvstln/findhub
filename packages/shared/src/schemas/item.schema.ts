// Shared Zod validation schemas for lost items feature
import { z } from "zod";

export const itemStatusSchema = z.enum([
  "unclaimed",
  "claimed",
  "returned",
  "archived",
]);

export const itemCategorySchema = z.enum([
  "electronics",
  "clothing",
  "accessories",
  "books",
  "keys",
  "cards",
  "bags",
  "other",
]);

export const createItemSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  category: itemCategorySchema,
  keywords: z.string().optional(),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(255),
  dateFound: z.coerce.date(),
  image: z.instanceof(File).optional(),
});

export const updateItemSchema = createItemSchema.partial().extend({
  status: itemStatusSchema.optional(),
});

export const searchFiltersSchema = z.object({
  keyword: z.string().optional(),
  category: itemCategorySchema.optional(),
  location: z.string().optional(),
  status: itemStatusSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const statusUpdateSchema = z.object({
  status: itemStatusSchema,
  notes: z.string().optional(),
});

export const itemIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
