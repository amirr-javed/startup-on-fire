import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    host: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "convex/**/*.test.ts"],
    pool: "threads",
    maxWorkers: 2,
    testTimeout: 15_000,
  },
});
