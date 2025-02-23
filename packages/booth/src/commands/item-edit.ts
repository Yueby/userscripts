import { Config } from "../utils/config";
import { handleError } from "../utils/error";
import { Utils } from "../utils/utils";
import { PageCommand } from "./base";


export class ItemEditCommand extends PageCommand {
    shouldExecute(): boolean {
        return /^\/items\/\d+\/edit(_pre)?$/.test(this.path);
    }

    execute(): void {
        super.execute();
        this.addVariationNumbers();
        this.setupVariationObserver();
        this.addTagButtons();
    }

    // 变体序号功能
    private addVariationNumbers(): void {
        const variations = document.querySelectorAll('.js-variation');
        variations.forEach((variation, index) => {
            let numberSpan: HTMLElement | null = variation.querySelector('.variation-number');
            const titleArea: HTMLElement | null = variation.querySelector('.u-flex-1.handle');

            if (!titleArea) return;

            if (!numberSpan) {
                numberSpan = document.createElement('span');
                numberSpan.className = 'variation-number';
                numberSpan.style.cssText = 'margin-right: 8px; color: #666;';
                titleArea.insertBefore(numberSpan, titleArea.firstChild);
            }

            numberSpan.textContent = `#${index + 1}`;
        });
    }

    private setupVariationObserver(): void {
        const pageObserver = new MutationObserver(Utils.throttle((_mutations: MutationRecord[], _observer: MutationObserver) => {
            const variations = document.querySelector('.js-variations');
            const hasObserver = this.context.observers.has('variation');

            if (variations && !hasObserver) {
                this.setupVariationsObserver(variations);
                this.addVariationNumbers();
            } else if (!variations && hasObserver) {
                const observer = this.context.observers.get('variation');
                if (observer instanceof MutationObserver) {
                    observer.disconnect();
                }
                this.context.observers.delete('variation');
                document.querySelectorAll('.variation-number').forEach(span => span.remove());
            }
        }, Config.throttleDelay));

        pageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.context.observers.set('page', pageObserver);

        const variations = document.querySelector('.js-variations');
        if (variations) {
            this.setupVariationsObserver(variations);
            this.addVariationNumbers();
        }
    }

    private setupVariationsObserver(variations: Element): void {
        const observer = new MutationObserver(Utils.throttle(() => {
            const needsUpdate = Array.from(variations.children).some((variation, index) => {
                const numberSpan = variation.querySelector('.variation-number');
                return !numberSpan || numberSpan.textContent !== `#${index + 1}`;
            });

            if (needsUpdate) {
                requestAnimationFrame(() => this.addVariationNumbers());
            }
        }, Config.throttleDelay));

        observer.observe(variations, {
            childList: true,
            subtree: false
        });

        this.context.observers.set('variation', observer);
    }

    // 标签功能
    private addTagButtons(): void {
        const tagLabel = document.querySelector('#item_tag .u-tpg-label');
        if (!tagLabel) return;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'u-d-inline-block u-ml-300';
        buttonContainer.style.display = 'inline-flex';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.verticalAlign = 'middle';

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

        tagLabel.parentNode?.insertBefore(buttonContainer, tagLabel.nextSibling);
    }

    private copyTags(): void {
        try {
            const tags = Array.from(document.querySelectorAll('.selectize-input .item'))
                .map(item => item.getAttribute('data-value'))
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

            if (!Array.isArray(tags)) {
                throw new Error('无效的标签数据');
            }

            const select = document.querySelector('.js-item-tags-array');
            if (!select || !(select as any).selectize) {
                throw new Error('找不到标签输入框');
            }

            (select as any).selectize.clear();
            tags.forEach(tag => {
                (select as any).selectize.addOption({ value: tag, text: tag });
                (select as any).selectize.addItem(tag);
            });

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

    private clearTags(): void {
        try {
            if (!confirm('确定要清空所有标签吗？')) return;

            const select = document.querySelector('.js-item-tags-array');
            if (!select || !(select as any).selectize) {
                throw new Error('找不到标签输入框');
            }

            (select as any).selectize.clear();

            const clearBtn = document.querySelector('#item_tag .btn:nth-child(3)');
            if (clearBtn instanceof HTMLElement) {
                Utils.updateButtonState(clearBtn, true, clearBtn.innerHTML);
            }
        } catch (error) {
            handleError(error);
        }
    }

    cleanup(): void {
        ['variation', 'page'].forEach(observerName => {
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