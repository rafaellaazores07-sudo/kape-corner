import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the frontend suite.
 *
 * The `@` and `declarations` aliases mirror `vite.config.js` so tests resolve
 * the same modules the app does. `jsdom` is also set in the `test` script; it
 * is repeated here so a direct `vitest` invocation behaves identically.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    // The sandbox's thread limits conflict with Vitest's default worker pool
    // (`minThreads`/`maxThreads`), so run in a single forked process instead.
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
