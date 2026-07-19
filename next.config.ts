import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local automated browser (127.0.0.1) to load dev resources.
  // Dev-only; has no effect on production builds.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
