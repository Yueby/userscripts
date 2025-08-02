import { handleError } from "../utils/error";
import { Utils } from "../utils/utils";
import { Simulate } from "../utils/simulate";
import { PageCommand } from "./base";

export class ItemEditCommand extends PageCommand {
    shouldExecute(): boolean {
        return /^\/items\/\d+\/edit(_pre)?$/.test(this.path);
    }

    execute(): void {
        super.execute();
        this.addVariationNumbers();
        this.addTagButtons();
    }

    // 变体序号功能
    private addVariationNumbers(): void {
        const ul = document.querySelector('ul.grid.gap-16');
        if (!ul) {
            // 如果ul不存在，等待它出现
            const observer = new MutationObserver((_, obs) => {
                const ul = document.querySelector('ul.grid.gap-16');
                if (ul) {
                    obs.disconnect();
                    this.addVariationNumbers();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // 保存observer以便后续清理
            this.context.observers.set('variation-numbers-wait', observer);
            return;
        }

        const lis = ul.querySelectorAll(':scope > li');
        lis.forEach((li, index) => {
            let numberSpan: HTMLElement | null = li.querySelector('.variation-number');
            const titleContainer = li.querySelector('.variation-box-head .flex.items-center.gap-4');

            if (!titleContainer) return;

            if (!numberSpan) {
                numberSpan = document.createElement('span');
                numberSpan.className = 'variation-number typography-14 inline-block font-semibold';
                numberSpan.style.cssText = 'margin-right: 8px; color: #666;';
                // 插入到flex容器的最前面
                titleContainer.insertBefore(numberSpan, titleContainer.firstChild);
            }

            numberSpan.textContent = `#${index + 1}`;
        });

        // 添加MutationObserver来监听整个文档的变化
        const observer = new MutationObserver((mutations) => {
            // 检查是否有ul或li的变化
            const hasRelevantChanges = mutations.some(mutation => {
                // 检查是否有ul元素的变化
                const hasUlChanges = Array.from(mutation.addedNodes).some(node => 
                    node instanceof HTMLElement && 
                    (node.matches('ul.grid.gap-16') || node.querySelector('ul.grid.gap-16'))
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

                return hasUlChanges || hasLiChanges || hasLiRemoved;
            });

            if (hasRelevantChanges) {
                this.addVariationNumbers();
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

    private async pasteTags(): Promise<void> {
        try {
            const text = await navigator.clipboard.readText();
            const tags = JSON.parse(text);

            if (!Array.isArray(tags) || tags.length === 0) {
                throw new Error('无效的标签数据');
            }

            const input = document.querySelector('.js-item-tags-array') as HTMLInputElement;
            if (!input) {
                throw new Error('找不到标签输入框');
            }

            // 清空现有标签
            const deleteButtons = Array.from(document.querySelectorAll('#item_tag .bg-secondary500 a.flex pixiv-icon[name="32/BoothClose"]'));
            // 从后往前逐个删除标签
            for (let i = deleteButtons.length - 1; i >= 0; i--) {
                const button = deleteButtons[i];
                const clickableAnchor = button.closest('a');
                if (clickableAnchor) {
                    clickableAnchor.click();
                    // 等待删除操作完成
                    await Utils.sleep(20);
                }
            }

            // 逐个添加标签
            for (const tag of tags) {
                // 聚焦输入框
                input.focus();

                // 使用Simulate工具类模拟真实输入
                Simulate.input(input, tag);

                // 等待React更新状态
                await Utils.sleep(10);

                // 使用Simulate工具类模拟回车键
                Simulate.pressEnter(input);

                // 等待标签添加完成
                await Utils.sleep(10);
            }

            const pasteBtn = document.querySelector('#item_tag .btn:nth-child(2)');
            if (pasteBtn instanceof HTMLElement) {
                Utils.updateButtonState(pasteBtn, true, pasteBtn.innerHTML);
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

            // 找到所有标签的删除按钮
            const deleteButtons = Array.from(document.querySelectorAll('#item_tag .bg-secondary500 a.flex pixiv-icon[name="32/BoothClose"]'));
            
            // 从后往前逐个删除标签
            for (let i = deleteButtons.length - 1; i >= 0; i--) {
                const button = deleteButtons[i];
                const clickableAnchor = button.closest('a');
                if (clickableAnchor) {
                    clickableAnchor.click();
                    // 等待删除操作完成
                    await Utils.sleep(10);
                }
            }

            const clearBtn = document.querySelector('#item_tag .btn:nth-child(3)');
            if (clearBtn instanceof HTMLElement) {
                Utils.updateButtonState(clearBtn, true, clearBtn.innerHTML);
            }
        } catch (error) {
            handleError(error);
        }
    }

    cleanup(): void {
        ['variation', 'page', 'tag-buttons'].forEach(observerName => {
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