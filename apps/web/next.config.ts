import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
	dest: "public",
	cacheOnFrontEndNav: true,
	aggressiveFrontEndNavCaching: true,
	reloadOnOnline: true,
	disable: process.env.NODE_ENV === "development",
	workboxOptions: {
		disableDevLogs: true,
		runtimeCaching: [
			{
				urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
				handler: "CacheFirst",
				options: {
					cacheName: "google-fonts-webfonts",
					expiration: {
						maxEntries: 4,
						maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
					},
				},
			},
			{
				urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
				handler: "StaleWhileRevalidate",
				options: {
					cacheName: "google-fonts-stylesheets",
					expiration: {
						maxEntries: 4,
						maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
					},
				},
			},
			{
				// API items endpoint - NetworkFirst for fresh data with offline fallback
				urlPattern: ({ url }) => {
					return (
						url.pathname.startsWith("/api/items") &&
						(url.hostname === "localhost" ||
							url.hostname === process.env.NEXT_PUBLIC_API_HOSTNAME ||
							url.origin === process.env.NEXT_PUBLIC_SERVER_URL)
					);
				},
				handler: "NetworkFirst",
				options: {
					cacheName: "api-items",
					networkTimeoutSeconds: 10,
					expiration: {
						maxEntries: 100,
						maxAgeSeconds: 30 * 60, // 30 minutes
					},
					cacheableResponse: {
						statuses: [0, 200],
					},
					// Background sync for failed requests
					backgroundSync: {
						name: "api-items-queue",
						options: {
							maxRetentionTime: 24 * 60, // Retry for up to 24 hours
						},
					},
				},
			},
			{
				// Item images from local uploads and Supabase Storage - CacheFirst for performance
				urlPattern: ({ url }) => {
					const isLocalUpload =
						url.pathname.startsWith("/uploads/items/") &&
						/\.(?:jpg|jpeg|png|webp|gif)$/i.test(url.pathname);
					const isSupabaseStorage =
						url.hostname.includes("supabase.co") &&
						url.pathname.includes("/storage/v1/object/public/lost-items/") &&
						/\.(?:jpg|jpeg|png|webp|gif)$/i.test(url.pathname);
					return isLocalUpload || isSupabaseStorage;
				},
				handler: "CacheFirst",
				options: {
					cacheName: "item-images",
					expiration: {
						maxEntries: 150,
						maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
					},
					cacheableResponse: {
						statuses: [0, 200],
					},
				},
			},
			{
				// General images
				urlPattern: /\.(?:jpg|jpeg|png|webp|gif|svg|ico)$/i,
				handler: "CacheFirst",
				options: {
					cacheName: "images",
					expiration: {
						maxEntries: 100,
						maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
					},
				},
			},
			{
				// Static resources (JS, CSS)
				urlPattern: /\.(?:js|css)$/i,
				handler: "StaleWhileRevalidate",
				options: {
					cacheName: "static-resources",
					expiration: {
						maxEntries: 60,
						maxAgeSeconds: 24 * 60 * 60, // 1 day
					},
				},
			},
			{
				// Next.js data files
				urlPattern: /\/_next\/data\/.+\.json$/i,
				handler: "NetworkFirst",
				options: {
					cacheName: "next-data",
					networkTimeoutSeconds: 10,
					expiration: {
						maxEntries: 50,
						maxAgeSeconds: 5 * 60, // 5 minutes
					},
				},
			},
		],
	},
});

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	turbopack: {},
	images: {
		formats: ["image/webp", "image/avif"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "3000",
				pathname: "/uploads/**",
			},
			{
				protocol: "https",
				hostname: "*.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
};

export default withPWA(nextConfig);
