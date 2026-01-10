import { ItemManageAPI } from "../../../api/item-manage";
import { ItemElement } from "../../../api/item-manage/types";
import { handleError } from "../../../utils/error";
import { PageModule } from "../../PageModule";

/**
 * 商品折叠功能模块
 * 提供变体列表和标签列表的折叠/展开功能
 */
export class ItemCollapse extends PageModule<ItemManageAPI> {
    private _processedItems?: Set<HTMLElement>;
    private stylesInjected = false;

    private get processedItems(): Set<HTMLElement> {
        if (!this._processedItems) {
            this._processedItems = new Set<HTMLElement>();
        }
        return this._processedItems;
    }

    constructor(api: ItemManageAPI) {
        super(api);
    }

    protected initialize(api: ItemManageAPI): void {
        // 注入样式
        this.injectStyles();
        
        // 为所有商品添加折叠功能
        const items = api.getItems();
        items.forEach(itemElement => {
            this.addToItem(itemElement);
        });
    }

    /**
     * 为商品添加折叠功能
     * @param itemElement API 提供的商品元素
     */
    addToItem(itemElement: ItemElement): void {
        try {
            const { element, variationsUl, tagsUl, variations } = itemElement;
            
            // 避免重复处理
            if (this.processedItems.has(element)) return;
            this.processedItems.add(element);

            const headers: Array<{ header: HTMLElement; target: HTMLElement }> = [];

            // 处理变体列表
            if (variationsUl && variations.length > 0 && !variationsUl.previousElementSibling?.classList.contains('item-collapse-header')) {
                const header = this.createVariationHeader(itemElement);
                headers.push({ header, target: variationsUl });
            }

            // 处理标签列表
            if (tagsUl && itemElement.tags.length > 0 && !tagsUl.previousElementSibling?.classList.contains('item-collapse-header')) {
                const header = this.createTagHeader(tagsUl);
                headers.push({ header, target: tagsUl });
            }

            // 一次性插入所有元素
            headers.forEach(({ header, target }) => {
                target.parentElement?.insertBefore(header, target);
                target.classList.add('item-collapsible', 'collapsed');
            });
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 设置折叠功能
     */
    private setupCollapseToggle(header: HTMLElement, target: HTMLElement): void {
        const icon = header.querySelector('.item-collapse-icon') as HTMLElement;
        let isCollapsed = true;

        header.onclick = () => {
            isCollapsed = !isCollapsed;
            target.classList.toggle('collapsed', isCollapsed);
            icon.classList.toggle('collapsed', isCollapsed);
        };
    }

    /**
     * 创建基础折叠标题
     */
    private createBaseHeader(title: string, badgesHTML?: string): HTMLElement {
        const header = document.createElement('div');
        header.className = 'item-collapse-header';

        const titleSection = document.createElement('div');
        titleSection.className = 'item-collapse-title';
        titleSection.innerHTML = `
            <span class="item-collapse-icon collapsed">▼</span>
            <span>${title}</span>
        `;

        header.appendChild(titleSection);

        if (badgesHTML) {
            const badgesContainer = document.createElement('div');
            badgesContainer.className = 'item-collapse-badges';
            badgesContainer.innerHTML = badgesHTML;
            header.appendChild(badgesContainer);
        }

        return header;
    }

    /**
     * 创建变体列表折叠标题（使用 API 数据）
     */
    private createVariationHeader(itemElement: ItemElement): HTMLElement {
        const { variations, variationsUl } = itemElement;
        
        // 从 API 数据计算统计
        const count = variations.length;
        const totalSales = variations.reduce((sum, v) => sum + v.data.salesCount, 0);
        const totalRevenue = variations.reduce((sum, v) => sum + v.data.revenue, 0);

        const badgesHTML = `
            <span class="item-badge item-badge-count">变体: <strong>${count}</strong></span>
            <span class="item-badge item-badge-sales">销量: <strong>${totalSales}</strong></span>
            <span class="item-badge item-badge-revenue">收益: <strong>${totalRevenue.toLocaleString()}</strong></span>
        `;

        const header = this.createBaseHeader('变体列表', badgesHTML);
        this.setupCollapseToggle(header, variationsUl!);

        return header;
    }

    /**
     * 创建标签列表折叠标题
     */
    private createTagHeader(tagsUl: HTMLElement): HTMLElement {
        const header = this.createBaseHeader('标签列表');
        this.setupCollapseToggle(header, tagsUl);

        return header;
    }

    /**
     * 注入样式表
     */
    private injectStyles(): void {
        if (this.stylesInjected) {
            return;
        }

        this.stylesInjected = true;
        const style = document.createElement('style');
        style.id = 'booth-item-collapse-styles';
        style.textContent = `
            /* 折叠图标样式 */
            .item-collapse-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                margin-right: 6px;
                font-size: 10px;
                color: #666;
                flex-shrink: 0;
                transition: transform 0.2s ease;
            }

            .item-collapse-icon.collapsed {
                transform: rotate(-90deg);
            }

            /* 折叠容器样式 - 使用 GPU 加速属性 */
            .item-collapsible {
                overflow: hidden;
                max-height: 5000px;
                will-change: max-height, opacity; /* 提示浏览器优化 */
                contain: layout style paint; /* 限制重排范围 */
            }

            .item-collapsible.collapsed {
                max-height: 0 !important;
                opacity: 0;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                /* 使用 transform 代替部分属性，GPU 加速 */
                transform: translateZ(0);
            }

            /* 折叠标题容器 */
            .item-collapse-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 13px;
                color: #333;
                user-select: none;
                border-bottom: 1px solid #e0e0e0;
                cursor: pointer;
                transition: background-color 0.2s ease;
                gap: 12px;
            }
            
            .item-collapse-header:hover {
                background-color: #f5f5f5;
            }
            
            .item-collapse-header:first-of-type {
                margin-top: 8px;
            }

            /* 标题部分 */
            .item-collapse-title {
                display: flex;
                align-items: center;
                flex-shrink: 0;
            }

            /* Badges 容器 */
            .item-collapse-badges {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: auto;
                flex-wrap: wrap;
                justify-content: flex-end;
            }

            /* Badge 基础样式 */
            .item-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 400;
                border-radius: 12px;
                white-space: nowrap;
            }

            .item-badge strong {
                font-weight: 600;
            }

            /* Badge 变体数量 */
            .item-badge-count {
                background-color: #e3f2fd;
                color: #1976d2;
            }

            /* Badge 销量 */
            .item-badge-sales {
                background-color: #f3e5f5;
                color: #7b1fa2;
            }

            /* Badge 收益 */
            .item-badge-revenue {
                background-color: #e8f5e9;
                color: #388e3c;
            }
        `;
        document.head.appendChild(style);
    }

}

