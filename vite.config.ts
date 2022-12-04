import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from 'path'

export default defineConfig({
  plugins: [
    svelte(),
  ],
  resolve: {
    alias: {
      '$src': path.resolve('./src')
    },
  },
  build: {
    //minify: 'terser',
    minify: false,
  },
  clearScreen: false,
});
