/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace 'fs' with an empty module on the client-side
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};

export default nextConfig;
