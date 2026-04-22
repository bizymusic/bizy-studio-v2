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
    // 注意：这里必须用 JSON.stringify 或者带引号的字符串包裹代码片段
    'process.hrtime': 'function() { return [0, 0]; }', 
    'global.process.hrtime': 'function() { return [0, 0]; }',
  }
});