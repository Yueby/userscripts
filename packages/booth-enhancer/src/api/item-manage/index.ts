import { BaseAPI } from '../BaseAPI';
import { ItemManageParser } from './parser';
import { ItemData, ItemElement } from './types';

/**
 * 商品管理页面API
 * 提供商品数据访问和DOM元素引用
 * 自动识别页面URL：https://manage.booth.pm/items
 */
export class ItemManageAPI extends BaseAPI<ItemManageAPI> {
    private _items: ItemElement[] = [];
    private _parser: ItemManageParser;

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
    private waitForElements(timeout: number = 5000): Promise<void> {
        return new Promise((resolve, reject) => {
            if (document.querySelector('.item-wrapper')) {
                resolve();
                return;
            }

            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error('等待商品元素超时'));
            }, timeout);

            const observer = new MutationObserver(() => {
                if (document.querySelector('.item-wrapper')) {
                    clearTimeout(timer);
                    observer.disconnect();
                    resolve();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    /**
     * 加载商品数据
     * 等待商品元素出现后再加载
     */
    protected async load(): Promise<void> {
        // 等待商品元素出现
        await this.waitForElements();
        
        this._items = [];
        const elements = document.querySelectorAll('.item-wrapper');
        
        elements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const data = this._parser.parseItem(element);
            if (data) {
                // 获取变体和标签的ul元素
                const variationsUl = htmlElement.querySelector('.dashboard-items-variation') as HTMLElement | undefined;
                const tagsUl = htmlElement.querySelector('.dashboard-items-tags') as HTMLElement | undefined;
                
                // 解析变体和标签（包含元素引用）
                const variations = this._parser.parseVariations(htmlElement);
                const tags = this._parser.parseTags(htmlElement);
                
                this._items.push({
                    data,
                    element: htmlElement,
                    variationsUl,
                    tagsUl,
                    variations,
                    tags
                });
            }
        });
    }

    /**
     * 获取所有商品（包含数据和DOM元素）
     */
    getItems(): ItemElement[] {
        return [...this._items];
    }

    /**
     * 获取所有商品数据（只返回数据，不含DOM元素）
     */
    getItemsData(): ItemData[] {
        return this._items.map(item => item.data);
    }

    /**
     * 根据ID获取商品（包含数据和DOM元素）
     */
    getItem(id: string): ItemElement | undefined {
        return this._items.find(item => item.data.id === id);
    }

    /**
     * 根据ID获取商品数据（只返回数据）
     */
    getItemData(id: string): ItemData | undefined {
        return this._items.find(item => item.data.id === id)?.data;
    }

    /**
     * 根据ID获取DOM元素
     */
    getItemElement(id: string): HTMLElement | undefined {
        return this._items.find(item => item.data.id === id)?.element;
    }

    /**
     * 刷新数据（重新解析DOM）
     */
    refresh(): void {
        this.load();
    }

    /**
     * 复制商品标签到剪贴板
     * @param itemId 商品ID
     * @returns 是否复制成功
     */
    async copyItemTags(itemId: string): Promise<boolean> {
        const item = this.getItem(itemId);
        if (!item) {
            console.error(`未找到商品: ${itemId}`);
            return false;
        }

        const tags = item.data.tags;
        if (tags.length === 0) {
            alert('没有找到标签');
            return false;
        }

        try {
            await navigator.clipboard.writeText(JSON.stringify(tags));
            return true;
        } catch (error) {
            console.error('复制标签失败:', error);
            return false;
        }
    }
}

// 导出类型
export type { ItemData, ItemElement, TagElement, VariationData, VariationElement } from './types';

