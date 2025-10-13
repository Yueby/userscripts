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
        namespace: 'yueby.aboutcg',
        match: ['https://www.aboutcg.org/play*'],
        name: {
          '': 'AboutCG Auto Video',
          'zh-CN': 'AboutCG 视频自动播放'
        },
        description: {
          '': 'A userscript for auto-playing videos on AboutCG',
          'zh-CN': 'AboutCG 网站视频自动播放脚本'
        },
        author: 'Yueby',
        version: '0.1.0',
        grant: []
      }
    }),
  ],
});
