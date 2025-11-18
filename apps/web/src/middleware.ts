import { NextResponse } from "next/server";

// Middleware is no longer needed as admin routes have been moved to the admin app
export default async function middleware() {
	return NextResponse.next();
}

export const config = {
	matcher: [],
};
