import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/**/*.ts", "src/**/*.tsx"],
	dts: true,
	sourcemap: true,
});

