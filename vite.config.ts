import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	base: "/bitcoin-cycles/",
	plugins: [
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	server: {
		proxy: {
			"/api/coingecko": {
				target: "https://api.coingecko.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/coingecko/, ""),
			},
		},
	},
	build: {
		minify: "esbuild",
		cssMinify: true,
		sourcemap: false, // Disable source maps in production for smaller bundle
	},
});
