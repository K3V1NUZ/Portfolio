import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home folder makes Next guess the wrong root
  turbopack: { root: process.cwd() },
};

export default nextConfig;
