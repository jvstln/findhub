import type { Context } from "hono";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Standard error response format
 */
interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

/**
 * Custom application error class for structured error handling
 */
export class AppError extends Error {
	constructor(
		public code: string,
		message: string,
		public statusCode = 500,
		public details?: unknown,
	) {
		super(message);
		this.name = "AppError";
	}
}

/**
 * Global error handling middleware for Hono
 * Handles Zod validation errors, custom AppErrors, and unexpected errors
 *
 * Usage:
 * ```typescript
 * import { errorHandler } from './middleware/error.middleware';
 * app.onError(errorHandler);
 * ```
 */

export function errorHandler(err: Error, c: Context) {
	console.error("Error occurred:", {
		name: err.name,
		message: err.message,
		stack: err.stack,
	});

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		const validationError = fromZodError(err, {
			prefix: "Validation failed",
			prefixSeparator: ": ",
			issueSeparator: "; ",
		});

		const response: ErrorResponse = {
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: validationError.message,
				details: err.issues,
			},
		};

		return c.json(response, 400);
	}

	// Handle custom application errors
	if (err instanceof AppError) {
		const response: ErrorResponse = {
			success: false,
			error: {
				code: err.code,
				message: err.message,
				details: err.details,
			},
		};

		return c.json(
			response,
			err.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
		);
	}

	// Handle unexpected errors
	const response: ErrorResponse = {
		success: false,
		error: {
			code: "INTERNAL_ERROR",
			message:
				process.env.NODE_ENV === "production"
					? "An unexpected error occurred"
					: err.message,
		},
	};

	return c.json(response, 500);
}
