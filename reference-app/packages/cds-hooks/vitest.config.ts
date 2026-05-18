import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { name: "cds-hooks", environment: "node", include: ["src/**/*.test.ts"] },
});
