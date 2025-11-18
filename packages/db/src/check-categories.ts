import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: "../../apps/server/.env" });

async function checkCategories() {
	const connectionString = process.env.DATABASE_URL || "";
	const client = postgres(connectionString);

	try {
		const categories = await client`
			SELECT * FROM item_categories ORDER BY id
		`;

		console.log(`Found ${categories.length} categories:`);
		for (const cat of categories) {
			console.log(`  ${cat.id}. ${cat.name} - ${cat.description}`);
		}
	} catch (error) {
		console.error("Error checking categories:", error);
	} finally {
		await client.end();
	}
}

checkCategories();
