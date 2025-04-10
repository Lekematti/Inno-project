import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AZURE_STORAGE_ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
    AZURE_STORAGE_ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  },
  // Enable serving static files from the gen_comp folder
  async rewrites() {
    return [
      {
        source: '/gen_comp/:path*',
        destination: '/api/static/:path*',
      },
      // Add this fallback rule for direct /images/ requests
      {
        source: '/images/:filename',
        destination: '/api/images/:filename',
      },
    ];
  },
};

export default nextConfig;
