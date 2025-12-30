import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    }
  },

  images: {
    remotePatterns: [
      new URL('https://pyoghzghwkpgiqbpbphp.supabase.co/**'),
  ]
  }
};

export default nextConfig;
