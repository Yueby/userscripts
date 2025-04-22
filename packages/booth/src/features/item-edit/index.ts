
import { handleError } from "../../utils/error";
import { Simulate } from "../../utils/simulate";
import { Utils } from "../../utils/utils";
import { Feature } from "../base";

interface ProgressTip {
    container: HTMLDivElement;
    progressBar: HTMLDivElement;
    textElement: HTMLDivElement;
    updateProgress: (current: number, total: number, message?: string) => void;
    complete: (message: string) => void;
    remove: () => void;
}

/**
 * Booth网站商品编辑页面
 * 提供变体序号显示和标签管理功能
 */
export class ItemEditFeature extends Feature {
    shouldExecute(): boolean {
        return /^\/items\/\d+\/edit(_pre)?$/.test(this.path);
    }

    async execute(): Promise<void> {
        super.execute();
        this.addNumbers();
        this.addTagButtons();
    }

    // 变体序号功能
    private addNumbers(): void {
        // 查找所有的 ul.grid.gap-16 元素
        const allUlElements = document.querySelectorAll('ul.grid.gap-16');

        // 如果没有找到任何元素，设置观察者等待
        if (allUlElements.length === 0) {
            const observer = new MutationObserver((_, obs) => {
                if (document.querySelectorAll('ul.grid.gap-16').length > 0) {
                    obs.disconnect();
                    this.addNumbers();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            this.context.observers.set('variation-numbers-wait', observer);
            return;
        }

        // 记录处理的变体项总数
        let totalProcessed = 0;

        // 遍历每个ul元素
        allUlElements.forEach((variationList) => {
            // 检查这个ul是否包含变体项
            const hasVariationItems = variationList.querySelector('li .variation-box-head') !== null;

            if (!hasVariationItems) {
                return; // 跳过这个ul，继续foreach循环
            }

            // 查找所有变体项
            const variationItems = variationList.querySelectorAll('li');

            // 遍历当前ul中的所有变体项
            variationItems.forEach((li, index) => {
            // 先移除已存在的序号，避免重复添加
            const existingNumberSpan = li.querySelector('.variation-number');
            if (existingNumberSpan) {
                existingNumberSpan.remove();
            }

            // 查找标题容器 - 精确定位到您提供的HTML中的元素
            const titleContainer = li.querySelector('.variation-box-head .flex.items-center.gap-4');

            if (!titleContainer) {
                return;
            }

            // 创建序号元素
            const numberSpan = document.createElement('span');
            numberSpan.className = 'variation-number typography-14 inline-block font-semibold';
            numberSpan.style.cssText = 'margin-right: 8px; color: #666;';
            numberSpan.textContent = `#${index + 1}`;

            // 插入到flex容器的最前面
            titleContainer.insertBefore(numberSpan, titleContainer.firstChild);
                totalProcessed++;
            });
        });

        // 添加MutationObserver来监听整个文档的变化
        const observer = new MutationObserver((mutations) => {
            // 检查是否有变体项的变化
            const hasRelevantChanges = mutations.some(mutation => {
                // 检查是否有变体容器的变化
                const hasContainerChanges = Array.from(mutation.addedNodes).some(node =>
                    node instanceof HTMLElement &&
                    (node.querySelector('.variation-box-head') ||
                     node.querySelector('li[class*="group"][class*="relative"][class*="list-none"]'))
                );

                // 检查是否有li元素的变化
                const hasLiChanges = Array.from(mutation.addedNodes).some(node =>
                    node instanceof HTMLElement &&
                    (node.matches('li') || node.querySelector('li'))
                );

                // 检查是否有li元素被删除
                const hasLiRemoved = Array.from(mutation.removedNodes).some(node =>
                    node instanceof HTMLElement &&
                    (node.matches('li') || node.querySelector('li'))
                );

                return hasContainerChanges || hasLiChanges || hasLiRemoved;
            });

            if (hasRelevantChanges) {
                this.addNumbers();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 保存observer以便后续清理
        this.context.observers.set('variation-numbers', observer);
    }

    // 标签功能
    private addTagButtons(): void {
        const observer = new MutationObserver((_, obs) => {
            const inputContainer = document.querySelector('#item_tag .item-search-input__container');
            if (inputContainer) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'flex gap-2';
                buttonContainer.style.alignItems = 'center';
                buttonContainer.style.position = 'absolute';
                buttonContainer.style.right = '8px';
                buttonContainer.style.top = '50%';
                buttonContainer.style.transform = 'translateY(-50%)';

                // 复制按钮
                const copyBtn = document.createElement('a');
                copyBtn.className = 'btn calm small';
                copyBtn.innerHTML = '复制标签';
                copyBtn.onclick = () => this.copyTags();

                // 粘贴按钮
                const pasteBtn = document.createElement('a');
                pasteBtn.className = 'btn calm small';
                pasteBtn.innerHTML = '粘贴标签';
                pasteBtn.onclick = () => this.pasteTags();

                // 清空按钮
                const clearBtn = document.createElement('a');
                clearBtn.className = 'btn calm small';
                clearBtn.innerHTML = '清空标签';
                clearBtn.onclick = () => this.clearTags();

                buttonContainer.appendChild(copyBtn);
                buttonContainer.appendChild(pasteBtn);
                buttonContainer.appendChild(clearBtn);

                inputContainer.appendChild(buttonContainer);
                obs.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.context.observers.set('tag-buttons', observer);
    }

    private copyTags(): void {
        try {
            const tags = Array.from(document.querySelectorAll('#item_tag .bg-secondary500 .font-bold'))
                .map(tag => tag.textContent?.trim())
                .filter(Boolean);

            if (tags.length === 0) {
                alert('没有找到标签');
                return;
            }

            navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
                const copyBtn = document.querySelector('#item_tag .btn:first-child');
                if (copyBtn instanceof HTMLElement) {
                    Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
                }
            });
        } catch (error) {
            handleError(error);
        }
    }

    private createProgressTip(container: Element): ProgressTip {
        // 创建容器
        const tipContainer = document.createElement('div');
        tipContainer.style.cssText = 'margin-bottom: 12px; background: #f5f7fa; border-radius: 4px; padding: 12px; position: relative;';

        // 创建文本元素
        const textElement = document.createElement('div');
        textElement.style.cssText = 'color: #666; font-size: 14px; margin-bottom: 8px;';

        // 创建进度条容器
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.cssText = 'background: #e4e7ed; height: 6px; border-radius: 3px; overflow: hidden;';

        // 创建进度条
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: #409EFF;
            transition: width 0.3s ease;
            border-radius: 3px;
        `;

        // 组装DOM
        progressBarContainer.appendChild(progressBar);
        tipContainer.appendChild(textElement);
        tipContainer.appendChild(progressBarContainer);

        // 插入到DOM中
        const inputContainer = container.querySelector('.item-search-input__container');
        if (inputContainer?.parentElement) {
            inputContainer.parentElement.insertBefore(tipContainer, inputContainer);
        } else {
            container.insertBefore(tipContainer, container.firstChild);
        }

        // 返回控制对象
        return {
            container: tipContainer,
            progressBar: progressBar,
            textElement: textElement,
            updateProgress: (current: number, total: number, message?: string) => {
                const percentage = (current / total) * 100;
                progressBar.style.width = `${percentage}%`;
                textElement.textContent = message || `处理中... (${current}/${total})`;
            },
            complete: (message: string) => {
                progressBar.style.width = '100%';
                progressBar.style.background = '#67C23A';
                textElement.textContent = message;
                setTimeout(() => tipContainer.remove(), 2000);
            },
            remove: () => tipContainer.remove()
        };
    }

    private async pasteTags(): Promise<void> {
        try {
            const text = await navigator.clipboard.readText();
            const newTags = JSON.parse(text);

            if (!Array.isArray(newTags) || newTags.length === 0) {
                throw new Error('无效的标签数据');
            }

            const input = document.querySelector('.js-item-tags-array') as HTMLInputElement;
            if (!input) throw new Error('找不到标签输入框');

            const container = document.querySelector('#item_tag');
            if (!container) throw new Error('找不到标签容器');

            // 获取现有标签
            const existingTags = Array.from(document.querySelectorAll('#item_tag .bg-secondary500 .font-bold'))
                .map(tag => tag.textContent?.trim())
                .filter(Boolean) as string[];

            // 过滤出需要添加的新标签
            const tagsToAdd = newTags.filter(tag => !existingTags.includes(tag));

            if (tagsToAdd.length === 0) {
                alert('所有标签都已存在，无需添加');
                return;
            }

            const progress = this.createProgressTip(container);

            try {
                // 逐个添加新标签
                for (let i = 0; i < tagsToAdd.length; i++) {
                    progress.updateProgress(i + 1, tagsToAdd.length);

                    input.focus();
                    Simulate.input(input, tagsToAdd[i]);
                    await Utils.sleep(10);
                    Simulate.pressEnter(input);
                    await Utils.sleep(10);
                }

                progress.complete(`处理完成！已添加 ${tagsToAdd.length} 个新标签，跳过 ${newTags.length - tagsToAdd.length} 个已存在的标签。`);

                const pasteBtn = document.querySelector('#item_tag .btn:nth-child(2)');
                if (pasteBtn instanceof HTMLElement) {
                    Utils.updateButtonState(pasteBtn, true, pasteBtn.innerHTML);
                }
            } catch (error) {
                progress.remove();
                throw error;
            }
        } catch (error) {
            handleError(error, () => {
                alert('粘贴标签失败：' + (error instanceof Error ? error.message : String(error)));
            });
        }
    }

    private async clearTags(): Promise<void> {
        try {
            if (!confirm('确定要清空所有标签吗？')) return;

            const container = document.querySelector('#item_tag');
            if (!container) throw new Error('找不到标签容器');

            // 找到所有标签的删除按钮
            const deleteButtons = Array.from(document.querySelectorAll('#item_tag .bg-secondary500 a.flex pixiv-icon[name="32/BoothClose"]'));
            if (deleteButtons.length === 0) {
                alert('没有找到需要清空的标签');
                return;
            }

            const progress = this.createProgressTip(container);

            try {
                // 从后往前逐个删除标签
                for (let i = deleteButtons.length - 1; i >= 0; i--) {
                    progress.updateProgress(deleteButtons.length - i, deleteButtons.length);

                    const button = deleteButtons[i];
                    const clickableAnchor = button.closest('a');
                    if (clickableAnchor) {
                        clickableAnchor.click();
                        await Utils.sleep(1);
                    }
                }

                progress.complete(`处理完成！已清空 ${deleteButtons.length} 个标签。`);

                const clearBtn = document.querySelector('#item_tag .btn:nth-child(3)');
                if (clearBtn instanceof HTMLElement) {
                    Utils.updateButtonState(clearBtn, true, clearBtn.innerHTML);
                }
            } catch (error) {
                progress.remove();
                throw error;
            }
        } catch (error) {
            handleError(error);
        }
    }

    cleanup(): void {
        ['variation-numbers', 'variation-numbers-wait', 'tag-buttons'].forEach(observerName => {
            const observer = this.context.observers.get(observerName);
            if (observer instanceof MutationObserver) {
                observer.disconnect();
                this.context.observers.delete(observerName);
            }
        });

        const buttons = document.querySelectorAll('.btn.calm.small');
        buttons.forEach(button => {
            if (['复制标签', '粘贴标签', '清空标签'].includes(button.innerHTML)) {
                button.remove();
            }
        });
    }
}
