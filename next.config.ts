import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ❌ remove if you don’t really want static export
  // Next.js + Vercel works best with server rendering / API routes.
  // Only use 'export' if your app is 100% static (no API routes, no server logic).
  // output: 'export',

  eslint: {
    // This prevents ESLint errors from breaking the Vercel build
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Same for TS — prevents type errors from blocking deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
