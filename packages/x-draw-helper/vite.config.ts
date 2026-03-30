import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: false
  },
  plugins: [
    tailwindcss(),
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        namespace: 'yueby.x-draw-helper',
        match: ['https://x.com/*', 'https://twitter.com/*'],
        name: {
          '': 'X Draw Helper',
          'zh-CN': 'X(推特) 抽奖助手',
          'ja': 'X 抽選ツール'
        },
        description: {
          '': 'A userscript for conducting draws on X (Twitter) posts',
          'zh-CN': 'X(推特) 推文抽奖助手，支持转发/点赞用户筛选、随机抽奖、结果通知',
          'ja': 'X(Twitter)の投稿で抽選を行うためのユーザースクリプト'
        },
        author: 'Yueby',
        version: '0.2.0',
        grant: ['GM_openInTab', 'GM_getValue', 'GM_setValue', 'GM_listValues', 'GM_deleteValue', 'GM_xmlhttpRequest', 'unsafeWindow'],
        connect: ['raw.githubusercontent.com'],
        'run-at': 'document-start'
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js')
        }
      }
    }),
  ],
});
