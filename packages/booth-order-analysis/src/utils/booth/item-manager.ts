import { GM_xmlhttpRequest } from '$';
import { logger } from '../core/logger';
import type { BoothItem } from '../../types/order';

/**
 * 商品管理器
 * 负责管理Booth商品数据结构和图标获取
 * 符合Booth的设计：一个商品ID对应多个变体
 */
export class ItemManager {
    private static instance: ItemManager;
    private itemsMap: Map<string, BoothItem> = new Map();
    private isInitialized: boolean = false;

    private constructor() { }

    /**
     * 获取单例实例
     */
    static getInstance(): ItemManager {
        if (!ItemManager.instance) {
            ItemManager.instance = new ItemManager();
        }
        return ItemManager.instance;
    }

    /**
     * 初始化商品数据
     * 从Booth管理页面获取所有商品信息
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            await this.loadItemsFromManagePage();
            this.isInitialized = true;
        } catch (error) {
            // 不抛出错误，而是标记为已初始化以避免重复尝试
            this.isInitialized = true;
        }
    }

    /**
     * 从管理页面加载商品数据
     */
    private async loadItemsFromManagePage(): Promise<void> {
        try {
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const boothManageUrl = `https://manage.booth.pm/items?page=${page}`;

                const response = await new Promise<string>((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: boothManageUrl,
                        onload: function (response) {
                            if (response.status === 200) {
                                resolve(response.responseText);
                            } else {
                                reject(new Error(`HTTP ${response.status}`));
                            }
                        },
                        onerror: function (error) {
                            reject(error);
                        }
                    });
                });

                const data = JSON.parse(response);

                if (data && data.items && Array.isArray(data.items)) {
                    data.items.forEach((item: any, index: number) => {
                        try {
                            if (item.id && item.name) {
                                const itemId = item.id.toString();
                                const name = item.name.trim();

                                // 提取图标URL - 使用 base_resized 图片
                                let iconUrl = '';
                                if (item.primary_image && item.primary_image.base_resized && item.primary_image.base_resized.url) {
                                    iconUrl = item.primary_image.base_resized.url;
                                } else if (item.primary_image && item.primary_image.url) {
                                    iconUrl = item.primary_image.url;
                                }

                                // 解析变体信息（简化版，只保留变体名）
                                const variants: string[] = [];
                                if (item.variants && Array.isArray(item.variants)) {
                                    item.variants.forEach((variant: any) => {
                                        const variantName = variant.name || variant.value || variant.variantName;
                                        if (variantName && !variants.includes(variantName)) {
                                            variants.push(variantName);
                                        }
                                    });
                                }

                                // 创建商品数据
                                const itemData: BoothItem = {
                                    itemId,
                                    state: item.state,
                                    url: item.url,
                                    name,
                                    state_label: item.state_label,
                                    iconUrl,
                                    variants
                                };

                                this.itemsMap.set(itemId, itemData);
                            }
                        } catch (error) {
                            // 静默处理解析错误
                        }
                    });

                    // 检查是否还有更多页面
                    if (data.metadata && data.metadata.next_page) {
                        page++;
                    } else {
                        hasMorePages = false;
                    }
                } else {
                    hasMorePages = false;
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * 根据商品ID获取商品数据
     */
    getItem(id: string): BoothItem | null {
        return this.itemsMap.get(id) || null;
    }

    /**
     * 根据商品ID获取商品图标
     */
    getItemIcon(id: string): string {
        const item = this.getItem(id);
        if (!item) {
            logger.warn(`未找到商品ID: ${id}`);
        }
        return item?.iconUrl || this.getDefaultIcon();
    }

    /**
     * 根据商品ID获取指定尺寸的图片URL
     * @param id 商品ID
     * @param size 图片尺寸 ('72x72', '150x150', '300x300', '620x620', 'original')
     */
    getItemImageUrl(id: string, size: '72x72' | '150x150' | '300x300' | '620x620' | 'original' = '72x72'): string {
        const item = this.getItem(id);
        if (!item) {
            return this.getDefaultIcon();
        }

        // 这里需要重新获取原始数据来访问不同尺寸的图片
        // 为了简化，我们暂时返回默认的iconUrl
        // 如果需要不同尺寸，可以考虑在BoothItem中存储更多图片URL
        return item.iconUrl || this.getDefaultIcon();
    }

    /**
     * 根据商品ID获取商品名称
     */
    getItemName(id: string): string {
        const item = this.getItem(id);
        return item?.name || '未知商品';
    }

    /**
     * 根据商品ID获取商品状态
     */
    getItemState(id: string): string {
        const item = this.getItem(id);
        return item?.state || '';
    }

    /**
     * 根据商品ID获取商品URL
     */
    getItemUrl(id: string): string {
        const item = this.getItem(id);
        return item?.url || '';
    }

    /**
     * 根据商品ID获取商品状态标签
     */
    getItemStateLabel(id: string): string {
        const item = this.getItem(id);
        return item?.state_label || '';
    }

    /**
     * 根据商品ID获取商品变体列表
     */
    getItemVariants(id: string): string[] {
        const item = this.getItem(id);
        return item?.variants || [];
    }

    /**
     * 获取所有商品数据
     */
    getAllItems(): Map<string, BoothItem> {
        return new Map(this.itemsMap);
    }

    /**
     * 获取所有商品ID
     */
    getAllItemIds(): string[] {
        return Array.from(this.itemsMap.keys());
    }

    /**
     * 检查商品是否存在
     */
    hasItem(id: string): boolean {
        return this.itemsMap.has(id);
    }

    /**
     * 获取商品总数
     */
    getItemCount(): number {
        return this.itemsMap.size;
    }

    /**
     * 获取默认图标URL
     */
    private getDefaultIcon(): string {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMzYgMjRDMzAuNDc3MiAyNCAyNiAyOC40NzcyIDI2IDM0QzI2IDM5LjUyMjggMzAuNDc3MiA0NCAzNiA0NEM0MS41MjI4IDQ0IDQ2IDM5LjUyMjggNDYgMzRDNDYgMjguNDc3MiA0MS41MjI4IDI0IDM2IDI0Wk0zNiA0MEMzMi42ODYzIDQwIDMwIDM3LjMxMzcgMzAgMzRDMzAgMzAuNjg2MyAzMi42ODYzIDI4IDM2IDI4QzM5LjMxMzcgMjggNDIgMzAuNjg2MyA0MiAzNEM0MiAzNy4zMTM3IDM5LjMxMzcgNDAgMzYgNDBaIiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0yNCA0OEg0OFY1MkgyNFY0OFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
    }

    /**
     * 清除缓存数据
     */
    clearCache(): void {
        this.itemsMap.clear();
        this.isInitialized = false;
    }

    /**
     * 重新加载商品数据
     */
    async reload(): Promise<void> {
        this.clearCache();
        await this.initialize();
    }
} 