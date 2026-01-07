import { FeatureContext } from "../types";

/**
 * 页面基类（向后兼容）
 * 所有页面功能继承自此类
 * @deprecated 请使用 PageFeature 代替
 */
export abstract class Feature {
    protected context: FeatureContext;
    protected path: string;

    constructor(context: FeatureContext) {
        this.context = context;
        this.path = window.location.pathname;
    }

    /**
     * 判断当前页面是否应该执行此功能
     */
    shouldExecute(): boolean {
        return false;
    }

    /**
     * 执行页面功能
     */
    async execute(): Promise<void> {
        // console.log(`${this.constructor.name} executed`);
    }

    /**
     * 清理资源
     */
    cleanup(): void {
        // 子类实现具体清理逻辑
    }
} 
