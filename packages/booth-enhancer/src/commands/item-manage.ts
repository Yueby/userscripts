import { CommandContext } from "../types";
import { Config } from "../utils/config";
import { handleError } from "../utils/error";
import { Utils } from "../utils/utils";
import { PageCommand } from "./base";

export class ItemManageCommand extends PageCommand {
    private itemObserver: IntersectionObserver;

    constructor(context: CommandContext) {
        super(context);
        // 创建Intersection Observer
        this.itemObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const item = entry.target as HTMLElement;
                        this.processItem(item);
                        // 处理完成后停止观察该元素
                        this.itemObserver.unobserve(item);
                    }
                });
            },
            { threshold: 0.1 } // 当元素10%可见时触发
        );
    }

    shouldExecute(): boolean {
        return this.path === '/items' || this.path === '/items/';
    }

    execute(): void {
        super.execute();
        this.setupItemsObserver();
    }

    // 处理单个商品卡片
    private processItem(item: HTMLElement): void {
        try {
            // 添加复制按钮
            this.addButtonToItem(item);
            // 添加变体序号
            this.addVariationNumbersToItem(item);
            // 标记该元素已处理
            item.setAttribute('data-processed', 'true');
        } catch (error) {
            handleError(error);
        }
    }

    // 为单个商品添加变体序号
    private addVariationNumbersToItem(item: Element): void {
        const variationList = item.querySelector('.dashboard-items-variation');
        if (!variationList) return;

        const variations = variationList.querySelectorAll('.row');
        variations.forEach((variation, index) => {
            let numberSpan = variation.querySelector('.variation-number');
            const labelArea = variation.querySelector('.dashboard-items-variation-label');
            
            if (!labelArea) return;

            if (!numberSpan) {
                numberSpan = document.createElement('span');
                numberSpan.className = 'variation-number';
                (numberSpan as HTMLElement).style.cssText = 'margin-right: 8px; color: #666;';
                labelArea.insertBefore(numberSpan, labelArea.firstChild);
            }
            
            numberSpan.textContent = `#${index + 1}`;
        });

        // 监听变体列表的变化
        const observer = new MutationObserver(Utils.throttle((_mutations: MutationRecord[], _observer: MutationObserver) => {
            const needsUpdate = Array.from(variations).some((variation, index) => {
                const numberSpan = variation.querySelector('.variation-number');
                return !numberSpan || numberSpan.textContent !== `#${index + 1}`;
            });

            if (needsUpdate) {
                requestAnimationFrame(() => this.addVariationNumbersToItem(item));
            }
        }, Config.throttleDelay));

        observer.observe(variationList, {
            childList: true,
            subtree: false
        });

        // 将observer存储到item元素中，以便后续清理
        (item as any).variationObserver = observer;
    }

    private setupItemsObserver(): void {
        // 监听页面变化，处理新增的商品元素
        const pageObserver = new MutationObserver(Utils.throttle((_mutations: MutationRecord[], _observer: MutationObserver) => {
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

        pageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.context.observers.set('page', pageObserver);

        // 处理已存在的商品元素
        document.querySelectorAll('.item-wrapper').forEach(item => {
            if (!item.hasAttribute('data-processed')) {
                this.itemObserver.observe(item);
            }
        });
    }

    private addButtonToItem(item: HTMLElement): void {
        // 检查是否已经添加过按钮
        if (item.querySelector('.tag-copy-btn') || item.querySelector('.item-delete-btn')) return;

        // 添加删除按钮
        const itemId = item.getAttribute('data-id');
        if (!itemId) return;

        // 添加删除按钮
        const deleteBtn = document.createElement('a');
        deleteBtn.className = 'btn danger small item-delete-btn';
        deleteBtn.style.cssText = 'position: absolute; top: 20px; right: 20px; z-index: 10;';
        deleteBtn.innerHTML = '删除';
        deleteBtn.onclick = async (e) => {
            e.preventDefault();
            
            // 第一次确认
            if (!confirm('确定要删除这个商品吗？此操作不可恢复。')) return;
            
            // 第二次确认，显示商品ID
            const itemName = item.querySelector('.nav')?.textContent?.trim() || '未知商品';
            if (!confirm(`再次确认删除商品：\n${itemName}\nID: ${itemId}`)) return;

            try {
                // 获取CSRF token，使用正确的meta标签
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                if (!csrfToken) {
                    throw new Error('无法获取CSRF token');
                }

                const response = await fetch(`https://manage.booth.pm/items/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'accept': 'application/json, text/javascript, */*; q=0.01',
                        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                        'x-requested-with': 'XMLHttpRequest',
                        'x-csrf-token': csrfToken
                    },
                    referrer: window.location.href,
                    referrerPolicy: 'strict-origin-when-cross-origin',
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    item.remove();
                } else {
                    const errorText = await response.text();
                    console.log('删除失败响应:', errorText);  // 添加调试信息
                    throw new Error(`删除失败: ${response.status}\n${errorText}`);
                }
            } catch (error) {
                handleError(error, () => {
                    alert('删除商品失败，请刷新页面重试');
                });
            }
        };

        // 确保父元素有相对定位
        if (getComputedStyle(item).position === 'static') {
            item.style.position = 'relative';
        }
        item.appendChild(deleteBtn);

        // 添加复制标签按钮
        const tagList = item.querySelector('.dashboard-items-tags');
        const footerActions = item.querySelector('.dashboard-item-footer-actions');
        if (tagList && footerActions) {
            const copyBtn = document.createElement('a');
            copyBtn.className = 'btn calm small tag-copy-btn mr-8';
            copyBtn.innerHTML = '复制标签';
            copyBtn.onclick = (e) => {
                e.preventDefault();
                this.copyItemManageTags(tagList);
            };

            footerActions.insertBefore(copyBtn, footerActions.firstChild);
        }
    }

    private copyItemManageTags(tagList: Element): void {
        try {
            const tags = Array.from(tagList.querySelectorAll('.tag-text'))
                .map(tag => tag.textContent)
                .filter(Boolean);

            if (tags.length === 0) {
                alert('没有找到标签');
                return;
            }

            navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
                const copyBtn = tagList.closest('.item-wrapper')?.querySelector('.tag-copy-btn');
                if (copyBtn instanceof HTMLElement) {
                    Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
                }
            });
        } catch (error) {
            handleError(error);
        }
    }

    cleanup(): void {
        // 清理所有观察器
        const observer = this.context.observers.get('page');
        if (observer instanceof MutationObserver) {
            observer.disconnect();
            this.context.observers.delete('page');
        }

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

        // 移除所有已添加的按钮和序号
        document.querySelectorAll('.tag-copy-btn, .variation-number').forEach(el => el.remove());
    }
} 