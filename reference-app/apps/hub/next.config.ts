import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@ogca/ui", "@ogca/logger"],
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
