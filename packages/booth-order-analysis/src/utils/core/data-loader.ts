import { CSVParser } from './csv-parser';
import type { Order } from '../../types/order';
import { GM_xmlhttpRequest } from '$';
import { logger } from './logger';

// 数据加载器
export class DataLoader {
    private static instance: DataLoader;
    private orders: Order[] = [];
    private isLoading = false;
    private lastLoadTime: Date | null = null;

    private constructor() { }

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
    async loadOrdersFromCSV(): Promise<{ success: boolean; data?: Order[]; error?: string; }> {
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

    // 下载CSV文件
    private downloadCSV(): Promise<{ success: boolean; data?: string; error?: string; }> {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://manage.booth.pm/orders/csv',
                headers: {
                    'Accept': 'text/csv,application/csv,text/plain',
                    'Content-Type': 'text/csv; charset=utf-8'
                },
                            onload: (response: any) => {
                if (response.status === 200) {
                    resolve({ success: true, data: response.responseText });
                } else {
                    resolve({
                        success: false,
                        error: `下载失败: HTTP ${response.status} - ${response.statusText}`
                    });
                }
            },
            onerror: (error: any) => {
                resolve({ success: false, error: '网络请求失败' });
            },
            ontimeout: () => {
                resolve({ success: false, error: '下载超时' });
            }
            });
        });
    }

    // 清除数据
    clearData(): void {
        this.orders = [];
        this.lastLoadTime = null;
    }

    // 获取数据统计
    getDataStats(): { totalOrders: number; lastLoadTime: string | null; } {
        return {
            totalOrders: this.orders.length,
            lastLoadTime: this.lastLoadTime ? this.lastLoadTime.toLocaleString() : null
        };
    }
} 