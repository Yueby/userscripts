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
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'yueby.character-replace',
        match: ['*://*/*'],
        name: {
          '': 'Character Replace',
          'zh-CN': '字符替换'
        },
        description: {
          '': 'A userscript for replacing characters on web pages',
          'zh-CN': '网页字符替换脚本'
        },
        author: 'Yueby',
        version: '0.1.1',
        grant: ['GM_registerMenuCommand']
      }
    }),
  ],
});
