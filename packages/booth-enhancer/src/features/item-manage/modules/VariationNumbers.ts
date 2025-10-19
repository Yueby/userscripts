import { Config } from "../../../utils/config";
import { handleError } from "../../../utils/error";
import { Utils } from "../../../utils/utils";

/**
 * 变体序号功能模块
 * 为变体列表添加序号显示
 */
export class VariationNumbers {

    /**
     * 为商品添加变体序号
     * @param item 商品元素
     */
    addToItem(item: Element): void {
        try {
            const variationList = item.querySelector('.dashboard-items-variation');
            if (!variationList) return;

            this.addNumbersToVariations(variationList);
            this.setupVariationObserver(item, variationList);
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 为变体添加序号
     */
    private addNumbersToVariations(variationList: Element): void {
        const variations = variationList.querySelectorAll('.row');
        variations.forEach((variation, index) => {
            const labelArea = variation.querySelector('.dashboard-items-variation-label');
            if (!labelArea) return;

            let numberSpan = variation.querySelector('.variation-number');
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
     * 设置变体列表观察器
     */
    private setupVariationObserver(item: Element, variationList: Element): void {
        const variations = variationList.querySelectorAll('.row');
        
        // 监听变体列表的变化
        const observer = new MutationObserver(Utils.throttle((_mutations: MutationRecord[], _observer: MutationObserver) => {
            const needsUpdate = Array.from(variations).some((variation, index) => {
                const numberSpan = variation.querySelector('.variation-number');
                return !numberSpan || numberSpan.textContent !== `#${index + 1}`;
            });

            if (needsUpdate) {
                requestAnimationFrame(() => this.addNumbersToVariations(variationList));
            }
        }, Config.throttleDelay));

        observer.observe(variationList, {
            childList: true,
            subtree: false
        });

        // 将observer存储到item元素中，以便后续清理
        (item as any).variationObserver = observer;
    }

    /**
     * 清理变体序号功能
     */
    cleanup(): void {
        document.querySelectorAll('.variation-number').forEach(el => el.remove());
    }
}
