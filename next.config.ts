import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 typescript : {
      ignoreBuildErrors:true,
    },eslint:{
      ignoreDuringBuilds:true,
    },
  images: {
    domains: [
      'res.cloudinary.com',
      'g96xkr7zoc.ufs.sh',
      'utfs.io',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
};

export default nextConfig;
