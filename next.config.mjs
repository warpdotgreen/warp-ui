/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace 'fs' with an empty module on the client-side
      config.resolve.fallback = { fs: false };
    }

    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/:path*/blsjs.wasm',
        destination: '/blsjs.wasm',
      },
    ]
  },
};

export default nextConfig;
