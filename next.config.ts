import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  allowedDevOrigins: [
    "10.0.0.158"
  ],
};

export default nextConfig;