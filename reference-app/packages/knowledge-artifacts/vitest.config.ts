import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "knowledge-artifacts",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
