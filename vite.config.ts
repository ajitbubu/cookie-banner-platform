import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: served from a subpath on GitHub Pages (https://<user>.github.io/cookie-banner-platform/)
// in production, but root ("/") in dev so `npm run dev` stays at localhost:5173/.
// The preview iframe src uses import.meta.env.BASE_URL so it resolves under either.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/cookie-banner-platform/" : "/",
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
}));
