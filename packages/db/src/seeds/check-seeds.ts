#!/usr/bin/env bun
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: "../../apps/server/.env" });

async function checkSeeds() {
	const connectionString = process.env.DATABASE_URL || "";
	const client = postgres(connectionString);

	try {
		console.log("Checking seed status...\n");

		// Check categories
		const categories = await client`
			SELECT COUNT(*) as count FROM item_categories
		`;
		const categoryCount = Number(categories[0]?.count || 0);

		console.log(`📁 Categories: ${categoryCount} records`);
		if (categoryCount === 0) {
			console.log("   ⚠️  No categories found. Run: bun run seed:categories");
		} else {
			console.log("   ✅ Categories seeded");
		}

		console.log("\n" + "=".repeat(50));

		if (categoryCount > 0) {
			console.log("✅ All seeds appear to be run");
		} else {
			console.log("⚠️  Some seeds may need to be run");
			console.log("Run 'bun run seed:all' to seed everything");
		}
	} catch (error) {
		console.error("Error checking seeds:", error);
		throw error;
	} finally {
		await client.end();
	}
}

if (import.meta.main) {
	checkSeeds()
		.then(() => {
			process.exit(0);
		})
		.catch((error) => {
			console.error("Check failed:", error);
			process.exit(1);
		});
}
