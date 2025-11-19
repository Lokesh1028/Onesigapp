/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['logo.clearbit.com', 'assets.tryfinch.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.tryfinch.com',
      },
    ],
  },
  // Environment variables available to the browser
  env: {
    SITE_NAME: 'OneSig',
    SITE_DESCRIPTION: 'Curated stock intelligence newsletter with insider trading insights',
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  // Output configuration
  output: 'standalone',
  // Skip static optimization for pages that use client-side hooks
  experimental: {
    // This helps prevent static generation issues
  },
}

module.exports = nextConfig
