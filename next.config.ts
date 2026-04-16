import type { NextConfig } from "next";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Standalone output for Docker only — native binaries (libsql) are not
  // traced correctly on local pnpm installs, so we skip it outside Docker.
  output: process.env.STANDALONE === "1" ? "standalone" : undefined,
  outputFileTracingRoot: path.join(__dirname),
  // Use webpack mode (required for next-pwa compatibility)
  turbopack: undefined,
};

export default withPWA(nextConfig);
