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
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ]
  },
  reactStrictMode: false,
};

export default nextConfig;
