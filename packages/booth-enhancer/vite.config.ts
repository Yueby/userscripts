import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: false
  },
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: './src/assets/icon.png',
        namespace: 'yueby.booth',
        match: ['https://manage.booth.pm/items*'],
        name: {
          '': 'Booth ItemPage Enhancer',
          'zh-CN': 'Booth 商品页面增强'
        },
        description: {
          '': 'A userscript for enhancing Booth item page experience',
          'zh-CN': '增强 Booth 商品页面的功能体验，包括变体序号、标签管理、自动翻译等功能'
        },
        author: 'Yueby',
        version: '0.1.18',
        connect: ['raw.githubusercontent.com'],
        grant: [
          'GM_xmlhttpRequest',
          'GM_setClipboard',
          'GM_notification',
          'GM_registerMenuCommand',
          'GM_getValue',
          'GM_setValue'
        ]
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js')
        }
      }
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
});
