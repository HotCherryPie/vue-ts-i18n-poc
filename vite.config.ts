import * as path from 'node:path';

import { defineConfig } from 'vite';

import { peerDependencies } from './package.json';

const OUT_DIR = './dist';

const src = (subpath: string) => path.resolve(import.meta.dirname, subpath);

export default defineConfig({
  root: import.meta.dirname,

  plugins: [
    // dts({
    //   entryRoot: 'src',
    //   tsconfigPath: src('./tsconfig.lib.json'),
    // }),
  ],

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    emptyOutDir: true,
    outDir: OUT_DIR,
    target: 'esnext',
    minify: false,

    lib: {
      formats: ['es'],
      entry: {
        index: src('./lib'),
      },
    },

    rollupOptions: {
      external: Object.keys(peerDependencies).map(
        // NOTE: maybe regexp is unnecessary
        (v) => new RegExp(`^${v}\\/?.*`),
      ),
    },
  },
});
