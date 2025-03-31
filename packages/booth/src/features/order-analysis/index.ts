import { FeatureContext } from "../../types";
import { Feature } from "../base";
import { OrderService } from './services/order-service';
import { MenuManager } from './ui/menu-manager';
import { AnalysisUI } from './ui/analysis-ui';

/**
 * Booth网站订单分析功能
 * 提供订单统计、导出等功能
 */
export class OrderAnalysisFeature extends Feature {
    private menuManager: MenuManager;
    private analysisUI: AnalysisUI;
    private backgroundSyncInterval: number | null = null;

    constructor(context: FeatureContext) {
        super(context);
        this.menuManager = new MenuManager(this.showOrderAnalysis.bind(this));
        this.analysisUI = new AnalysisUI();
    }

    shouldExecute(): boolean {
        return window.location.hostname.includes('booth.pm');
    }

    async execute(): Promise<void> {
        await super.execute();
        this.menuManager.observe();
        this.setupBackgroundOrderSync();
    }

    cleanup(): void {
        this.menuManager.cleanup();
        this.analysisUI.hide();
        this.cleanupBackgroundSync();
    }

    /**
     * 设置后台订单数据同步
     */
    private setupBackgroundOrderSync(): void {
        // 初始加载
        OrderService.getOrders().catch(error => {
            console.error('初始加载订单数据失败:', error);
        });

        // 每小时检查一次更新
        this.backgroundSyncInterval = window.setInterval(() => {
            if (OrderService.needsUpdate(1)) { // 1小时更新一次
                OrderService.getOrders().catch(error => {
                    console.error('定时更新订单数据失败:', error);
                });
            }
        }, 60 * 60 * 1000); // 每小时检查一次
    }

    /**
     * 清理后台同步资源
     */
    private cleanupBackgroundSync(): void {
        if (this.backgroundSyncInterval !== null) {
            clearInterval(this.backgroundSyncInterval);
            this.backgroundSyncInterval = null;
        }
    }

    /**
     * 显示订单分析界面
     */
    public async showOrderAnalysis(): Promise<void> {
        try {
            // 显示UI
            this.analysisUI.show();
            
            console.log('开始获取订单数据...');
            // 获取订单数据
            const orders = await OrderService.getOrders();
            console.log(`获取到 ${orders.length} 条订单数据`);
            
            if (orders.length > 0) {
                console.log('订单数据示例:', {
                    第一条: orders[0],
                    最后一条: orders[orders.length - 1]
                });
            }
            
            // 更新UI
            if (orders.length === 0) {
                console.warn('没有找到订单数据');
                this.analysisUI.showNoData();
            } else {
                const stats = OrderService.calculateOrderStats(orders);
                console.log('订单统计数据:', stats);
                this.analysisUI.updateContent(orders, stats);
            }
        } catch (error) {
            console.error('加载订单数据失败:', error);
            this.analysisUI.showError(error);
        }
    }
} 