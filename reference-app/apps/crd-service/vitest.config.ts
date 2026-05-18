import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "crd-service",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
