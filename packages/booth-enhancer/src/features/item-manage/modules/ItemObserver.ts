import { FeatureContext } from "../../../types";
import { Config } from "../../../utils/config";
import { Utils } from "../../../utils/utils";

/**
 * 商品观察器模块
 * 负责监听页面变化，处理新增的商品元素
 */
export class ItemObserver {
    private context: FeatureContext;
    private itemObserver: IntersectionObserver;
    private pageObserver: MutationObserver | null = null;

    constructor(context: FeatureContext) {
        this.context = context;
        // 创建Intersection Observer
        this.itemObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const item = entry.target as HTMLElement;
                        this.onItemIntersect(item);
                        // 处理完成后停止观察该元素
                        this.itemObserver.unobserve(item);
                    }
                });
            },
            { threshold: 0.1 } // 当元素10%可见时触发
        );
    }

    /**
     * 设置页面观察器
     * @param onItemProcess 处理商品元素的回调函数
     */
    setupPageObserver(onItemProcess: (item: HTMLElement) => void): void {
        // 监听页面变化，处理新增的商品元素
        this.pageObserver = new MutationObserver(Utils.throttle((_mutations: MutationRecord[], _observer: MutationObserver) => {
            _mutations.forEach((mutation: MutationRecord) => {
                mutation.addedNodes.forEach((node: Node) => {
                    if (node.nodeType === 1) { // 元素节点
                        // 检查新增的元素是否是商品容器或包含商品容器
                        const items = (node as Element).matches('.item-wrapper') ?
                            [node] :
                            Array.from((node as Element).querySelectorAll('.item-wrapper'));

                        items.forEach(item => {
                            // 如果元素没有processed标记，则进行处理
                            if (!(item as Element).hasAttribute('data-processed')) {
                                this.itemObserver.observe(item as Element);
                            }
                        });
                    }
                });
            });
        }, Config.throttleDelay));

        this.pageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.context.observers.set('page', this.pageObserver);

        // 处理已存在的商品元素
        document.querySelectorAll('.item-wrapper').forEach(item => {
            if (!item.hasAttribute('data-processed')) {
                this.itemObserver.observe(item);
            }
        });

        // 保存处理回调
        (this as any).onItemProcess = onItemProcess;
    }

    /**
     * 商品元素进入视口时的处理
     */
    private onItemIntersect(item: HTMLElement): void {
        const onItemProcess = (this as any).onItemProcess;
        if (onItemProcess) {
            onItemProcess(item);
        }
    }

    /**
     * 清理观察器
     */
    cleanup(): void {
        // 清理页面观察器
        if (this.pageObserver) {
            this.pageObserver.disconnect();
            this.context.observers.delete('page');
            this.pageObserver = null;
        }

        // 清理商品观察器
        if (this.itemObserver) {
            this.itemObserver.disconnect();
        }

        // 清理每个商品卡片的变体观察器
        document.querySelectorAll('.item-wrapper').forEach(item => {
            const variationObserver = (item as any).variationObserver;
            if (variationObserver instanceof MutationObserver) {
                variationObserver.disconnect();
                delete (item as any).variationObserver;
            }
        });
    }
}