import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental features that might cause issues on Vercel
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Enable standalone output for better performance
  // output: 'standalone', // Uncomment if needed for Docker/custom hosting
};

export default nextConfig;
