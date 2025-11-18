import dotenv from "dotenv";

dotenv.config({
	path: "../../apps/server/.env",
});

// import { drizzle } from "drizzle-orm/node-postgres"; // For nodejs

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

// Database instance for server-side use only
// export const db = drizzle(connectionString);

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle({ client });

// Export schemas
export * from "./schema/auth";
export * from "./schema/items";
