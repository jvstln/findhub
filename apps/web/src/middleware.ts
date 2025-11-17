import { type NextRequest, NextResponse } from "next/server";

export default async function authMiddleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Public routes that don't require authentication
	const publicRoutes = [
		"/",
		"/login",
		"/signup",
		"/search",
		"/items",
		"/about",
	];
	const isPublicRoute =
		publicRoutes.some(
			(route) => pathname === route || pathname.startsWith(`${route}/`),
		) ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.includes(".");

	if (isPublicRoute) {
		return NextResponse.next();
	}

	// Check authentication for protected routes (dashboard)
	try {
		const response = await fetch(
			`${request.nextUrl.origin}/api/auth/get-session`,
			{
				headers: {
					cookie: request.headers.get("cookie") || "",
				},
			},
		);

		if (!response.ok) {
			// Redirect to login if not authenticated
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("from", pathname);
			return NextResponse.redirect(loginUrl);
		}

		const session = await response.json();

		if (!session?.user) {
			// Redirect to login if no user in session
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("from", pathname);
			return NextResponse.redirect(loginUrl);
		}
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
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
