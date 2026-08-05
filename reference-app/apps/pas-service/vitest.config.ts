import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "pas-service",
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
