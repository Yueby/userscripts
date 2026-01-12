import { ItemManageParser } from './parser';
import { ItemData, TagElement, VariationElement } from './types';

/**
 * 渐进式解析器
 * 管理按需解析逻辑，提供解析缓存避免重复解析
 */
export class ProgressiveParser {
    private parsed = new WeakSet<HTMLElement>(); // 已解析标记
    private parser: ItemManageParser;

    constructor(parser: ItemManageParser) {
        this.parser = parser;
    }

    /**
     * 检查元素是否已解析
     */
    isParsed(element: HTMLElement): boolean {
        return this.parsed.has(element);
    }

    /**
     * 按需解析单个商品的完整数据
     * 返回解析后的数据结构（不修改原对象）
     */
    parseItem(element: HTMLElement): { 
        data: ItemData; 
        variations: VariationElement[]; 
        tags: TagElement[];
    } | null {
        if (this.parsed.has(element)) return null;

        const itemData = this.parser.parseItem(element);
        if (!itemData) return null;

        this.parsed.add(element);

        return {
            data: itemData,
            variations: this.parser.parseVariations(element),
            tags: this.parser.parseTags(element)
        };
    }

    /**
     * 仅解析基础信息（不包含 variations 和 tags）
     * 用于快速初始化
     */
    parseBasicInfo(element: HTMLElement): ItemData | null {
        const basicData = this.parser.parseItemBasic(element);
        if (!basicData) {
            return null;
        }

        // 返回带空数组的完整数据
        return {
            ...basicData,
            tags: [],
            variations: []
        };
    }

    /**
     * 按需解析 variations（懒加载）
     */
    parseVariations(element: HTMLElement): VariationElement[] {
        return this.parser.parseVariations(element);
    }

    /**
     * 按需解析 tags（懒加载）
     */
    parseTags(element: HTMLElement): TagElement[] {
        return this.parser.parseTags(element);
    }

    /**
     * 重置解析状态（用于调试或重新加载）
     */
    reset(): void {
        this.parsed = new WeakSet<HTMLElement>();
    }
}
