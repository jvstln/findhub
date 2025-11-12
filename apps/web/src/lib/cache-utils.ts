/**
 * Utility functions for managing service worker cache
 * These functions help with cache inspection and management
 */

/**
 * Get all cache names
 */
export async function getCacheNames(): Promise<string[]> {
	if (!("caches" in window)) {
		return [];
	}
	return await caches.keys();
}

/**
 * Check if a specific cache exists
 */
export async function cacheExists(cacheName: string): Promise<boolean> {
	const names = await getCacheNames();
	return names.includes(cacheName);
}

/**
 * Get the size of a cache (number of entries)
 */
export async function getCacheSize(cacheName: string): Promise<number> {
	if (!("caches" in window)) {
		return 0;
	}

	const cache = await caches.open(cacheName);
	const keys = await cache.keys();
	return keys.length;
}

/**
 * Get all entries in a cache
 */
export async function getCacheEntries(
	cacheName: string,
): Promise<Array<{ url: string; timestamp: number }>> {
	if (!("caches" in window)) {
		return [];
	}

	const cache = await caches.open(cacheName);
	const requests = await cache.keys();

	const entries = await Promise.all(
		requests.map(async (request) => {
			const response = await cache.match(request);
			const dateHeader = response?.headers.get("date");
			const timestamp = dateHeader
				? new Date(dateHeader).getTime()
				: Date.now();

			return {
				url: request.url,
				timestamp,
			};
		}),
	);

	return entries;
}

/**
 * Clear a specific cache
 */
export async function clearCache(cacheName: string): Promise<boolean> {
	if (!("caches" in window)) {
		return false;
	}
	return await caches.delete(cacheName);
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
	if (!("caches" in window)) {
		return;
	}

	const names = await caches.keys();
	await Promise.all(names.map((name) => caches.delete(name)));
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
	totalCaches: number;
	caches: Array<{ name: string; size: number }>;
}> {
	if (!("caches" in window)) {
		return { totalCaches: 0, caches: [] };
	}

	const names = await getCacheNames();
	const caches = await Promise.all(
		names.map(async (name) => ({
			name,
			size: await getCacheSize(name),
		})),
	);

	return {
		totalCaches: names.length,
		caches,
	};
}

/**
 * Check if service worker is registered
 */
export async function isServiceWorkerRegistered(): Promise<boolean> {
	if (!("serviceWorker" in navigator)) {
		return false;
	}

	const registration = await navigator.serviceWorker.getRegistration();
	return !!registration;
}

/**
 * Get service worker registration details
 */
export async function getServiceWorkerInfo(): Promise<{
	registered: boolean;
	scope?: string;
	state?: string;
}> {
	if (!("serviceWorker" in navigator)) {
		return { registered: false };
	}

	const registration = await navigator.serviceWorker.getRegistration();

	if (!registration) {
		return { registered: false };
	}

	const worker =
		registration.active || registration.waiting || registration.installing;

	return {
		registered: true,
		scope: registration.scope,
		state: worker?.state,
	};
}

/**
 * Unregister service worker (useful for debugging)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
	if (!("serviceWorker" in navigator)) {
		return false;
	}

	const registration = await navigator.serviceWorker.getRegistration();
	if (registration) {
		return await registration.unregister();
	}

	return false;
}

/**
 * Force service worker to update
 */
export async function updateServiceWorker(): Promise<void> {
	if (!("serviceWorker" in navigator)) {
		return;
	}

	const registration = await navigator.serviceWorker.getRegistration();
	if (registration) {
		await registration.update();
	}
}

/**
 * Check if a URL is cached
 */
export async function isUrlCached(url: string): Promise<boolean> {
	if (!("caches" in window)) {
		return false;
	}

	const names = await getCacheNames();

	for (const name of names) {
		const cache = await caches.open(name);
		const response = await cache.match(url);
		if (response) {
			return true;
		}
	}

	return false;
}

/**
 * Prefetch and cache a URL
 */
export async function prefetchUrl(
	url: string,
	cacheName: string,
): Promise<boolean> {
	if (!("caches" in window)) {
		return false;
	}

	try {
		const cache = await caches.open(cacheName);
		const response = await fetch(url);

		if (response.ok) {
			await cache.put(url, response);
			return true;
		}

		return false;
	} catch (error) {
		console.error("Error prefetching URL:", error);
		return false;
	}
}
