import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3001",
		trace: "on-first-retry",
	},

	projects: [
		{
			name: "web",
			use: {
				...devices["Desktop Chrome"],
				baseURL: "http://localhost:3001",
			},
			testMatch: /.*\/(public-flow|offline-functionality)\.spec\.ts/,
		},
		{
			name: "admin",
			use: {
				...devices["Desktop Chrome"],
				baseURL: "http://localhost:3002",
			},
			testMatch: /.*\/(admin-flow|status-workflow|file-upload)\.spec\.ts/,
		},
		{
			name: "api",
			use: {
				...devices["Desktop Chrome"],
				baseURL: "http://localhost:3000",
			},
			testMatch: /.*\/security-privacy-api\.spec\.ts/,
		},
		{
			name: "components",
			use: {
				...devices["Desktop Chrome"],
				baseURL: "http://localhost:3002",
			},
			testMatch: /.*\/component-tests\.spec\.ts/,
		},
	],

	webServer: [
		{
			command: "cd apps/server && bun run dev",
			url: "http://localhost:3000",
			reuseExistingServer: !process.env.CI,
			timeout: 120 * 1000,
		},
		{
			command: "cd apps/web && bun run dev",
			url: "http://localhost:3001",
			reuseExistingServer: !process.env.CI,
			timeout: 120 * 1000,
		},
		{
			command: "cd apps/admin && bun run dev",
			url: "http://localhost:3002",
			reuseExistingServer: !process.env.CI,
			timeout: 120 * 1000,
		},
	],
});
