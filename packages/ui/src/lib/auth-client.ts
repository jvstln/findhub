import type { auth } from "@findhub/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const AUTH_BASE_URL =
	process.env.NEXT_PUBLIC_SERVER_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	process.env.BETTER_AUTH_URL;

export const authClient = createAuthClient({
	baseURL: AUTH_BASE_URL,
	plugins: [inferAdditionalFields<typeof auth>()],
});

