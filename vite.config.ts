import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Multi-page: the main editor app + the isolated preview iframe document.
    rollupOptions: {
      input: {
        main: new URL("./index.html", import.meta.url).pathname,
        preview: new URL("./preview.html", import.meta.url).pathname,
      },
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["test/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
  },
});
