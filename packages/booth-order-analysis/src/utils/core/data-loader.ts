import type { Order } from '../../types/order';
import { OrderManager } from '../booth/order-manager';
import { CSVParser } from './csv-parser';
import { logger } from './logger';
import { SessionManager } from './session-manager';

// 数据加载器
export class DataLoader {
	private static instance: DataLoader;
	private orders: Order[] = [];
	private isLoading = false;
	private lastLoadTime: Date | null = null;

	private constructor() {}

	static getInstance(): DataLoader {
		if (!DataLoader.instance) {
			DataLoader.instance = new DataLoader();
		}
		return DataLoader.instance;
	}

	// 获取订单数据
	getOrders(): Order[] {
		return this.orders;
	}

	// 检查是否有数据
	hasData(): boolean {
		return this.orders.length > 0;
	}

	// 检查是否正在加载
	isCurrentlyLoading(): boolean {
		return this.isLoading;
	}

	// 获取最后加载时间
	getLastLoadTime(): Date | null {
		return this.lastLoadTime;
	}

	// 通过下载流加载CSV数据
	async loadOrdersFromCSV(): Promise<{ success: boolean; data?: Order[]; error?: string }> {
		if (this.isLoading) {
			return { success: false, error: '正在加载中，请稍候...' };
		}

		this.isLoading = true;

		try {
			// 使用 GM_xmlhttpRequest 下载CSV文件
			const csvData = await this.downloadCSV();

			if (!csvData.success) {
				this.isLoading = false;
				return { success: false, error: csvData.error };
			}

			// 解析CSV数据
			const parseResult = CSVParser.parse(csvData.data || '');

			if (parseResult.success && parseResult.data) {
				this.orders = parseResult.data;
				this.lastLoadTime = new Date();

				logger.info(`加载 ${this.orders.length} 条订单数据`);

				// 数据加载完成后，统一处理所有商品的变体数据
				this.preprocessAllItemVariants();

				this.isLoading = false;
				return { success: true, data: this.orders };
			} else {
				this.isLoading = false;
				return { success: false, error: parseResult.error || '解析CSV数据失败' };
			}
		} catch (error) {
			this.isLoading = false;
			return { success: false, error: `加载失败: ${error}` };
		}
	}

	// 改进：下载 CSV 文件，自动添加 Session
	private async downloadCSV(): Promise<{ success: boolean; data?: string; error?: string }> {
		try {
			// 使用 SessionManager 获取有效的 Session
			const sessionManager = SessionManager.getInstance();
			const sessionValue = await sessionManager.getValidSession();

			const headers: Record<string, string> = {
				Accept: 'text/csv,application/csv,text/plain',
				'Content-Type': 'text/csv; charset=utf-8'
			};

			// 如果有 Session，添加到请求头
			if (sessionValue) {
				headers['Cookie'] = `_plaza_session_nktz7u=${sessionValue}`;
			} else {
				logger.warn('未找到有效 Session，将尝试无认证请求');
			}

			const response = await fetch('https://manage.booth.pm/orders/csv', {
				method: 'GET',
				headers
			});

			if (response.status === 401) {
				// 如果使用 Session 仍然 401，清除 Session 并提示
				if (sessionValue) {
					sessionManager.clearSession();
					logger.warn('Session 已失效，已清除');
				}

				return {
					success: false,
					error: `认证失败 (401): ${sessionValue ? 'Session 已失效，请重新登录' : '请先登录 Booth 账户'}`
				};
			}

			if (!response.ok) {
				return {
					success: false,
					error: `下载失败: HTTP ${response.status} - ${response.statusText}`
				};
			}

			const csvData = await response.text();
			return { success: true, data: csvData };
		} catch (error: any) {
			let errorMessage = '网络错误';

			if (error.status === 401) {
				errorMessage = '认证失败: 请先登录 Booth 账户';
			} else if (error.status === 403) {
				errorMessage = '访问被拒绝: 可能没有权限访问此页面';
			} else if (error.status === 404) {
				errorMessage = '页面不存在: 请检查 URL 是否正确';
			}

			return {
				success: false,
				error: `${errorMessage} (${error.status || 'unknown'})`
			};
		}
	}

	// 获取当前 Session 状态（代理到 SessionManager）
	public getSessionStatus() {
		const sessionManager = SessionManager.getInstance();
		return sessionManager.getSessionStatus();
	}

	// 手动刷新 Session（代理到 SessionManager）
	public async refreshSession(): Promise<boolean> {
		const sessionManager = SessionManager.getInstance();
		return await sessionManager.refreshSession();
	}

	// 清除数据
	clearData(): void {
		this.orders = [];
		this.lastLoadTime = null;
	}

	// 获取数据统计信息
	getDataStats(): { totalOrders: number; lastLoadTime: string | null } {
		return {
			totalOrders: this.orders.length,
			lastLoadTime: this.lastLoadTime ? this.lastLoadTime.toISOString() : null
		};
	}

	// 预处理所有商品的变体数据
	private preprocessAllItemVariants(): void {
		try {
			const orderManager = OrderManager.getInstance();
			orderManager.preprocessAllItemVariants(this.orders);
		} catch (error) {
			logger.warn('预处理商品变体数据失败:', error);
		}
	}
}
