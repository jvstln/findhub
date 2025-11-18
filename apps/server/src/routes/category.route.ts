import {
	categoryIdSchema,
	createCategorySchema,
	updateCategorySchema,
} from "@findhub/shared/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import { categoryService } from "../services/category.service";

const categories = new Hono();

/**
 * GET /api/categories
 * Public endpoint - Get all categories
 */
categories.get("/", async (c) => {
	try {
		const result = await categoryService.getAllCategories();

		return c.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error fetching categories:", error);
		return c.json(
			{
				success: false,
				error: {
					code: "FETCH_ERROR",
					message: "Failed to fetch categories",
				},
			},
			500,
		);
	}
});

/**
 * GET /api/categories/:id
 * Public endpoint - Get single category by ID
 */
categories.get("/:id", zValidator("param", categoryIdSchema), async (c) => {
	try {
		const { id } = c.req.valid("param");
		const category = await categoryService.getCategoryById(id);

		if (!category) {
			return c.json(
				{
					success: false,
					error: {
						code: "NOT_FOUND",
						message: "Category not found",
					},
				},
				404,
			);
		}

		return c.json({
			success: true,
			data: category,
		});
	} catch (error) {
		console.error("Error fetching category:", error);
		return c.json(
			{
				success: false,
				error: {
					code: "FETCH_ERROR",
					message: "Failed to fetch category",
				},
			},
			500,
		);
	}
});

// ============================================================================
// PROTECTED ROUTES - Require authentication
// ============================================================================

/**
 * POST /api/categories
 * Protected endpoint - Create a new category
 * Requires authentication
 */
categories.post(
	"/",
	authMiddleware,
	zValidator("json", createCategorySchema),
	async (c) => {
		try {
			const input = c.req.valid("json");

			const category = await categoryService.createCategory(input);

			return c.json(
				{
					success: true,
					data: category,
					message: "Category created successfully",
				},
				201,
			);
		} catch (error) {
			console.error("Error creating category:", error);
			return c.json(
				{
					success: false,
					error: {
						code: "CREATE_ERROR",
						message:
							error instanceof Error
								? error.message
								: "Failed to create category",
					},
				},
				500,
			);
		}
	},
);

/**
 * PATCH /api/categories/:id
 * Protected endpoint - Update an existing category
 * Requires authentication
 */
categories.patch(
	"/:id",
	authMiddleware,
	zValidator("param", categoryIdSchema),
	zValidator("json", updateCategorySchema),
	async (c) => {
		try {
			const { id } = c.req.valid("param");
			const input = c.req.valid("json");

			// Check if category exists
			const existingCategory = await categoryService.getCategoryById(id);
			if (!existingCategory) {
				return c.json(
					{
						success: false,
						error: {
							code: "NOT_FOUND",
							message: "Category not found",
						},
					},
					404,
				);
			}

			const category = await categoryService.updateCategory(id, input);

			return c.json({
				success: true,
				data: category,
				message: "Category updated successfully",
			});
		} catch (error) {
			console.error("Error updating category:", error);
			return c.json(
				{
					success: false,
					error: {
						code: "UPDATE_ERROR",
						message:
							error instanceof Error
								? error.message
								: "Failed to update category",
					},
				},
				500,
			);
		}
	},
);

/**
 * DELETE /api/categories/:id
 * Protected endpoint - Delete a category
 * Requires authentication
 */
categories.delete(
	"/:id",
	authMiddleware,
	zValidator("param", categoryIdSchema),
	async (c) => {
		try {
			const { id } = c.req.valid("param");

			// Check if category exists
			const existingCategory = await categoryService.getCategoryById(id);
			if (!existingCategory) {
				return c.json(
					{
						success: false,
						error: {
							code: "NOT_FOUND",
							message: "Category not found",
						},
					},
					404,
				);
			}

			// Check if category is in use
			const inUse = await categoryService.isCategoryInUse(id);
			if (inUse) {
				return c.json(
					{
						success: false,
						error: {
							code: "CATEGORY_IN_USE",
							message:
								"Cannot delete category that is assigned to items. Please reassign or delete those items first.",
						},
					},
					400,
				);
			}

			const success = await categoryService.deleteCategory(id);

			if (!success) {
				return c.json(
					{
						success: false,
						error: {
							code: "DELETE_ERROR",
							message: "Failed to delete category",
						},
					},
					500,
				);
			}

			return c.json({
				success: true,
				message: "Category deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting category:", error);
			return c.json(
				{
					success: false,
					error: {
						code: "DELETE_ERROR",
						message:
							error instanceof Error
								? error.message
								: "Failed to delete category",
					},
				},
				500,
			);
		}
	},
);

export default categories;
