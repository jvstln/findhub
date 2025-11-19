"use client";

import { CheckCircle2, WifiOff, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useItems } from "@/features/items/hooks/use-items";
import { useOnlineStatus } from "@findhub/ui/hooks";

/**
 * Offline functionality test page
 * This page helps verify that offline features are working correctly
 */
export default function OfflineTestPage() {
	const { isOnline, wasOffline } = useOnlineStatus();
	const [testResults, setTestResults] = useState<
		Array<{ test: string; passed: boolean; message: string }>
	>([]);

	// Test 1: Fetch items while online
	const { data: itemsData, isLoading, error, refetch } = useItems();

	const runTests = async () => {
		const results: Array<{ test: string; passed: boolean; message: string }> =
			[];

		// Test 1: Check online status detection
		results.push({
			test: "Online Status Detection",
			passed: typeof navigator.onLine === "boolean",
			message: `Navigator.onLine is ${navigator.onLine ? "online" : "offline"}`,
		});

		// Test 2: Check service worker registration
		if ("serviceWorker" in navigator) {
			try {
				const registration = await navigator.serviceWorker.getRegistration();
				results.push({
					test: "Service Worker Registration",
					passed: !!registration,
					message: registration
						? `Service worker registered at ${registration.scope}`
						: "Service worker not registered (expected in development)",
				});
			} catch (err) {
				results.push({
					test: "Service Worker Registration",
					passed: false,
					message: `Error checking service worker: ${err}`,
				});
			}
		} else {
			results.push({
				test: "Service Worker Support",
				passed: false,
				message: "Service workers not supported in this browser",
			});
		}

		// Test 3: Check cache API availability
		results.push({
			test: "Cache API Support",
			passed: "caches" in window,
			message:
				"caches" in window ? "Cache API available" : "Cache API not available",
		});

		// Test 4: Check if data is cached
		if ("caches" in window) {
			try {
				const cacheNames = await caches.keys();
				const hasApiCache = cacheNames.some((name) =>
					name.includes("api-items"),
				);
				results.push({
					test: "API Cache Exists",
					passed: hasApiCache,
					message: hasApiCache
						? "API items cache found"
						: "API items cache not found (fetch data first)",
				});
			} catch (err) {
				results.push({
					test: "API Cache Check",
					passed: false,
					message: `Error checking cache: ${err}`,
				});
			}
		}

		// Test 5: Check React Query cache
		results.push({
			test: "React Query Data",
			passed: !!itemsData,
			message: itemsData
				? `${itemsData.data.length} items in cache`
				: "No data in React Query cache",
		});

		setTestResults(results);
	};

	return (
		<div className="container mx-auto max-w-4xl py-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Offline Functionality Test
						{isOnline ? (
							<CheckCircle2 className="h-5 w-5 text-green-500" />
						) : (
							<WifiOff className="h-5 w-5 text-yellow-500" />
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Current Status */}
					<div className="space-y-2">
						<h3 className="font-semibold text-lg">Current Status</h3>
						<div className="space-y-1">
							<p>
								<strong>Online:</strong>{" "}
								{isOnline ? (
									<span className="text-green-600">Yes</span>
								) : (
									<span className="text-yellow-600">No</span>
								)}
							</p>
							<p>
								<strong>Was Offline:</strong>{" "}
								{wasOffline ? (
									<span className="text-blue-600">
										Yes (recently reconnected)
									</span>
								) : (
									<span className="text-gray-600">No</span>
								)}
							</p>
							<p>
								<strong>Items Loaded:</strong>{" "}
								{isLoading ? (
									<span className="text-gray-600">Loading...</span>
								) : itemsData ? (
									<span className="text-green-600">
										{itemsData.data.length} items
									</span>
								) : error ? (
									<span className="text-red-600">Error loading</span>
								) : (
									<span className="text-gray-600">Not loaded</span>
								)}
							</p>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<Button onClick={runTests}>Run Offline Tests</Button>
						<Button onClick={() => refetch()} variant="outline">
							Refetch Items
						</Button>
					</div>

					{/* Test Results */}
					{testResults.length > 0 && (
						<div className="space-y-2">
							<h3 className="font-semibold text-lg">Test Results</h3>
							<div className="space-y-2">
								{testResults.map((result) => (
									<div
										key={result.test}
										className="flex items-start gap-2 rounded-lg border p-3"
									>
										{result.passed ? (
											<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
										) : (
											<XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
										)}
										<div className="flex-1">
											<p className="font-medium">{result.test}</p>
											<p className="text-muted-foreground text-sm">
												{result.message}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Instructions */}
					<div className="space-y-2 rounded-lg border bg-muted/50 p-4">
						<h3 className="font-semibold text-lg">Testing Instructions</h3>
						<ol className="list-inside list-decimal space-y-1 text-sm">
							<li>Click "Run Offline Tests" to check offline capabilities</li>
							<li>Click "Refetch Items" to load data into cache</li>
							<li>Open DevTools → Network tab → Set throttling to "Offline"</li>
							<li>Observe the offline indicator appears</li>
							<li>Try navigating to /search - cached data should still work</li>
							<li>Set network back to "Online"</li>
							<li>Observe the "Back online" message and data sync</li>
						</ol>
					</div>

					{/* PWA Info */}
					<div className="space-y-2 rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
						<h3 className="font-semibold text-lg">PWA Configuration</h3>
						<ul className="list-inside list-disc space-y-1 text-sm">
							<li>Service Worker: Enabled in production builds</li>
							<li>
								Cache Strategy: NetworkFirst for API, CacheFirst for images
							</li>
							<li>Cache Duration: 30 minutes for API, 30 days for images</li>
							<li>Background Sync: Enabled for failed API requests</li>
							<li>Offline Indicator: Automatically shown when offline</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
