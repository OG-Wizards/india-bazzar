import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // 🔥 Required for static export
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint errors during production builds
  },
};
