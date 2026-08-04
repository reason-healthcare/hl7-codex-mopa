import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@mopa/ui", "@mopa/logger"],
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
