import { ItemManageAPI } from "../../../api/item-manage";
import { ItemElement } from "../../../api/item-manage/types";
import { PageModule } from "../../PageModule";
import { LazyLoadManager } from "../LazyLoadManager";

/**
 * 懒加载模块基类
 * 使用共享的 LazyLoadManager 实现可视范围内才处理的懒加载功能
 */
export abstract class LazyLoadModule extends PageModule<ItemManageAPI> {
    private lazyLoadManager?: LazyLoadManager;
    private handlerId: string;

    constructor(api: ItemManageAPI) {
        super(api);
        this.handlerId = this.constructor.name;
    }

    /**
     * PageModule 的 initialize 在这里不做任何事
     * 懒加载模块使用独立的生命周期
     */
    protected initialize(): void {
        // 空实现，懒加载模块使用 onLazyLoadReady
    }

    /**
     * 当 LazyLoadManager 准备好时调用
     */
    onLazyLoadReady(manager: LazyLoadManager): void {
        this.lazyLoadManager = manager;

        // 注册处理器到管理器
        manager.registerHandler(
            this.handlerId,
            item => this.processItem(item)
        );
    }

    /**
     * 处理单个项目（子类必须实现）
     */
    protected abstract processItem(item: ItemElement): void;

    /**
     * 清理
     */
    public destroy(): void {
        if (this.lazyLoadManager) {
            this.lazyLoadManager.unregisterHandler(this.handlerId);
        }
    }
}
