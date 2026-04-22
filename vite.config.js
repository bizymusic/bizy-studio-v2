import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    // 强制补全 process.hrtime，防止 magenta 崩溃
    'process.hrtime': '(() => [0, 0])', 
    'global.process.hrtime': '(() => [0, 0])',
  }
});