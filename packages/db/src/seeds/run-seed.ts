#!/usr/bin/env bun
import { seedCategories } from "./categories.js";

const AVAILABLE_SEEDS = {
	categories: seedCategories,
	all: async () => {
		await seedCategories();
	},
} as const;

type SeedName = keyof typeof AVAILABLE_SEEDS;

async function runSeed(seedName: SeedName) {
	const seedFunction = AVAILABLE_SEEDS[seedName];

	if (!seedFunction) {
		console.error(`Unknown seed: ${seedName}`);
		console.error(
			`Available seeds: ${Object.keys(AVAILABLE_SEEDS).join(", ")}`,
		);
		process.exit(1);
	}

	try {
		console.log(`Running seed: ${seedName}`);
		await seedFunction();
		console.log(`Seed '${seedName}' completed successfully`);
	} catch (error) {
		console.error(`Seed '${seedName}' failed:`, error);
		process.exit(1);
	}
}

// Get seed name from command line arguments
const seedName = process.argv[2] as SeedName;

if (!seedName) {
	console.error("Please specify a seed to run:");
	console.error("Usage: bun run src/seeds/run-seed.ts <seed-name>");
	console.error(`Available seeds: ${Object.keys(AVAILABLE_SEEDS).join(", ")}`);
	process.exit(1);
}

runSeed(seedName);
