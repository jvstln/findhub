"use client";

import { BaseProvider } from "@findhub/ui/components/base-provider";
import { AdminLayout } from "./admin-layout";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<BaseProvider>
			<AdminLayout>{children}</AdminLayout>
		</BaseProvider>
	);
}
