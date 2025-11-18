"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ItemsPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to dashboard which has the items table
		router.replace("/dashboard");
	}, [router]);

	return null;
}
