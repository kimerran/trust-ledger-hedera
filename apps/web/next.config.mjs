/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@trustledger/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
