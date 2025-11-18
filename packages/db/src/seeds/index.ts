import { seedCategories } from "./categories.js";

/**
 * Run all seeds in order
 */
export async function runAllSeeds() {
	console.log("Starting database seeding...");

	try {
		await seedCategories();

		console.log("All seeds completed successfully!");
	} catch (error) {
		console.error("Seeding failed:", error);
		throw error;
	}
}

// Allow running this script directly to seed everything
if (import.meta.main) {
	runAllSeeds()
		.then(() => {
			console.log("Database seeding completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Database seeding failed:", error);
			process.exit(1);
		});
}
