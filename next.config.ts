/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Fixed configuration for Next.js 15+
  experimental: {
    // Remove this unrecognized key
    // serverExternalPackages: []
  }
};

export default nextConfig;
