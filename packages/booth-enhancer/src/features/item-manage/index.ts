import { ItemManageAPI } from "../../api/item-manage";
import { FeatureContext } from "../base";
import { PageFeature } from "../PageFeature";
import { PageModule } from "../PageModule";
import {
    ItemActions,
    ItemCollapse,
    ItemNavigation,
    VariationNumbers
} from "./modules";

/**
 * Booth网站商品管理页面
 * 提供商品列表增强功能，包括变体序号、标签复制、统计信息等
 */
export class ItemManageFeature extends PageFeature<ItemManageAPI> {
    private modules: Array<PageModule<ItemManageAPI>> = [];

    constructor(context: FeatureContext) {
        super(context);
    }

    shouldExecute(): boolean {
        return this.path === '/items' || this.path === '/items/';
    }

    protected createAPI(): ItemManageAPI | undefined {
        return new ItemManageAPI();
    }

    protected async initialize(): Promise<void> {
        if (this.api) {
            // 创建模块（模块在构造函数中自动注册 API 回调）
            this.modules.push(
                new ItemNavigation(this.api),
                new ItemActions(this.api),
                new ItemCollapse(this.api),
                new VariationNumbers(this.api)
            );
        }
    }
}
