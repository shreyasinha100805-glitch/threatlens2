import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/chat": "http://localhost:8080",
      "/threats": "http://localhost:8080",
      "/health": "http://localhost:8080",
      "/billing": "http://localhost:8080",
      "/waitlist": "http://localhost:8080",
      "/mcp": "http://localhost:8080",
      "/auth": "http://localhost:8080",
      "/entitlements": "http://localhost:8080",
    },
  },
});
