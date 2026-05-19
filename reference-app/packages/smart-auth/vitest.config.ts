import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { name: "smart-auth", environment: "node", include: ["src/**/*.test.ts"] },
});
