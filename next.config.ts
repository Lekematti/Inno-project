import type { NextConfig } from "next";

module.exports = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
}
const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
