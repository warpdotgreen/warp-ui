/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace 'fs' with an empty module on the client-side
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/_next/static/chunks/app/blsjs.wasm',
        destination: '/blsjs.wasm',
      },
    ]
  },
};

export default nextConfig;
