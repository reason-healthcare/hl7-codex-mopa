import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  transpilePackages: ["@reasonhealth/fhir-zod"],
};

export default nextConfig;
