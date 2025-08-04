import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    NEXT_PUBLIC_ANALYSIS_SERVICE_URL: process.env.NEXT_PUBLIC_ANALYSIS_SERVICE_URL || 'http://localhost:8000',
  },

  // Image optimization
  images: {
    unoptimized: true,
  },

  // Docker optimization
  experimental: {
    // Configuration for Docker builds
  },
};

export default nextConfig;
