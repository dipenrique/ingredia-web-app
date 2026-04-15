import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  
  // Allow images served from the Nykaa CDN to be used via next/image.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images-static.nykaa.com' },
      { protocol: 'https', hostname: '*.nykaa.com' },
      { protocol: 'https', hostname: '*.nykaacdn.com' },
    ],
  },

  // Security headers applied to every route.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
