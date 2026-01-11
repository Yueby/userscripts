import { resolve } from 'path';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true
      },
      mangle: {
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    }
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
