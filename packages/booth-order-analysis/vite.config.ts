import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

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
		vue(),
		monkey({
			entry: 'src/main.ts',
			userscript: {
				icon: './src/assets/icon.svg',
				namespace: 'yueby.booth',
				match: ['https://manage.booth.pm/orders*'],
				name: {
					'': 'Booth Order Analysis',
					'zh-CN': 'Booth 订单分析'
				},
				description: {
					'': 'A userscript for analyzing Booth orders and sales data',
					'zh-CN': 'Booth 订单和销售数据分析工具，提供数据可视化和管理功能'
				},
				author: 'Yueby',
				version: '0.1.15',
				connect: ['raw.githubusercontent.com', 'api.exchangerate-api.com', 'manage.booth.pm'],
				grant: ['GM_xmlhttpRequest', 'GM_setClipboard', 'GM_notification', 'GM_registerMenuCommand', 'GM_getValue', 'GM_setValue']
			},
			build: {
				externalGlobals: {
					vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js')
				}
			}
		})
	]
});
