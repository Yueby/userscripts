import { ItemManageAPI } from "../../../api/item-manage";
import { ItemElement } from "../../../api/item-manage/types";
import { Config } from "../../../utils/config";
import { handleError } from "../../../utils/error";
import { Utils } from "../../../utils/utils";
import { PageModule } from "../../PageModule";
import { BatchProcessor } from "./batchProcessor";

/**
 * 变体序号功能模块
 * 为变体列表添加序号显示
 */
export class VariationNumbers extends PageModule<ItemManageAPI> {
    private batchProcessor?: BatchProcessor<ItemElement>;

    constructor(api: ItemManageAPI) {
        super(api);
    }

    protected initialize(api: ItemManageAPI): void {
        if (!this.batchProcessor) {
            this.batchProcessor = new BatchProcessor<ItemElement>();
        }
        
        const items = api.getItems();
        this.batchProcessor.process(
            items,
            item => this.addToItem(item),
            15
        );
    }

    /**
     * 为商品添加变体序号（使用 API 数据）
     * @param itemElement API 提供的商品元素
     */
    addToItem(itemElement: ItemElement): void {
        try {
            const { element, variationsUl, variations } = itemElement;
            if (!variationsUl || !variations.length) return;

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
