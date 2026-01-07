import { ItemData, TagElement, VariationElement } from './types';

/**
 * DOM解析器
 * 从页面元素中提取数据和对应的DOM元素
 */
export class ItemManageParser {
    /**
     * 从元素中提取商品ID
     */
    private extractId(element: Element): string {
        // 优先从 data-id 获取
        const dataId = element.getAttribute('data-id');
        if (dataId) return dataId;
        
        // 从链接中提取
        const link = element.querySelector('.nav')?.getAttribute('href') || '';
        const match = link.match(/\/items\/(\d+)/);
        return match ? match[1] : '';
    }

    /**
     * 解析变体列表（数据+元素）
     */
    parseVariations(element: Element): VariationElement[] {
        const variations: VariationElement[] = [];
        const rows = element.querySelectorAll('.dashboard-items-variation .row');
        
        rows.forEach(row => {
            // 解析变体名称（从 .dashboard-items-variation-label 中提取）
            const labelEl = row.querySelector('.dashboard-items-variation-label');
            let name = '';
            if (labelEl) {
                // 移除序号和复选框，只保留实际名称
                const textContent = labelEl.textContent || '';
                const match = textContent.match(/#\d+\s*(.+)/);
                name = match ? match[1].trim() : textContent.trim();
            }
            
            // 解析价格
            const priceEl = row.querySelector('.price');
            const priceText = priceEl?.textContent?.trim() || '0';
            const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
            
            // 解析销量
            const salesText = row.querySelector('.sales_quantity .count')?.textContent?.trim() || '0';
            const salesCount = parseInt(salesText, 10) || 0;
            
            // 解析收益
            const revenueEl = row.querySelector('.sales_subtotal');
            const revenueText = revenueEl?.textContent?.trim() || '0';
            const revenue = parseInt(revenueText.replace(/[^\d]/g, ''), 10) || 0;
            
            variations.push({
                data: { name, price, salesCount, revenue },
                element: row as HTMLElement
            });
        });
        
        return variations;
    }

    /**
     * 解析标签列表（文本+元素）
     */
    parseTags(element: Element): TagElement[] {
        const tags: TagElement[] = [];
        const tagElements = element.querySelectorAll('.dashboard-items-tags li');
        
        tagElements.forEach(li => {
            const textEl = li.querySelector('.tag-text');
            const text = textEl?.textContent?.trim();
            if (text) {
                tags.push({
                    text,
                    element: li as HTMLElement
                });
            }
        });
        
        return tags;
    }

    /**
     * 解析单个商品（只返回数据）
     */
    parseItem(element: Element): ItemData | null {
        try {
            const id = this.extractId(element);
            if (!id) return null;
            
            const name = element.querySelector('.nav')?.textContent?.trim() || '';
            const url = element.querySelector('.nav')?.getAttribute('href') || '';
            const thumbnail = (element.querySelector('.thumbnail img') as HTMLImageElement)?.src || '';
            
            // 解析标签（只要文本）
            const tags = this.parseTags(element).map(t => t.text);
            
            // 解析变体（只要数据）
            const variations = this.parseVariations(element).map(v => v.data);
            
            const favElement = element.querySelector('.item-stat.favs .count');
            const favoritesCount = favElement ? parseInt(favElement.textContent || '0', 10) || 0 : 0;
            
            return {
                id,
                name,
                url,
                thumbnail,
                tags,
                variations,
                favoritesCount
            };
        } catch (error) {
            console.error('解析商品失败:', error);
            return null;
        }
    }
}

