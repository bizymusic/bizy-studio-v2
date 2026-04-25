import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      // 确保在构建时也包含这些 polyfills
      include: ['buffer', 'process', 'util', 'stream'], 
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  build: {
    commonjsOptions: {
      // 强制转换那些混合了 ESM 和 CommonJS 的第三方库
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // 确保这些 Node 模块不会被意外剔除
      external: [],
    }
  }
});