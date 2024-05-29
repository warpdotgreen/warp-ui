/** @type {import('next').NextConfig} */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const CopyPlugin = require('copy-webpack-plugin');

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace 'fs' with an empty module on the client-side
      config.resolve.fallback = { fs: false };

      config.plugins.push(
        new CopyPlugin({
          patterns: [
            { from: 'public/blsjs.wasm', to: 'static/chunks' }
          ],
        })
      );
    }

    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/:path*/blsjs.wasm',
        destination: '/blsjs.wasm',
      }
    ]
  },
};

export default nextConfig;
