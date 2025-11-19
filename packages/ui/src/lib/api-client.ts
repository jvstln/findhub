import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

const API_BASE_URL =
	process.env.NEXT_PUBLIC_SERVER_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:3000";

/**
 * Shared Axios client configured for the FindHub frontend applications.
 */
export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
	timeout: 30000,
});

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (process.env.NODE_ENV === "development") {
			console.error("API Error:", {
				url: error.config?.url,
				method: error.config?.method,
				status: error.response?.status,
				data: error.response?.data,
			});
		}

		if (!navigator.onLine) {
			return Promise.reject(error);
		}

		const config = error.config as AxiosRequestConfig & { _retry?: number };
		if (config && config._retry === undefined) {
			config._retry = 0;
		}

		const shouldRetry =
			config &&
			(config._retry ?? 0) < 2 &&
			(error.code === "ERR_NETWORK" ||
				error.code === "ECONNABORTED" ||
				(error.response?.status ?? 0) >= 500);

		if (shouldRetry && config) {
			config._retry = (config._retry || 0) + 1;
			const delay = 1000 * config._retry;
			await new Promise((resolve) => setTimeout(resolve, delay));

			return apiClient.request(config);
		}

		return Promise.reject(error);
	},
);

export interface ApiError {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

export interface ApiResponse<T> {
	success: true;
	data: T;
	message?: string;
}

export interface ValidationErrorDetails {
	field: string;
	message: string;
}

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

export function isValidationError(error: unknown): boolean {
	return (
		isApiError(error) && error.response?.data.error.code === "VALIDATION_ERROR"
	);
}

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

export function getErrorMessage(error: unknown): string {
	if (!navigator.onLine) {
		return "You are offline. Please check your internet connection.";
	}

	if (isApiError(error)) {
		const apiError = error.response?.data.error;

		if (apiError?.code === "VALIDATION_ERROR") {
			const validationErrors = getValidationErrors(error);
			if (validationErrors && validationErrors.length > 0) {
				return `Validation error: ${validationErrors[0].message}`;
			}
			return "Please check your input and try again.";
		}

		return apiError?.message || "An error occurred";
	}

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

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred";
}

export function formatErrorForUser(error: unknown): {
	title: string;
	message: string;
	canRetry: boolean;
} {
	const message = getErrorMessage(error);

	const canRetry =
		!navigator.onLine ||
		(axios.isAxiosError(error) &&
			(error.code === "ERR_NETWORK" ||
				error.code === "ECONNABORTED" ||
				(error.response?.status ?? 0) >= 500));

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

export async function get<T>(
	url: string,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.get<ApiResponse<T>>(url, config);
	return response.data.data;
}

export async function post<T>(
	url: string,
	data?: unknown,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.post<ApiResponse<T>>(url, data, config);
	return response.data.data;
}

export async function patch<T>(
	url: string,
	data?: unknown,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
	return response.data.data;
}

export async function del<T>(
	url: string,
	config?: AxiosRequestConfig,
): Promise<T> {
	const response = await apiClient.delete<ApiResponse<T>>(url, config);
	return response.data.data;
}

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

