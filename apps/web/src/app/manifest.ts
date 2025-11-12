import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "FindHub - Lost & Found",
		short_name: "FindHub",
		description:
			"Campus lost and found management system. Search for lost items and reunite with your belongings.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#3b82f6",
		orientation: "portrait-primary",
		categories: ["education", "utilities"],
		icons: [
			{
				src: "/favicon/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/favicon/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/favicon/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
				purpose: "any",
			},
		],
	};
}
