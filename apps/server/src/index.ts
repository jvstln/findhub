import "dotenv/config";
import { auth } from "@findhub/auth";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middleware/error.middleware";
import adminItems from "./routes/admin-item.route";
import categories from "./routes/category.route";
import items from "./routes/item.route";

const corsOriginRegexp = (process.env.CORS_ORIGIN || "")
	?.split(/,\s*/)
	.filter(Boolean)
	.map(
		(origin) =>
			new RegExp(`^${origin.replace(/['"]/g, "").replace(/\*/g, ".*")}$`),
	);

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin) =>
			corsOriginRegexp.some((regexp) => regexp.test(origin)) ? origin : null,
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Serve static files from public directory
app.use("/uploads/*", serveStatic({ root: "./public" }));

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// API routes
app.route("/api/categories", categories);
app.route("/api/items", items);
app.route("/api/admin/items", adminItems);

app.get("/", (c) => {
	return c.text("OK");
});

// Global error handler - must be registered last
app.onError(errorHandler);

export default app;
