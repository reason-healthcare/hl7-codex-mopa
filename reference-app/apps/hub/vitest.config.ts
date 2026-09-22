import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "hub",
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
