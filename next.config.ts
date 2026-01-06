import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    }
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pyoghzghwkpgiqbpbphp.supabase.co',
        pathname: '/**',
      },
    ]
  }
};

export default nextConfig;
