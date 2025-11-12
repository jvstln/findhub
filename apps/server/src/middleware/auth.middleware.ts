import { auth } from "@findhub/auth";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

/**
 * Authentication middleware that validates Better Auth sessions
 * and extracts user information for protected routes.
 *
 * Usage:
 * ```typescript
 * app.use('/api/protected/*', authMiddleware);
 * ```
 */
export async function authMiddleware(c: Context, next: Next) {
	try {
		// Get the session token from cookies
		const sessionToken =
			getCookie(c, "better-auth.session_token") ||
			c.req.header("Authorization")?.replace("Bearer ", "");

		if (!sessionToken) {
			return c.json(
				{
					success: false,
					error: {
						code: "UNAUTHORIZED",
						message: "Authentication required",
					},
				},
				401,
			);
		}

		// Validate the session using Better Auth
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session || !session.user) {
			return c.json(
				{
					success: false,
					error: {
						code: "UNAUTHORIZED",
						message: "Invalid or expired session",
					},
				},
				401,
			);
		}

		// Attach user information to context for use in route handlers
		c.set("user", session.user);
		c.set("session", session.session);

		await next();
	} catch (error) {
		console.error("Authentication error:", error);
		return c.json(
			{
				success: false,
				error: {
					code: "AUTHENTICATION_ERROR",
					message: "Failed to authenticate request",
				},
			},
			401,
		);
	}
}

/**
 * Type helper to extract authenticated user from context
 */
export function getAuthUser(c: Context) {
	return c.get("user");
}

/**
 * Type helper to extract session from context
 */
export function getAuthSession(c: Context) {
	return c.get("session");
}
