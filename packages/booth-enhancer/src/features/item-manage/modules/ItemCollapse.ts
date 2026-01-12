import { ItemManageAPI } from "../../../api/item-manage";
import { ItemElement } from "../../../api/item-manage/types";
import { handleError } from "../../../utils/error";
import { LazyLoadModule } from "./LazyLoadModule";

/**
 * 商品折叠功能模块
 * 提供变体列表和标签列表的折叠/展开功能（仅在可视范围内添加）
 */
export class ItemCollapse extends LazyLoadModule {
    private stylesInjected = false;
    private eventDelegateSetup = false;
    private tagHeaderCache: HTMLElement | null = null; // 缓存标签 header

    constructor(api: ItemManageAPI) {
        super(api);
    }
    
    /**
     * 快速千分位格式化（比 toLocaleString 快 10 倍）
     */
    private static formatNumber(num: number): string {
        if (num < 1000) return num.toString();
        const str = num.toString();
        const len = str.length;
        const mod = len % 3;
        let result = mod > 0 ? str.slice(0, mod) : '';
        for (let i = mod; i < len; i += 3) {
            if (result) result += ',';
            result += str.slice(i, i + 3);
        }
        return result;
    }

    protected initialize(): void {
        this.injectStyles();
        this.setupEventDelegate();
        super.initialize();
    }
    
    /**
     * 使用事件委托代替每个 header 的独立事件监听器
     */
    private setupEventDelegate(): void {
        if (this.eventDelegateSetup) return;
        this.eventDelegateSetup = true;
        
        // 在 document 上监听所有折叠按钮的点击
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const header = target.closest('.item-collapse-header') as HTMLElement;
            
            if (!header) return;
            
            const targetElement = header.nextElementSibling as HTMLElement;
            if (!targetElement) return;
            
            // 直接从 header 的第一个子元素获取 icon，避免 querySelector
            const icon = header.firstElementChild?.firstElementChild as HTMLElement;
            
            if (icon) {
                const isCollapsed = targetElement.classList.contains('collapsed');
                targetElement.classList.toggle('collapsed', !isCollapsed);
                icon.classList.toggle('collapsed', !isCollapsed);
            }
        }, { passive: true });
    }

    /**
     * 处理单个商品，添加折叠功能
     */
    protected processItem(itemElement: ItemElement): void {
        try {
            const { variationsUl, tagsUl, variations } = itemElement;

            // 处理变体列表
            if (variationsUl && variations.length > 0 && !variationsUl.previousElementSibling?.classList.contains('item-collapse-header')) {
                const header = this.createVariationHeader(itemElement);
                variationsUl.parentElement?.insertBefore(header, variationsUl);
                variationsUl.classList.add('item-collapsible', 'collapsed');
            }

            // 处理标签列表（使用缓存）
            if (tagsUl && itemElement.tags.length > 0 && !tagsUl.previousElementSibling?.classList.contains('item-collapse-header')) {
                const header = this.createTagHeader();
                tagsUl.parentElement?.insertBefore(header, tagsUl);
                tagsUl.classList.add('item-collapsible', 'collapsed');
            }
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 创建基础折叠标题（使用 innerHTML 减少 DOM 操作）
     */
    private createBaseHeader(title: string, badgesHTML?: string): HTMLElement {
        const header = document.createElement('div');
        header.className = 'item-collapse-header';
        
        // 一次性设置 innerHTML，减少 DOM 操作
        header.innerHTML = `
            <div class="item-collapse-title">
                <span class="item-collapse-icon collapsed">▼</span>
                <span>${title}</span>
            </div>
            ${badgesHTML ? `<div class="item-collapse-badges">${badgesHTML}</div>` : ''}
        `;

        return header;
    }

    /**
     * 创建变体列表折叠标题（优化统计计算）
     */
    private createVariationHeader(itemElement: ItemElement): HTMLElement {
        const { variations } = itemElement;
        
        // 优化：使用单次循环计算所有统计
        let totalSales = 0;
        let totalRevenue = 0;
        const count = variations.length;
        
        for (let i = 0; i < count; i++) {
            totalSales += variations[i].data.salesCount;
            totalRevenue += variations[i].data.revenue;
        }

        // 使用快速格式化代替 toLocaleString
        const badgesHTML = `
            <span class="item-badge item-badge-count">变体: <strong>${count}</strong></span>
            <span class="item-badge item-badge-sales">销量: <strong>${totalSales}</strong></span>
            <span class="item-badge item-badge-revenue">收益: <strong>${ItemCollapse.formatNumber(totalRevenue)}</strong></span>
        `;

        return this.createBaseHeader('变体列表', badgesHTML);
    }

    /**
     * 创建标签列表折叠标题（使用缓存）
     */
    private createTagHeader(): HTMLElement {
        // 标签 header 是固定的，克隆缓存的节点
        if (!this.tagHeaderCache) {
            this.tagHeaderCache = this.createBaseHeader('标签列表');
        }
        return this.tagHeaderCache.cloneNode(true) as HTMLElement;
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
                width: 16px;
                height: 16px;
                margin-right: 6px;
                font-size: 10px;
                color: #666;
                flex-shrink: 0;
            }

            .item-collapse-icon.collapsed {
                transform: rotate(-90deg);
            }

            /* 折叠容器样式 - 无动画，直接隐藏 */
            .item-collapsible {
                contain: layout style paint; /* 限制重排范围 */
            }

            .item-collapsible.collapsed {
                display: none !important;
            }

            /* 折叠标题容器 - 无动画 */
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
                gap: 12px;
                contain: layout style paint;
            }
            
            @media (hover: hover) {
                .item-collapse-header:hover {
                    background-color: #f5f5f5;
                }
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
                padding: 4px 10px;
                font-size: 11px;
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

