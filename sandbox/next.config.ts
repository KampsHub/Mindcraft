import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Resolve @/ imports to the main project's src/
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "../src");
    return config;
  },
  transpilePackages: [],
};

export default nextConfig;
