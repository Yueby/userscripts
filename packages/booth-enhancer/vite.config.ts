import { resolve } from 'path';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: false
  },
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: './src/assets/icon.png',
        namespace: 'yueby.booth',
        match: ['https://*.booth.pm/*'],
        name: {
          '': 'Booth ItemPage Enhancer',
          'zh-CN': 'Booth 商品页面增强'
        },
        description: {
          '': 'A userscript for enhancing Booth item page experience',
          'zh-CN': '增强 Booth 商品页面的功能体验，包括变体序号、标签管理、自动翻译等功能'
        },
        author: 'Yueby',
        version: '0.1.9',
        connect: ['raw.githubusercontent.com'],
        grant: [
          'GM_xmlhttpRequest',
          'GM_setClipboard',
          'GM_notification',
          'GM_registerMenuCommand'
        ]
      }
    }),
  ],
});
