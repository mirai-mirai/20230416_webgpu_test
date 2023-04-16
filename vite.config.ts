import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/20230416_webgpu_test/', // github pagesの変な仕様（ルートが１つ上）に対応する
  assetsInclude: ["**/*.bin", "**/*.json"],// うまくモデルを読み込めない問題
  plugins: [vue()],
  build: {
    outDir: 'docs', // ビルド出力先を変更
    rollupOptions: {
      output: {
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js', // JSをルートに出力
        entryFileNames: '[name]-[hash].js', // JSをルートに出力
      },
    },
  },
})