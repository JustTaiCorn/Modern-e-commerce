import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@apps/shared'],
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'pos.nvncdn.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/address-kit/:path*',
        destination: 'https://production.cas.so/address-kit/:path*',
      },
    ];
  },
};

export default nextConfig;
