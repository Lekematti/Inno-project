import type { NextConfig } from 'next'

module.exports = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AZURE_STORAGE_ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
    AZURE_STORAGE_ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY,
  },
}
const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
