import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnpluginIcons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';

import { prefetch } from './prefetch-plugin';
import path from 'path'
import fs from 'fs'

const assetsDir = '';
const outputDefaults = {
  // remove hashes from filenames
  entryFileNames: `${assetsDir}[name].js`,
  chunkFileNames: `${assetsDir}[name].js`,
  // TODO move icons to icons/
  assetFileNames: `${assetsDir}[name].[ext]`,
}

export default defineConfig({
  root: "src/svelte",
  base: "./", // relative paths in html
  plugins: [
    svelte(),
    prefetch(),

    UnpluginIcons({ autoInstall: true, compiler: 'svelte' }),

    // service worker is used in src/svelte/components/Desktop/SystemUpdate.svelte
    VitePWA({
      includeAssets: [
        'robots.txt',
        'app-icons/finder/32.png',
        'cover-image.png',
        'cursors/(normal|link|text|help)-select.svg',
        '**/*.mp3',
        '**/*.webp',
        'assets/*.webp',
      ],
      manifest: {
        name: 'Mac OS Monterey Svelte Web',
        short_name: 'macOS Svelte',
        theme_color: '#ffffff',
        description: 'Mac OS Monterey Web written in Svelte',
        icons: [
          {
            src: 'app-icons/finder/128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'app-icons/finder/192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'app-icons/finder/256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'app-icons/finder/512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'app-icons/finder/512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    imagetools({}),
  ],
  resolve: {
    alias: {
      '$src': path.resolve('./src/svelte'),

      // https://github.com/jvilk/BrowserFS
      'fs': 'browserfs/dist/shims/fs.js',
      'buffer': 'browserfs/dist/shims/buffer.js',
      'path': 'browserfs/dist/shims/path.js',
      'processGlobal': 'browserfs/dist/shims/process.js',
      'bufferGlobal': 'browserfs/dist/shims/bufferGlobal.js',
      'bfsGlobal': require.resolve('browserfs'),

    },
  },
  build: {
    outDir: path.resolve('./docs'),
    emptyOutDir: true, // fix: outDir is not inside project root
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        ...outputDefaults,
        manualChunks(id) {
          // bundle dependencies manually
          // TODO do this automatically
          // see also https://github.com/sanyuan0704/vite-plugin-chunk-split/issues/18
          /*
          if (
            id.includes('/node_modules/@codemirror/') ||
            id.includes('/node_modules/style-mod/') ||
            id.includes('/node_modules/w3c-keyname/') ||
            false
          ) {
            return 'codemirror';
          }
          if (
            id.includes('/node_modules/@lezer/') ||
            false
          ) {
            return 'lezer';
          }
          console.log("id", id)
          if (id.includes('/node_modules/')) {
            return 'vendor';
          }
          */
          const nodeModulesFolder = "node_modules/";
          //const nodeModulesFolder = ".npm/";
          //const nodeModulesFolder = "lib/";
          console.log("id", id)
          // simple: bundle each module in a separate file
          if (id.includes('/node_modules/.pnpm/')) {
            // example: /tmp/asdf/node_modules/.pnpm/@codemirror+view@6.6.0/node_modules/@codemirror/view/dist/index.js
            var m = id.match(/\/node_modules\/\.pnpm\/([^/]+)\//);
            if (m && m[1]) {
              // example: @codemirror+view@6.6.0
              // vite will convert "+" to "_"
              return nodeModulesFolder + m[1];
            }
            return nodeModulesFolder + "noname";
          }
          if (id.includes('/node_modules/')) {
            // example: /tmp/asdf/node_modules/@codemirror/view/dist/index.js
            var m = id.match(/^.*?\/node_modules\/(@[^/]+\/[^/]+|[^/]+)\//);
            if (m && m[1]) {
              // example: @codemirror/view
              // vite will convert "+" to "_"
              var name = m[1].replace("/", "+")
              // get version
              var pkgFile = m + "package.json"
              if (fs.existsSync(pkgFile)) {
                var pkg = fs.readFileSync(pkgFile, "utf8");
                if (pkg.version) {
                  name += "@" + pkg.version;
                }
              }
              return nodeModulesFolder + name;
            }
            return nodeModulesFolder + "noname";
          }
        },
      }
    },
  },
  worker: {
    rollupOptions: {
      output: {
        ...outputDefaults,
      }
    },
  },
  clearScreen: false,
});
