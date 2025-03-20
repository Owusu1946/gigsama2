/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Fix for the dynamic route parameter usage
  experimental: {
    // Using proper configuration for external packages
    serverExternalPackages: []
  }
};

export default nextConfig;
