import { ItemManageAPI } from "../../api/item-manage";
import { FeatureContext } from "../base";
import { PageFeature } from "../PageFeature";
import { PageModule } from "../PageModule";
import { LazyLoadManager } from "./LazyLoadManager";
import { ItemActions, ItemCollapse, ItemNavigation, VariationNumbers } from "./modules";
import { LazyLoadModule } from "./modules/LazyLoadModule";

/**
 * Booth网站商品管理页面
 * 提供商品列表增强功能，包括变体序号、标签复制、统计信息等
 */
export class ItemManageFeature extends PageFeature<ItemManageAPI> {
  private modules: Array<PageModule<ItemManageAPI>> = [];
  private lazyLoadModules: Array<LazyLoadModule> = [];
  private lazyLoadManager?: LazyLoadManager;

  constructor(context: FeatureContext) {
    super(context);
  }

  shouldExecute(): boolean {
    return this.path === "/items" || this.path === "/items/";
  }

  protected createAPI(): ItemManageAPI | undefined {
    return new ItemManageAPI();
  }

  protected async initialize(): Promise<void> {
    if (!this.api) return;

    // 创建懒加载模块
    this.lazyLoadModules = [
      new ItemActions(this.api),
      new VariationNumbers(this.api),
      new ItemCollapse(this.api)
    ];

    // 所有模块（懒加载 + 普通模块）
    this.modules = [
      ...this.lazyLoadModules,
      new ItemNavigation(this.api) // ItemNavigation 立即加载
    ];

    // API ready 后创建懒加载管理器并通知懒加载模块
    this.api.onReady(() => {
      this.lazyLoadManager = new LazyLoadManager(this.api!.getItems(), this.api!);
      this.lazyLoadModules.forEach(module => {
        module.onLazyLoadReady(this.lazyLoadManager!);
      });
    });
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.lazyLoadManager?.destroy();
    this.modules.forEach(module => {
      if (typeof (module as any).destroy === 'function') {
        (module as any).destroy();
      }
    });
    this.modules = [];
    this.lazyLoadModules = [];
  }
}
