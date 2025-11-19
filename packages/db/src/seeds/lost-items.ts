import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: "../../apps/server/.env" });

const DUMMY_LOST_ITEMS = [
	{
		name: "iPhone 14 Pro",
		description:
			"Black iPhone 14 Pro with a cracked screen protector. Has a blue case with a popsocket.",
		categoryName: "Electronics",
		keywords: ["phone", "iphone", "apple", "mobile"],
		location: "Library - 2nd Floor Study Area",
		dateFound: new Date("2024-11-15T14:30:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Blue Denim Jacket",
		description:
			"Light blue denim jacket, size medium. Has a small tear on the left sleeve.",
		categoryName: "Clothing",
		keywords: ["jacket", "denim", "blue", "clothing"],
		location: "Student Center - Cafeteria",
		dateFound: new Date("2024-11-16T12:15:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Silver Watch",
		description:
			"Silver wristwatch with a leather strap. Brand appears to be Fossil.",
		categoryName: "Accessories",
		keywords: ["watch", "silver", "fossil", "jewelry"],
		location: "Gym - Locker Room",
		dateFound: new Date("2024-11-14T18:45:00Z"),
		status: "claimed",
		hideLocation: true,
		hideDateFound: false,
	},
	{
		name: "Calculus Textbook",
		description:
			"Calculus: Early Transcendentals, 8th Edition. Has highlighting and notes inside.",
		categoryName: "Books",
		keywords: ["textbook", "calculus", "math", "book"],
		location: "Mathematics Building - Room 301",
		dateFound: new Date("2024-11-13T10:20:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Car Keys with Toyota Fob",
		description:
			"Set of car keys with a Toyota key fob and a blue keychain that says 'Best Dad'.",
		categoryName: "Keys",
		keywords: ["keys", "toyota", "car", "keychain"],
		location: "Parking Lot B",
		dateFound: new Date("2024-11-17T08:00:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: true,
	},
	{
		name: "Student ID Card",
		description:
			"Student ID card. Name and photo visible. Found near the entrance.",
		categoryName: "Cards",
		keywords: ["id", "card", "student", "identification"],
		location: "Main Building - Entrance",
		dateFound: new Date("2024-11-12T16:30:00Z"),
		status: "returned",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Black Backpack",
		description:
			"Black JanSport backpack with a laptop compartment. Contains notebooks and pens.",
		categoryName: "Bags",
		keywords: ["backpack", "bag", "jansport", "black"],
		location: "Computer Lab - Building C",
		dateFound: new Date("2024-11-11T13:45:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Wireless Earbuds",
		description:
			"White wireless earbuds in a charging case. Looks like AirPods Pro.",
		categoryName: "Electronics",
		keywords: ["earbuds", "airpods", "wireless", "headphones"],
		location: "Library - 1st Floor",
		dateFound: new Date("2024-11-18T11:00:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Red Umbrella",
		description: "Large red umbrella with a wooden handle. Slightly worn.",
		categoryName: "Other",
		keywords: ["umbrella", "red", "rain"],
		location: "Student Center - Main Lobby",
		dateFound: new Date("2024-11-10T09:30:00Z"),
		status: "archived",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Prescription Glasses",
		description:
			"Black-framed prescription glasses in a brown case. Found on a bench.",
		categoryName: "Accessories",
		keywords: ["glasses", "eyeglasses", "prescription", "spectacles"],
		location: "Campus Quad - Near Fountain",
		dateFound: new Date("2024-11-09T15:20:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: false,
	},
	{
		name: "Leather Wallet",
		description:
			"Brown leather wallet with multiple card slots. Contains some cash and cards.",
		categoryName: "Accessories",
		keywords: ["wallet", "leather", "brown", "money"],
		location: "Dining Hall",
		dateFound: new Date("2024-11-08T19:00:00Z"),
		status: "claimed",
		hideLocation: true,
		hideDateFound: true,
	},
	{
		name: "Water Bottle",
		description:
			"Stainless steel water bottle, blue color. Has stickers from various bands.",
		categoryName: "Other",
		keywords: ["water", "bottle", "hydro", "flask"],
		location: "Recreation Center",
		dateFound: new Date("2024-11-07T14:15:00Z"),
		status: "unclaimed",
		hideLocation: false,
		hideDateFound: false,
	},
];

export async function seedLostItems() {
	const connectionString = process.env.DATABASE_URL || "";
	const client = postgres(connectionString);

	try {
		console.log("Seeding lost items...");

		// Check if lost items already exist
		const existingItems = await client`
			SELECT * FROM lost_items
		`;

		if (existingItems.length > 0) {
			console.log(
				`Lost items already exist (${existingItems.length} found). Skipping seed.`,
			);
			return;
		}

		// Get the first admin user to use as creator
		const adminUsers = await client`
			SELECT id FROM users LIMIT 1
		`;

		if (adminUsers.length === 0) {
			console.error(
				"No users found in database. Please create a user first before seeding lost items.",
			);
			throw new Error("No users available for seeding");
		}

		const adminUserId = adminUsers[0].id;

		// Get category IDs
		const categories = await client`
			SELECT id, name FROM item_categories
		`;

		if (categories.length === 0) {
			console.error(
				"No categories found. Please run category seed first: bun run seed:categories",
			);
			throw new Error("Categories must be seeded before lost items");
		}

		const categoryMap = new Map(categories.map((cat) => [cat.name, cat.id]));

		// Insert lost items
		let insertedCount = 0;
		for (const item of DUMMY_LOST_ITEMS) {
			const categoryId = categoryMap.get(item.categoryName);

			if (!categoryId) {
				console.warn(
					`Category '${item.categoryName}' not found, skipping item: ${item.name}`,
				);
				continue;
			}

			await client`
				INSERT INTO lost_items (
					name, 
					description, 
					category_id, 
					keywords, 
					location, 
					date_found, 
					status, 
					hide_location, 
					hide_date_found, 
					created_by_id,
					created_at,
					updated_at
				)
				VALUES (
					${item.name},
					${item.description},
					${categoryId},
					${item.keywords},
					${item.location},
					${item.dateFound},
					${item.status},
					${item.hideLocation},
					${item.hideDateFound},
					${adminUserId},
					NOW(),
					NOW()
				)
			`;
			insertedCount++;
		}

		console.log(`Successfully seeded ${insertedCount} lost items`);
	} catch (error) {
		console.error("Error seeding lost items:", error);
		throw error;
	} finally {
		await client.end();
	}
}

// Allow running this script directly
if (import.meta.main) {
	seedLostItems()
		.then(() => {
			console.log("Lost items seed completed successfully");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Lost items seed failed:", error);
			process.exit(1);
		});
}
