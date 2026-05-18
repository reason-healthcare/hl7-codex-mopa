import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "cql-engine",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
