import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import postgres from "postgres";

dotenv.config({ path: "../../apps/server/.env" });

const INITIAL_CATEGORIES = [
	{
		name: "Electronics",
		description: "Electronic devices and accessories",
	},
	{
		name: "Clothing",
		description: "Clothing items and apparel",
	},
	{
		name: "Accessories",
		description: "Personal accessories and jewelry",
	},
	{
		name: "Books",
		description: "Books, notebooks, and reading materials",
	},
	{
		name: "Keys",
		description: "Keys and keychains",
	},
	{
		name: "Cards",
		description: "ID cards, credit cards, and passes",
	},
	{
		name: "Bags",
		description: "Bags, backpacks, and luggage",
	},
	{
		name: "Other",
		description: "Other miscellaneous items",
	},
];

export async function seedCategories() {
	const connectionString = process.env.DATABASE_URL || "";
	const client = postgres(connectionString);

	try {
		console.log("Seeding categories...");

		// Check if categories already exist
		const existingCategories = await client`
			SELECT * FROM item_categories
		`;

		if (existingCategories.length > 0) {
			console.log(
				`Categories already exist (${existingCategories.length} found). Skipping seed.`,
			);
			return;
		}

		// Insert initial categories
		for (const category of INITIAL_CATEGORIES) {
			await client`
				INSERT INTO item_categories (name, description)
				VALUES (${category.name}, ${category.description})
			`;
		}

		console.log(`Successfully seeded ${INITIAL_CATEGORIES.length} categories`);
	} catch (error) {
		console.error("Error seeding categories:", error);
		throw error;
	} finally {
		await client.end();
	}
}

// Allow running this script directly
if (import.meta.main) {
	seedCategories()
		.then(() => {
			console.log("Categories seed completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Categories seed failed:", error);
			process.exit(1);
		});
}
