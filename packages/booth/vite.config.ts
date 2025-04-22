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
        icon: 'https://raw.githubusercontent.com/Yueby/userscripts/refs/heads/main/packages/booth/src/assets/icon.svg',
        namespace: 'yueby.booth',
        match: ['https://*.booth.pm/*'],
        name: {
          '': 'Booth Enhancer',
          'zh-CN': 'Booth 网站功能增强'
        },
        description: {
          '': 'A userscript for enhancing Booth experience',
          'zh-CN': '增强 Booth 网站的功能体验，包括变体序号、标签管理、自动翻译、销量统计等功能'
        },
        author: 'Yueby',
        version: '0.1.5',
        connect: [
          'raw.githubusercontent.com',
          'manage.booth.pm'
        ],
        grant: [
          'GM_xmlhttpRequest',
          'GM_setClipboard',
          'GM_notification',
          'GM_registerMenuCommand'
        ],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
          papaparse: cdn.jsdelivr('Papa', 'papaparse.min.js'),
          'element-plus': cdn.jsdelivr('ElementPlus', 'dist/index.full.min.js'),
          '@element-plus/icons-vue': cdn.jsdelivr('ElementPlusIconsVue', 'dist/index.iife.min.js'),
          'echarts': cdn.jsdelivr('echarts', 'dist/echarts.min.js')
        },
        externalResource: {
          'element-plus/dist/index.css': cdn.jsdelivr()
        }
      }
    }),
  ],
});
