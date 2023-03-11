import { defineConfig } from 'vite';
import Unocss from 'unocss/vite';
import {
  presetUno,
  presetAttributify,
  transformerCompileClass,
  transformerVariantGroup,
  transformerDirectives,
} from 'unocss';
import React from '@vitejs/plugin-react';
import LibTypes from 'vite-plugin-lib-types';
import { dependencies, peerDependencies } from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.tsx',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
    },
  },
  plugins: [
    React({ jsxRuntime: 'classic' }),
    LibTypes(),
    Unocss({
      presets: [presetUno(), presetAttributify()],
      transformers: [
        transformerCompileClass(),
        transformerVariantGroup(),
        transformerDirectives(),
      ],
    }),
  ],
});
