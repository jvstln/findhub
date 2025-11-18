import { type DefaultOptions, QueryClient } from "@tanstack/react-query";

/**
 * Default options for TanStack Query
 */
const queryConfig: DefaultOptions = {
	queries: {
		refetchOnWindowFocus: true,
		retry: (failureCount) => {
			if (!navigator.onLine) return false;
			return failureCount < 2;
		},
		staleTime: 30 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnReconnect: true,
		networkMode: "online",
	},
	mutations: {
		retry: (failureCount) => {
			if (!navigator.onLine) return false;
			return failureCount < 1;
		},
		networkMode: "online",
		onError: (error) => {
			if (process.env.NODE_ENV === "development") {
				console.error("Mutation error:", error);
			}
		},
	},
};

/**
 * Create a new QueryClient instance with default configuration
 */
export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: queryConfig,
	});
}

/**
 * Singleton QueryClient instance for client-side usage
 */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}

	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}

	return browserQueryClient;
}
