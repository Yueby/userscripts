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
     * 从文本中提取数字
     */
    private extractNumber(text: string): number {
        return parseInt(text.replace(/[^\d]/g, ''), 10) || 0;
    }

    /**
     * 解析变体列表（数据+元素）
     */
    parseVariations(element: Element): VariationElement[] {
        const rows = element.querySelectorAll('.dashboard-items-variation .row');
        if (rows.length === 0) return [];
        
        const variations: VariationElement[] = [];
        
        rows.forEach(row => {
            const htmlRow = row as HTMLElement;
            
            // 解析变体名称
            const labelEl = row.querySelector('.dashboard-items-variation-label');
            const textContent = labelEl?.textContent || '';
            const nameMatch = textContent.match(/#\d+\s*(.+)/);
            const name = nameMatch ? nameMatch[1].trim() : textContent.trim();
            
            // 解析价格
            const priceText = row.querySelector('.price')?.textContent?.trim() || '0';
            const price = this.extractNumber(priceText);
            
            // 解析销量
            const salesText = row.querySelector('.sales_quantity .count')?.textContent?.trim() || '0';
            const salesCount = this.extractNumber(salesText);
            
            // 解析收益
            const revenueText = row.querySelector('.sales_subtotal')?.textContent?.trim() || '0';
            const revenue = this.extractNumber(revenueText);
            
            variations.push({
                data: { name, price, salesCount, revenue },
                element: htmlRow
            });
        });
        
        return variations;
    }

    /**
     * 解析标签列表（文本+元素）
     */
    parseTags(element: Element): TagElement[] {
        const tagElements = element.querySelectorAll('.dashboard-items-tags li');
        if (tagElements.length === 0) return [];
        
        const tags: TagElement[] = [];
        
        tagElements.forEach(li => {
            const text = li.querySelector('.tag-text')?.textContent?.trim();
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
     * 解析单个商品的基础信息（不包含 variations 和 tags 详细数据）
     */
    parseItemBasic(element: Element): Omit<ItemData, 'tags' | 'variations'> | null {
        try {
            const id = this.extractId(element);
            if (!id) return null;
            
            const name = element.querySelector('.nav')?.textContent?.trim() || '';
            const url = element.querySelector('.nav')?.getAttribute('href') || '';
            const thumbnail = (element.querySelector('.thumbnail img') as HTMLImageElement)?.src || '';
            
            const favElement = element.querySelector('.item-stat.favs .count');
            const favoritesCount = favElement ? parseInt(favElement.textContent || '0', 10) || 0 : 0;
            
            return {
                id,
                name,
                url,
                thumbnail,
                favoritesCount
            };
        } catch (error) {
            console.error('解析商品基础信息失败:', error);
            return null;
        }
    }

    /**
     * 解析单个商品（完整数据）
     */
    parseItem(element: Element): ItemData | null {
        const basic = this.parseItemBasic(element);
        if (!basic) return null;
        
        try {
            // 解析标签（只要文本）
            const tags = this.parseTags(element).map(t => t.text);
            
            // 解析变体（只要数据）
            const variations = this.parseVariations(element).map(v => v.data);
            
            return {
                ...basic,
                tags,
                variations
            };
        } catch (error) {
            console.error('解析商品完整数据失败:', error);
            return null;
        }
    }
}

