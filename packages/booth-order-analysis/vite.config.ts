import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: true
  },
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: './src/assets/icon.svg',
        namespace: 'yueby.booth',
        match: ['https://*.booth.pm/*'],
        name: {
          '': 'Booth Order Analysis',
          'zh-CN': 'Booth 订单分析'
        },
        description: {
          '': 'A userscript for analyzing Booth orders and sales data',
          'zh-CN': 'Booth 订单和销售数据分析工具，提供数据可视化和管理功能'
        },
        author: 'Yueby',
        version: '0.1.8',
        connect: [
          'raw.githubusercontent.com',
          'api.exchangerate-api.com',
          'manage.booth.pm'
        ],
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
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
