import type { NextConfig } from "next";
import path from "path";

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

  // Webpack configuration for module resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  // Docker optimization
  experimental: {
    // Configuration for Docker builds
  },
};

export default nextConfig;
