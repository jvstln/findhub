import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import postgres from "postgres";

dotenv.config({ path: "../../apps/server/.env" });

async function checkTables() {
	const connectionString = process.env.DATABASE_URL || "";
	console.log(
		"Using connection:",
		connectionString.replace(/:[^:@]+@/, ":****@"),
	);

	const client = postgres(connectionString);

	try {
		const result = await client`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public'
			ORDER BY table_name;
		`;

		console.log("Tables in database:");
		for (const row of result) {
			console.log(`  - ${row.table_name}`);
		}
	} catch (error) {
		console.error("Error checking tables:", error);
	} finally {
		await client.end();
	}
}

checkTables();
