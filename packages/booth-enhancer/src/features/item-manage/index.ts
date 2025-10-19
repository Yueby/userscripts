import { FeatureContext } from "../../types";
import { handleError } from "../../utils/error";
import { Feature } from "../base";
import {
    ItemActions,
    ItemNavigation,
    ItemObserver,
    ItemStats,
    VariationNumbers
} from "./modules";

/**
 * Booth网站商品管理页面
 * 提供商品列表增强功能，包括变体序号、标签复制、统计信息等
 */
export class ItemManageFeature extends Feature {
    private variationNumbers: VariationNumbers;
    private itemActions: ItemActions;
    private itemStats: ItemStats;
    private itemNavigation: ItemNavigation;
    private itemObserver: ItemObserver;

    constructor(context: FeatureContext) {
        super(context);
        
        // 初始化各个功能模块
        this.variationNumbers = new VariationNumbers();
        this.itemActions = new ItemActions();
        this.itemStats = new ItemStats();
        this.itemNavigation = new ItemNavigation();
        this.itemObserver = new ItemObserver(context); // 只有这个需要 context
    }

    shouldExecute(): boolean {
        return this.path === '/items' || this.path === '/items/';
    }

    async execute(): Promise<void> {
        await super.execute();
        this.itemObserver.setupPageObserver((item) => this.processItem(item));
        
        // 延迟创建导航栏，确保商品都已加载
        setTimeout(() => {
            this.itemNavigation.createNavigation();
        }, 1000);
    }

    // 处理单个商品卡片
    private processItem(item: HTMLElement): void {
        try {
            // 使用各个功能模块处理商品
            this.variationNumbers.addToItem(item);
            this.itemActions.addToItem(item);
            this.itemStats.addToItem(item);
            
            // 标记该元素已处理
            item.setAttribute('data-processed', 'true');
        } catch (error) {
            handleError(error);
        }
    }

    cleanup(): void {
        // 清理各个功能模块
        this.variationNumbers.cleanup();
        this.itemActions.cleanup();
        this.itemStats.cleanup();
        this.itemNavigation.cleanup();
        this.itemObserver.cleanup();
    }
} 