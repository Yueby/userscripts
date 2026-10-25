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
          '': 'X (Twitter) draw helper for retweet, like, quote and reply participants, with cross-post winner history',
          'zh-CN': 'X(推特) 推文抽奖助手，支持转发/点赞/引用/评论参与者抽取，并跨帖记录中奖历史',
          'ja': 'X(Twitter)の投稿でRT・いいね・引用・返信の参加者を抽選し、投稿をまたぐ当選履歴に対応'
        },
        author: 'Yueby',
        version: '0.3.0',
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
