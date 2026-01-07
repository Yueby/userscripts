import { ItemEditAPI } from "../../api/item-edit";
import { FeatureContext } from "../../types";
import { PageFeature } from "../PageFeature";
import { PageModule } from "../PageModule";
import { ItemNumbers, TagManager } from "./modules";
import { FileManager } from "./modules/FileManager";

/**
 * Booth网站商品编辑页面
 * 提供变体序号显示和标签管理功能
 */
export class ItemEditFeature extends PageFeature<ItemEditAPI> {
    private modules: Array<PageModule<ItemEditAPI>> = [];

    constructor(context: FeatureContext) {
        super(context);
    }

    shouldExecute(): boolean {
        const path = window.location.pathname;
        return /^\/items\/\d+\/edit(_pre)?$/.test(path);
    }

    protected createAPI(): ItemEditAPI | undefined {
        return new ItemEditAPI();
    }

    protected async initialize(): Promise<void> {
        if (this.api) {
            // 创建模块（模块在构造函数中自动注册 API 回调）
            this.modules.push(
                new ItemNumbers(this.api),
                new TagManager(this.api),
                new FileManager(this.api)
            );
        }

        console.log(this.api?.data);
    }

    cleanup(): void {
        // 模块无需清理，页面跳转会自动重置
        this.modules = [];
    }
}
