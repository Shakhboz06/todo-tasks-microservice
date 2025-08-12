import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), tailwindcss()],
	server: {
		proxy: {
			// Auth service (3001)
			"^/api-auth": {
				target: "http://localhost:3001",
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/api-auth/, ""),
			},
			// Todo service (3002)
			"^/api-todos": {
				target: "http://localhost:3002",
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/api-todos/, ""),
			},
		},
	},
});
