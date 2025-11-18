import { type NextRequest, NextResponse } from "next/server";
import { authClient } from "./lib/auth-client";

export default async function authMiddleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Public routes that don't require authentication
	const isPublicRoute = ["/login", "/signup"].includes(pathname);

	// Allow public routes
	if (isPublicRoute) {
		return NextResponse.next();
	}

	// Check authentication for all other routes
	try {
		const session = await authClient.getSession(undefined, {
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		});

		if (session.error || !session.data?.user) throw new Error("Unauthorized");
	} catch (error) {
		console.error("Auth middleware error:", error);
		// Redirect to login on error
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
