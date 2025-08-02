/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Preserve the same aliases from your Vite config
  images: {
    domains: [],
  },
};

export default nextConfig;
