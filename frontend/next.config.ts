import type { NextConfig } from "next";

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(",") || [];

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedDevOrigins,
  transpilePackages: ["lucide-react"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
