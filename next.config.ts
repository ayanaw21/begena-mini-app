import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 typescript : {
      ignoreBuildErrors:true,
    },eslint:{
      ignoreDuringBuilds:true,
    },
  /* config options here */ images: {
    domains: [
      'g96xkr7zoc.ufs.sh', // Your UploadThing domain
      'utfs.io', // UploadThing's main domain
      'uploadthing.com', // UploadThing's main domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ufs.sh', // Allow all UploadThing subdomains
      },
      {
        protocol: 'https',
        hostname: 'utfs.io', // UploadThing's CDN
      },
    ],
  },
};

export default nextConfig;
