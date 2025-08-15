import { GM_xmlhttpRequest } from '$';
import type { Order } from '../../types/order';
import { OrderManager } from '../booth/order-manager';
import { CSVParser } from './csv-parser';
import { logger } from './logger';

// 添加 Session 信息接口
interface SessionInfo {
    _plaza_session_nktz7u: string;
    updated_at: string;
    expires_at: string | null;
}

// 数据加载器
export class DataLoader {
    private static instance: DataLoader;
    private orders: Order[] = [];
    private isLoading = false;
    private lastLoadTime: Date | null = null;
    private sessionInfo: SessionInfo | null = null; // 添加 Session 存储

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

    // 新增：获取有效的 Session
    private async getValidSession(): Promise<string | null> {
        // 如果已有 Session 且未过期，直接返回
        if (this.sessionInfo && this.isSessionValid()) {
            return this.sessionInfo._plaza_session_nktz7u;
        }

        // 尝试获取新的 Session
        try {
            const newSession = await this.fetchSession();
            if (newSession) {
                this.sessionInfo = newSession;
                return newSession._plaza_session_nktz7u;
            }
        } catch (error) {
            logger.warn('获取 Session 失败:', error);
        }

        return null;
    }

    // 新增：检查 Session 是否有效
    private isSessionValid(): boolean {
        if (!this.sessionInfo) return false;
        
        // 如果没有过期时间，认为有效
        if (!this.sessionInfo.expires_at) return true;
        
        // 检查是否过期（提前5分钟认为过期）
        const expiresTime = new Date(this.sessionInfo.expires_at).getTime();
        const currentTime = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5分钟缓冲
        
        return currentTime < (expiresTime - bufferTime);
    }

    // 新增：获取 Session 信息
    private async fetchSession(): Promise<SessionInfo | null> {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://manage.booth.pm/orders',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
                },
                onload: (response) => {
                    const cookieInfo = this.extractCookieInfo(response.responseHeaders);

                    if (cookieInfo) {
                        const sessionData: SessionInfo = {
                            _plaza_session_nktz7u: cookieInfo.value,
                            updated_at: new Date().toISOString(),
                            expires_at: cookieInfo.expires
                        };
                        
                        logger.info('成功获取 Session');
                        resolve(sessionData);
                    } else {
                        logger.warn('未找到有效的 Session');
                        resolve(null);
                    }
                },
                onerror: (error) => {
                    logger.error('获取 Session 请求失败:', error);
                    resolve(null);
                },
                ontimeout: () => {
                    logger.warn('获取 Session 请求超时');
                    resolve(null);
                }
            });
        });
    }

    // 新增：从响应头提取 Cookie 信息
    private extractCookieInfo(headers: string): { value: string; expires: string | null } | null {
        const cookieHeader = headers.split('\n')
            .find(line => line.toLowerCase().startsWith('set-cookie:') &&
                line.includes('_plaza_session_nktz7u='));

        if (!cookieHeader) return null;

        const value = cookieHeader.split(';')[0].split('=').slice(1).join('=').trim();
        const expires = cookieHeader.match(/expires=([^;]+)/i)?.[1]?.trim();

        return {
            value,
            expires: expires ? new Date(expires).toISOString() : null
        };
    }

    // 改进：下载 CSV 文件，自动添加 Session
    private async downloadCSV(): Promise<{ success: boolean; data?: string; error?: string; }> {
        // 尝试获取有效的 Session
        const sessionValue = await this.getValidSession();
        
        return new Promise((resolve) => {
            const headers: Record<string, string> = {
                'Accept': 'text/csv,application/csv,text/plain',
                'Content-Type': 'text/csv; charset=utf-8'
            };

            // 如果有 Session，添加到请求头
            if (sessionValue) {
                headers['Cookie'] = `_plaza_session_nktz7u=${sessionValue}`;
                logger.info('使用 Session 进行认证');
            } else {
                logger.warn('未找到有效 Session，将尝试无认证请求');
            }

            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://manage.booth.pm/orders/csv',
                headers,
                onload: (response: any) => {
                    if (response.status === 200) {
                        resolve({ success: true, data: response.responseText });
                    } else if (response.status === 401) {
                        // 如果使用 Session 仍然 401，清除 Session 并提示
                        if (sessionValue) {
                            this.sessionInfo = null;
                            logger.warn('Session 已失效，已清除');
                        }
                        
                        resolve({
                            success: false,
                            error: `认证失败 (401): ${sessionValue ? 'Session 已失效，请重新登录' : '请先登录 Booth 账户'}`
                        });
                    } else {
                        resolve({
                            success: false,
                            error: `下载失败: HTTP ${response.status} - ${response.statusText}`
                        });
                    }
                },
                onerror: (error: any) => {
                    let errorMessage = '网络错误';
                    if (error.status === 401) {
                        errorMessage = '认证失败: 请先登录 Booth 账户';
                    } else if (error.status === 403) {
                        errorMessage = '访问被拒绝: 可能没有权限访问此页面';
                    } else if (error.status === 404) {
                        errorMessage = '页面不存在: 请检查 URL 是否正确';
                    }
                    
                    resolve({ 
                        success: false, 
                        error: `${errorMessage} (${error.status || 'unknown'})` 
                    });
                },
                ontimeout: () => {
                    resolve({ success: false, error: '下载超时' });
                }
            });
        });
    }

    // 新增：手动刷新 Session
    public async refreshSession(): Promise<boolean> {
        try {
            const newSession = await this.fetchSession();
            if (newSession) {
                this.sessionInfo = newSession;
                logger.info('Session 刷新成功');
                return true;
            }
            return false;
        } catch (error) {
            logger.error('刷新 Session 失败:', error);
            return false;
        }
    }

    // 新增：获取当前 Session 状态
    public getSessionStatus(): { hasSession: boolean; isValid: boolean; expiresAt?: string } {
        return {
            hasSession: !!this.sessionInfo,
            isValid: this.isSessionValid(),
            expiresAt: this.sessionInfo?.expires_at || undefined
        };
    }

    // 清除数据
    clearData(): void {
        this.orders = [];
        this.lastLoadTime = null;
        this.sessionInfo = null; // 同时清除 Session
    }

    // 获取数据统计信息
    getDataStats(): { totalOrders: number; lastLoadTime: string | null; } {
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