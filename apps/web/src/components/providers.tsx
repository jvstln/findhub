"use client";

import { BaseProvider } from "@findhub/ui/components/base-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return <BaseProvider>{children}</BaseProvider>;
}
