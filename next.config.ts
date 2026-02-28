import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Skip ESLint on Vercel build
  },
  typescript: {
    ignoreBuildErrors: false,  // Keep TypeScript checks
  },
};

export default nextConfig;
