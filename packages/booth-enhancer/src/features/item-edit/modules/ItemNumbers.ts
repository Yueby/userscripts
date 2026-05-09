import { ItemEditAPI } from "../../../api/item-edit";
import { PageModule } from "../../PageModule";

/**
 * 项目序号功能模块
 * 为编辑页面的列表添加序号显示（支持变体列表和 section 列表）
 */
export class ItemNumbers extends PageModule<ItemEditAPI> {
    // 用强引用记录 observer 列表，确保 destroy 能清理干净
    private observers: MutationObserver[] = [];
    private observedContainers = new WeakSet<HTMLElement>();

    constructor(api: ItemEditAPI) {
        super(api);
    }

    protected initialize(): void {
        // 收集所有唯一的容器
        const containers = new Set<HTMLElement>();
        
        this.api.sections.forEach(section => containers.add(section.container));
        this.api.variations.forEach(variation => containers.add(variation.container));
        
        // 为每个容器添加序号
        containers.forEach(container => {
            this.addNumbersToList(container);
        });

        // 监听新增的元素
        this.api.onSectionAdded((section) => {
            if (!this.observedContainers.has(section.container)) {
                this.addNumbersToList(section.container);
            }
        });

        this.api.onVariationAdded((variation) => {
            if (!this.observedContainers.has(variation.container)) {
                this.addNumbersToList(variation.container);
            }
        });
    }

    /**
     * 销毁模块，断开所有 observer
     * （Booth 是 SPA，用户脚本目前不主动销毁，但保留此方法便于测试或未来需要）
     */
    destroy(): void {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
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
     * 设置列表观察器（每个容器只挂载一次）
     */
    private setupListObserver(ul: HTMLElement): void {
        if (this.observedContainers.has(ul)) return;
        
        const observer = new MutationObserver(() => {
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

        this.observers.push(observer);
        this.observedContainers.add(ul);
    }
}
