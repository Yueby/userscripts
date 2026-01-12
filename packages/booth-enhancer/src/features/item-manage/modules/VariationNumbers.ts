import { ItemManageAPI } from "../../../api/item-manage";
import { ItemElement } from "../../../api/item-manage/types";
import { Config } from "../../../utils/config";
import { handleError } from "../../../utils/error";
import { Utils } from "../../../utils/utils";
import { LazyLoadModule } from "./LazyLoadModule";

/**
 * 变体序号功能模块
 * 为变体列表添加序号显示（仅在可视范围内）
 */
export class VariationNumbers extends LazyLoadModule {
    constructor(api: ItemManageAPI) {
        super(api);
    }

    /**
     * 处理单个商品，添加变体序号
     */
    protected processItem(itemElement: ItemElement): void {
        try {
            const { element, variationsUl, variations } = itemElement;
            if (!variationsUl || variations.length === 0) return;

            this.addNumbersToVariations(variations);
            this.setupVariationObserver(element, variationsUl, variations);
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 为变体添加序号（使用 API 的 variations）
     */
    private addNumbersToVariations(variations: ItemElement['variations']): void {
        variations.forEach((variationElement, index) => {
            const labelArea = variationElement.element.querySelector('.dashboard-items-variation-label');
            if (!labelArea) return;

            let numberSpan = variationElement.element.querySelector('.variation-number');
            if (!numberSpan) {
                numberSpan = document.createElement('span');
                numberSpan.className = 'variation-number';
                (numberSpan as HTMLElement).style.cssText = 'margin-right: 8px; color: #666;';
                labelArea.insertBefore(numberSpan, labelArea.firstChild);
            }
            numberSpan.textContent = `#${index + 1}`;
        });
    }

    /**
     * 设置变体列表观察器（使用 API 的 variations）
     */
    private setupVariationObserver(item: Element, variationList: HTMLElement, variations: ItemElement['variations']): void {
        // 监听变体列表的变化
        const observer = new MutationObserver(Utils.throttle((_mutations: MutationRecord[], _observer: MutationObserver) => {
            const needsUpdate = variations.some((variationElement, index) => {
                const numberSpan = variationElement.element.querySelector('.variation-number');
                return !numberSpan || numberSpan.textContent !== `#${index + 1}`;
            });

            if (needsUpdate) {
                requestAnimationFrame(() => this.addNumbersToVariations(variations));
            }
        }, Config.throttleDelay));

        observer.observe(variationList, {
            childList: true,
            subtree: false
        });

        // 将observer存储到item元素中，以便后续清理
        (item as any).variationObserver = observer;
    }

}
