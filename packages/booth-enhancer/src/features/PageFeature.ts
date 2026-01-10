import { BaseAPI } from "../api/BaseAPI";
import { FeatureContext } from "./base";
/**
 * 页面功能基类
 * 管理页面级功能，持有API实例和子模块
 */
export abstract class PageFeature<TApi extends BaseAPI = BaseAPI> {
    protected context: FeatureContext;
    protected path: string;
    protected api?: TApi;

    constructor(context: FeatureContext) {
        this.context = context;
        this.path = window.location.pathname;
    }

    /**
     * 判断当前页面是否应该执行此功能
     */
    abstract shouldExecute(): boolean;

    /**
     * 创建API实例（子类实现）
     */
    protected abstract createAPI(): TApi | undefined;

    /**
     * 执行页面功能
     */
    async execute(): Promise<void> {
        // 创建API实例
        this.api = this.createAPI();
        
        // 等待 API 就绪后执行初始化
        if (this.api) {
            await new Promise<void>((resolve) => {
                this.api!.onReady(async () => {
                    await this.initialize();
                    resolve();
                });
            });
        } else {
            // 如果没有 API，直接执行初始化
            await this.initialize();
        }
    }

    /**
     * 初始化逻辑（子类实现）
     */
    protected abstract initialize(): Promise<void>;

    /**
     * 获取API实例
     */
    protected getAPI(): TApi | undefined {
        return this.api;
    }
}

