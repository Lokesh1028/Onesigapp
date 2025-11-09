/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Environment variables available to the browser
  env: {
    SITE_NAME: 'OneSig',
    SITE_DESCRIPTION: 'Curated stock intelligence newsletter with insider trading insights',
  },
}

module.exports = nextConfig
