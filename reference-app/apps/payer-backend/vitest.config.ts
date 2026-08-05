import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "payer-backend",
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
