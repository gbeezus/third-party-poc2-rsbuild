import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

// In production we deploy to a fixed URL; federation chunks must be
// fully-qualified so the host resolves them against THIS domain, not its
// own. PUBLIC_ASSET_PREFIX is set in render.yaml for production builds;
// locally it defaults to '/' which works for same-origin dev.
const ASSET_PREFIX = process.env.PUBLIC_ASSET_PREFIX || '/';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'thirdparty',
      filename: 'remoteEntry.js',
      exposes: {
        './Tool': './src/components/Tool.tsx',
      },
      shared: {
        // eager: true ensures React is bundled with the main entry chunk
        // and loads synchronously. Without it, the remote's own standalone
        // view (and any host that doesn't pre-init shares) throws
        // loadShareSync errors.
        react: { singleton: true, requiredVersion: false, eager: true },
        'react-dom': { singleton: true, requiredVersion: false, eager: true },
      },
    }),
  ],
  source: {
    entry: { index: './src/main.tsx' },
  },
  output: {
    assetPrefix: ASSET_PREFIX,
  },
  server: {
    port: 3011,
    // CORS: the host on :3010 fetches remoteEntry.js and chunks
    // cross-origin via <script> tags. Without this, the browser refuses to
    // evaluate the response.
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  },
  html: {
    title: 'third-party AI tool (POC 2 remote, rsbuild)',
  },
});
