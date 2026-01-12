import { BaseAPI } from '../BaseAPI';
import { ItemManageParser } from './parser';
import { ProgressiveParser } from './progressive-parser';
import { ItemData, ItemElement } from './types';

/**
 * 商品管理页面API
 * 提供商品数据访问和DOM元素引用
 * 自动识别页面URL：https://manage.booth.pm/items
 */
export class ItemManageAPI extends BaseAPI<ItemManageAPI> {
    private _items: ItemElement[] = [];
    private _parser: ItemManageParser;
    private _progressiveParser?: ProgressiveParser;

    constructor() {
        super();
        this._parser = new ItemManageParser();
    }

    /**
     * 判断是否应该在当前页面激活
     * 只在商品管理列表页面激活（不包括编辑页面）
     */
    protected shouldActivate(): boolean {
        const path = window.location.pathname;
        // 匹配 /items 或 /items/
        // 但排除 /items/数字/edit 这样的编辑页面
        return (path === '/items' || path === '/items/') && 
               !path.match(/\/items\/\d+\/(edit|edit_pre)/);
    }

    /**
     * 等待商品元素出现
     */
    private waitForElements(timeout = 5000): Promise<void> {
        return new Promise((resolve, reject) => {
            const selector = '.item-wrapper';
            
            if (document.querySelector(selector)) {
                resolve();
                return;
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    clearTimeout(timer);
                    observer.disconnect();
                    resolve();
                }
            });

            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error('等待商品元素超时'));
            }, timeout);

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    /**
     * 加载商品数据
     * ⚡ 性能优化：只收集元素引用，不解析数据
     */
    protected async load(): Promise<void> {
        await this.waitForElements();
        
        const elements = document.querySelectorAll<HTMLElement>('.item-wrapper');
        
        this._items = Array.from(elements).map(element => ({
            element,
            data: null, // 延迟解析
            variations: [],
            tags: [],
            variationsUl: element.querySelector('.dashboard-items-variation') as HTMLElement | undefined,
            tagsUl: element.querySelector('.dashboard-items-tags') as HTMLElement | undefined
        }));
        
        this._progressiveParser = new ProgressiveParser(this._parser);
    }

    /**
     * 按需解析商品数据
     * 在元素进入可视范围时调用
     */
    parseItemData(item: ItemElement): void {
        if (!this._progressiveParser || item.data) return;
        
        const parsed = this._progressiveParser.parseItem(item.element);
        if (!parsed) return;
        
        item.data = parsed.data;
        item.variations = parsed.variations;
        item.tags = parsed.tags;
    }

    /**
     * 获取所有商品（包含数据和DOM元素）
     */
    getItems(): ItemElement[] {
        return [...this._items];
    }

    /**
     * 获取所有商品数据（只返回数据，不含DOM元素）
     * 注意：未解析的商品数据为 null
     */
    getItemsData(): (ItemData | null)[] {
        return this._items.map(item => item.data);
    }

    /**
     * 根据ID获取商品（包含数据和DOM元素）
     * 注意：需要先解析数据才能按ID查找
     */
    getItem(id: string): ItemElement | undefined {
        return this._items.find(item => item.data?.id === id);
    }

    /**
     * 根据ID获取商品数据（只返回数据）
     */
    getItemData(id: string): ItemData | null | undefined {
        return this._items.find(item => item.data?.id === id)?.data;
    }

    /**
     * 根据ID获取DOM元素
     */
    getItemElement(id: string): HTMLElement | undefined {
        return this._items.find(item => item.data?.id === id)?.element;
    }

    /**
     * 刷新数据（重新解析DOM）
     */
    refresh(): void {
        this.load();
    }

    /**
     * 复制商品标签到剪贴板
     */
    async copyItemTags(itemId: string): Promise<boolean> {
        const item = this.getItem(itemId);
        
        if (!item?.data) {
            console.error(`未找到商品或数据未解析: ${itemId}`);
            return false;
        }

        if (item.data.tags.length === 0) {
            alert('没有找到标签');
            return false;
        }

        try {
            await navigator.clipboard.writeText(JSON.stringify(item.data.tags));
            return true;
        } catch (error) {
            console.error('复制标签失败:', error);
            return false;
        }
    }
}

// 导出类型
export type { ItemData, ItemElement, TagElement, VariationData, VariationElement } from './types';

