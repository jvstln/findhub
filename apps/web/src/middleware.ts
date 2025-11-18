import { type NextRequest, NextResponse } from "next/server";

export default async function authMiddleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Only protect /admin routes (except /admin/login)
	const isAdminRoute = pathname.startsWith("/admin");
	const isAdminLoginRoute = pathname === "/admin/login";

	// Allow all non-admin routes and the admin login page
	if (!isAdminRoute || isAdminLoginRoute) {
		return NextResponse.next();
	}

	// Check authentication for protected admin routes
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
			// Redirect to admin login if not authenticated
			const loginUrl = new URL("/admin/login", request.url);
			loginUrl.searchParams.set("from", pathname);
			return NextResponse.redirect(loginUrl);
		}

		const session = await response.json();

		if (!session?.user) {
			// Redirect to admin login if no user in session
			const loginUrl = new URL("/admin/login", request.url);
			loginUrl.searchParams.set("from", pathname);
			return NextResponse.redirect(loginUrl);
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		// Redirect to admin login on error
		const loginUrl = new URL("/admin/login", request.url);
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*"],
};
