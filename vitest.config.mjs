import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    env: {
      VITE_API_BASE_URL: "http://localhost:8000",
      VITE_ADMIN_APP_URL: "http://localhost:3000",
      VITE_LINK_APP_URL: "http://localhost:3000/link",
      VITE_OFOG_URL: "https://ofog.himtibinus.or.id",
      VITE_REGISTRATION_APP_URL: "http://localhost:3001",
      VITE_LOCAL_LINK_BASE_PATH: "/link",
    },
  },
});
