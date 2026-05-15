import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        input: {
          injected: 'src/contentScript/injected.ts',
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    plugins: [crx({ manifest })],
    legacy: {
      skipWebSocketTokenCheck: true,
    },
    // dev server 不能用，加载扩展完毕后会重新加载，循环往复
    // server: {
    //   port: 5173,
    //   strictPort: true,
    //   hmr: false, // 关键：禁用 HMR
    //   cors: true,
    // },
  }
})
