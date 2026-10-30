import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig(() => {
  const isWebOrCapacitor = process.env.BUILD_TARGET === 'web' || process.env.CAPACITOR === 'true';

  return {
    plugins: [
      react(),
      {
        name: 'copy-preload-cjs',
        closeBundle() {
          try {
            const fs = require('fs');
            const path = require('path');
            fs.copyFileSync(
              path.resolve(__dirname, 'electron/preload.cjs'),
              path.resolve(__dirname, 'dist-electron/preload.cjs')
            );
          } catch (e) {
            // ignore if not running in node cjs
          }
        },
      },
      ...(!isWebOrCapacitor
        ? [
            electron([
              {
                entry: 'electron/main.ts',
                vite: {
                  build: {
                    outDir: 'dist-electron',
                    rollupOptions: {
                      external: ['electron'],
                    },
                  },
                },
              },
              {
                entry: 'electron/preload.ts',
                onstart(args) {
                  args.reload();
                },
                vite: {
                  build: {
                    outDir: 'dist-electron',
                    rollupOptions: {
                      external: ['electron'],
                      output: {
                        format: 'cjs',
                        entryFileNames: 'preload.cjs',
                        inlineDynamicImports: true,
                      },
                    },
                  },
                },
              },
            ]),
            renderer(),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
