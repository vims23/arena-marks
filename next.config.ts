import type { NextConfig } from 'next';
const config: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [{
      source: '/api/arena/:path*',
      destination: `${process.env.ARENA_API_URL || 'http://127.0.0.1:8000'}/:path*`,
    }];
  },
};
export default config;
