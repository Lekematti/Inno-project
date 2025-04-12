import type { NextConfig } from 'next'

module.exports = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AZURE_STORAGE_ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
    AZURE_STORAGE_ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}
const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
