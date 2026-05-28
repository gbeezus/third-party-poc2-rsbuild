import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'thirdparty',
      // Default filename works ('static/mf-exposed/remoteEntry.js') but a
      // root-relative path is cleaner for the host config.
      filename: 'remoteEntry.js',
      exposes: {
        './Tool': './src/components/Tool.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
    }),
  ],
  source: {
    entry: { index: './src/main.tsx' },
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
