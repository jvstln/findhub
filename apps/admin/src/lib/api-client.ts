import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * Axios instance configured with base URL and default settings
 */
export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // Important for Better Auth session cookies
	timeout: 30000, // 30 second timeout
});

/**
 * Response interceptor for global error handling
 */
apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		// Log errors in development
		if (process.env.NODE_ENV === "development") {
			console.error("API Error:", {
				url: error.config?.url,
				method: error.config?.method,
				status: error.response?.status,
				data: error.response?.data,
			});
		}

		// Don't retry if offline
		if (!navigator.onLine) {
			return Promise.reject(error);
		}

		// Retry logic for network errors and 5xx errors
		const config = error.config as AxiosRequestConfig & { _retry?: number };
		if (!config || config._retry === undefined) {
			if (config) {
				config._retry = 0;
			}
		}

		const shouldRetry =
			config &&
			config._retry !== undefined &&
			config._retry < 2 &&
			(error.code === "ERR_NETWORK" ||
				error.code === "ECONNABORTED" ||
				(error.response?.status ?? 0) >= 500);

		if (shouldRetry && config) {
			config._retry = (config._retry || 0) + 1;

			// Exponential backoff: 1s, 2s
			const delay = 1000 * config._retry;
			await new Promise((resolve) => setTimeout(resolve, delay));

			return apiClient.request(config);
		}

		return Promise.reject(error);
	},
);

/**
 * API error type for consistent error handling
 */
export interface ApiError {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

/**
 * API success response type
 */
export interface ApiResponse<T> {
	success: true;
	data: T;
	message?: string;
}

/**
 * Validation error details from Zod
 */
export interface ValidationErrorDetails {
	field: string;
	message: string;
}

/**
 * Type guard to check if error is an API error
 */
export function isApiError(error: unknown): error is AxiosError<ApiError> {
	return (
		axios.isAxiosError(error) &&
		error.response?.data !== undefined &&
		typeof error.response.data === "object" &&
		error.response.data !== null &&
		"success" in error.response.data &&
		error.response.data.success === false
	);
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
	return (
		isApiError(error) && error.response?.data.error.code === "VALIDATION_ERROR"
	);
}

/**
 * Extract validation error details from API error
 */
export function getValidationErrors(
	error: unknown,
): ValidationErrorDetails[] | null {
	if (!isValidationError(error)) {
		return null;
	}

	const apiError = error as AxiosError<ApiError>;
	const details = apiError.response?.data.error.details;

	if (Array.isArray(details)) {
		return details.map((detail: { path: string[]; message: string }) => ({
			field: detail.path.join("."),
			message: detail.message,
		}));
	}

	return null;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
	// Check if offline
	if (!navigator.onLine) {
		return "You are offline. Please check your internet connection.";
	}

	// API error with message
	if (isApiError(error)) {
		const apiError = error.response?.data.error;

		// For validation errors, provide a more helpful message
		if (apiError?.code === "VALIDATION_ERROR") {
			const validationErrors = getValidationErrors(error);
			if (validationErrors && validationErrors.length > 0) {
				return `Validation error: ${validationErrors[0].message}`;
			}
			return "Please check your input and try again.";
		}

		return apiError?.message || "An error occurred";
	}

	// Network errors
	if (axios.isAxiosError(error)) {
		if (error.code === "ERR_NETWORK") {
			return "Network error. Please check your connection and try again.";
		}
		if (error.code === "ECONNABORTED") {
			return "Request timeout. Please try again.";
		}
		if (error.response?.status === 401) {
			return "You are not authorized. Please log in.";
		}
		if (error.response?.status === 403) {
			return "You don't have permission to perform this action.";
		}
		if (error.response?.status === 404) {
			return "The requested resource was not found.";
		}
		if (error.response?.status === 500) {
			return "Server error. Please try again later.";
		}
		return error.message || "Network error occurred";
	}

	// Generic errors
	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred";
}

/**
 * Format error for user display with actionable message
 */
export function formatErrorForUser(error: unknown): {
	title: string;
	message: string;
	canRetry: boolean;
} {
	const message = getErrorMessage(error);

	// Determine if error is retryable
	const canRetry =
		!navigator.onLine ||
		(axios.isAxiosError(error) &&
			(error.code === "ERR_NETWORK" ||
				error.code === "ECONNABORTED" ||
				(error.response?.status ?? 0) >= 500));

	// Determine title based on error type
	let title = "Error";
	if (!navigator.onLine) {
		title = "Offline";
	} else if (isValidationError(error)) {
		title = "Invalid Input";
	} else if (axios.isAxiosError(error)) {
		if (error.response?.status === 401 || error.response?.status === 403) {
			title = "Access Denied";
		} else if ((error.response?.status ?? 0) >= 500) {
			title = "Server Error";
		}
	}

	return { title, message, canRetry };
}

/**
 * Generic GET request
 */
export async function get<T>(
	url: string,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.get<ApiResponse<T>>(url, config);
	return response.data.data;
}

/**
 * Generic POST request
 */
export async function post<T>(
	url: string,
	data?: unknown,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.post<ApiResponse<T>>(url, data, config);
	return response.data.data;
}

/**
 * Generic PATCH request
 */
export async function patch<T>(
	url: string,
	data?: unknown,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
	return response.data.data;
}

/**
 * Generic DELETE request
 */
export async function del<T>(
	url: string,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.delete<ApiResponse<T>>(url, config);
	return response.data.data;
}

/**
 * POST request with FormData (for file uploads)
 */
export async function postFormData<T>(
	url: string,
	formData: FormData,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.post<ApiResponse<T>>(url, formData, {
		...config,
		headers: {
			...config?.headers,
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data.data;
}
