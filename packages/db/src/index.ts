import dotenv from "dotenv";

dotenv.config({
	path: "../../apps/server/.env",
});

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./schema/auth";
import * as itemsSchema from "./schema/items";

const connectionString = process.env.DATABASE_URL || "";

// Combine all schemas
const schema = {
	...authSchema,
	...itemsSchema,
};

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle({ client, schema });

// Export schemas
export * from "./schema/auth";
export * from "./schema/items";
