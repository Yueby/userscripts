import { ItemEditAPI } from "../../../api/item-edit";
import { PageModule } from "../../PageModule";

/**
 * 项目序号功能模块
 * 为编辑页面的列表添加序号显示（支持变体列表和 section 列表）
 */
export class ItemNumbers extends PageModule<ItemEditAPI> {
    private _observedContainers?: WeakMap<HTMLElement, MutationObserver>;

    private get observedContainers(): WeakMap<HTMLElement, MutationObserver> {
        if (!this._observedContainers) {
            this._observedContainers = new WeakMap();
        }
        return this._observedContainers;
    }

    constructor(api: ItemEditAPI) {
        super(api);
    }

    protected initialize(api: ItemEditAPI): void {
        // 收集所有唯一的容器
        const containers = new Set<HTMLElement>();
        
        api.sections.forEach(section => containers.add(section.container));
        api.variations.forEach(variation => containers.add(variation.container));
        
        // 为每个容器添加序号
        containers.forEach(container => {
            this.addNumbersToList(container);
        });

        // 监听新增的元素
        api.onSectionAdded((section) => {
            // 检查是否已经为该容器设置了观察器
            if (!this.observedContainers.has(section.container)) {
                this.addNumbersToList(section.container);
            }
        });

        api.onVariationAdded((variation) => {
            // 检查是否已经为该容器设置了观察器
            if (!this.observedContainers.has(variation.container)) {
                this.addNumbersToList(variation.container);
            }
        });
    }

    /**
     * 为列表添加序号
     */
    private addNumbersToList(ul: HTMLElement): void {
        // 获取直接子元素 li
        const items = Array.from(ul.children).filter(
            child => child.tagName.toLowerCase() === 'li'
        );

        // 为每个列表项添加序号
        items.forEach((li, index) => {
            this.addNumberToItem(li as HTMLElement, index + 1);
        });

        // 监听该列表的变化
        this.setupListObserver(ul);
    }

    /**
     * 为单个列表项添加序号
     */
    private addNumberToItem(li: HTMLElement, number: number): void {
        // 移除已存在的序号
        const existingNumber = li.querySelector('.variation-number');
        existingNumber?.remove();

        // 查找标题容器
        const titleContainer = li.querySelector('.variation-box-head .flex.items-center.gap-4');
        if (!titleContainer) return;

        // 创建序号元素
        const numberSpan = document.createElement('span');
        numberSpan.className = 'variation-number typography-14 inline-block font-semibold';
        numberSpan.style.cssText = 'margin-right: 8px; color: #666;';
        numberSpan.textContent = `#${number}`;

        // 插入到标题容器最前面
        titleContainer.insertBefore(numberSpan, titleContainer.firstChild);
    }

    /**
     * 设置列表观察器
     */
    private setupListObserver(ul: HTMLElement): void {
        // 如果已经有观察器，先断开
        const existingObserver = this.observedContainers.get(ul);
        if (existingObserver) {
            existingObserver.disconnect();
        }

        const observer = new MutationObserver(() => {
            // 重新为列表中的所有项添加序号
            const items = Array.from(ul.children).filter(
                child => child.tagName.toLowerCase() === 'li'
            );

            items.forEach((li, index) => {
                this.addNumberToItem(li as HTMLElement, index + 1);
            });
        });

        observer.observe(ul, {
            childList: true,
            subtree: false
        });

        // 将观察器存储到 WeakMap 中
        this.observedContainers.set(ul, observer);
    }
}
