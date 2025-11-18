import { type NextRequest, NextResponse } from "next/server";

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
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
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
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
