/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/asteria',
  assetPrefix: '/asteria',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: { typedRoutes: false },
}
module.exports = nextConfig
