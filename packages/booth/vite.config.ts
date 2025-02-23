import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: true
  },
  plugins: [
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
          'zh-CN': '增强 Booth 网站的功能体验，包括变体序号、标签管理、自动翻译等功能'
        },
        author: 'Yueby',
        version: '0.1.1',
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
