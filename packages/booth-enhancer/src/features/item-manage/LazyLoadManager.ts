import { ItemManageAPI } from "../../api/item-manage";
import { ItemElement } from "../../api/item-manage/types";

/**
 * 懒加载管理器
 * 统一管理 IntersectionObserver，避免每个模块都创建观察器
 */
export class LazyLoadManager {
    private observer: IntersectionObserver;
    private itemMap = new WeakMap<HTMLElement, ItemElement>();
    private handlers = new Map<string, (item: ItemElement) => void>();
    private processedMap = new Map<string, WeakSet<HTMLElement>>();
    private pendingItems: ItemElement[] = [];
    private rafId: number | null = null;
    private api: ItemManageAPI;

    constructor(
        items: ItemElement[],
        api: ItemManageAPI,
        options: IntersectionObserverInit = {
            root: null,
            rootMargin: '200px', // 提前加载，但不要太激进
            threshold: 0.01
        }
    ) {
        this.api = api;
        // 建立元素到商品的映射
        items.forEach(item => {
            this.itemMap.set(item.element, item);
        });

        // 创建统一的观察器
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target as HTMLElement;
                    const item = this.itemMap.get(element);
                    
                    if (item) {
                        // 添加到待处理队列，批量处理
                        this.pendingItems.push(item);
                    }
                }
            });

            // 使用 RAF 批量处理，避免阻塞
            if (this.pendingItems.length > 0 && !this.rafId) {
                this.rafId = requestAnimationFrame(() => this.processPendingItems());
            }
        }, options);

        // 开始观察所有商品元素
        items.forEach(item => {
            this.observer.observe(item.element);
        });
    }

    /**
     * 批量处理待处理的元素
     */
    private processPendingItems(): void {
        const items = this.pendingItems.splice(0);
        this.rafId = null;

        items.forEach(item => {
            // ⚡ 关键：在处理前先确保数据已解析
            if (!item.data) {
                this.api.parseItemData(item);
            }

            // 数据解析完成后才调用处理器
            if (!item.data) return;

            this.handlers.forEach((handler, handlerId) => {
                const processedSet = this.processedMap.get(handlerId);
                if (!processedSet || processedSet.has(item.element)) return;
                
                handler(item);
                processedSet.add(item.element);
            });
        });
    }

    /**
     * 注册处理器
     * @param id 处理器唯一标识
     * @param handler 处理函数
     */
    registerHandler(id: string, handler: (item: ItemElement) => void): void {
        this.handlers.set(id, handler);
        this.processedMap.set(id, new WeakSet());
    }

    /**
     * 注销处理器
     */
    unregisterHandler(id: string): void {
        this.handlers.delete(id);
        this.processedMap.delete(id);
    }

    /**
     * 清理观察器
     */
    destroy(): void {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        this.observer.disconnect();
        this.handlers.clear();
        this.processedMap.clear();
        this.itemMap = new WeakMap();
        this.pendingItems = [];
        this.rafId = null;
    }
}
