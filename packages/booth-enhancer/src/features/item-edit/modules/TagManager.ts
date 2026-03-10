import { ItemEditAPI } from "../../../api/item-edit";
import { handleError } from "../../../utils/error";
import { Simulate } from "../../../utils/simulate";
import { Utils } from "../../../utils/utils";
import { PageModule } from "../../PageModule";
import { toast } from "../components/ui";

interface ProgressTip {
    container: HTMLDivElement;
    progressBar: HTMLDivElement;
    textElement: HTMLDivElement;
    updateProgress: (current: number, total: number, message?: string) => void;
    complete: (message: string) => void;
    remove: () => void;
}

/**
 * 标签管理功能模块
 * 提供标签的复制、粘贴、清空功能
 */
export class TagManager extends PageModule<ItemEditAPI> {

    constructor(api: ItemEditAPI) {
        super(api);
    }

    protected initialize(): void {
        // 等待标签容器出现后添加按钮
        this.waitForTagContainer();
    }

    /**
     * 等待标签容器出现
     */
    private waitForTagContainer(): void {
        const tagElements = this.api.tagElements;
        
        if (tagElements) {
            this.addTagButtons(tagElements.inputContainer);
            return;
        }

        // 使用 MutationObserver 等待容器出现
        const observer = new MutationObserver(() => {
            const elements = this.api.tagElements;
            if (elements) {
                this.addTagButtons(elements.inputContainer);
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 添加标签操作按钮
     */
    private createCharcoalButton(text: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        button.className = 'charcoal-button';
        button.setAttribute('data-variant', 'Default');

        const inner = document.createElement('div');
        inner.className = 'flex gap-4 items-center';

        const span = document.createElement('span');
        span.textContent = text;

        inner.appendChild(span);
        button.appendChild(inner);
        button.addEventListener('click', onClick);

        return button;
    }

    private addTagButtons(inputContainer: HTMLElement): void {
        if (inputContainer.querySelector('.tag-action-buttons')) return;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'tag-action-buttons';
        buttonContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
        `;

        buttonContainer.appendChild(this.createCharcoalButton('复制', () => this.copyTags()));
        buttonContainer.appendChild(this.createCharcoalButton('粘贴', () => this.pasteTags()));
        buttonContainer.appendChild(this.createCharcoalButton('清空', () => this.clearTags()));

        inputContainer.appendChild(buttonContainer);
    }

    /**
     * 复制标签到剪贴板
     */
    private copyTags(): void {
        try {
            const tags = this.api.getTagTexts();

            if (tags.length === 0) {
                toast.warning('没有找到标签');
                return;
            }

            navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
                const copyBtn = document.querySelector('.tag-action-buttons button:nth-child(1)');
                if (copyBtn instanceof HTMLElement) {
                    Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
                }
            });
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * 从剪贴板粘贴标签
     */
    private async pasteTags(): Promise<void> {
        try {
            const text = await navigator.clipboard.readText();
            const newTags = JSON.parse(text);

            if (!Array.isArray(newTags) || newTags.length === 0) {
                throw new Error('无效的标签数据');
            }

            const tagElements = this.api.tagElements;
            if (!tagElements) throw new Error('找不到标签容器');

            const { input, container } = tagElements;

            // 获取现有标签
            const existingTags = this.api.getTagTexts();

            // 过滤出需要添加的新标签
            const tagsToAdd = newTags.filter(tag => !existingTags.includes(tag));

            if (tagsToAdd.length === 0) {
                toast.info('所有标签都已存在，无需添加');
                return;
            }

            const progress = this.createProgressTip(container);

            try {
                // 逐个添加新标签
                for (let i = 0; i < tagsToAdd.length; i++) {
                    progress.updateProgress(i + 1, tagsToAdd.length);

                    input.focus();
                    Simulate.input(input, tagsToAdd[i]);
                    await Utils.sleep(1);
                    Simulate.pressEnter(input);
                    await Utils.sleep(1);
                }

                progress.complete(
                    `处理完成！已添加 ${tagsToAdd.length} 个新标签，跳过 ${newTags.length - tagsToAdd.length} 个已存在的标签。`
                );

                const pasteBtn = document.querySelector('.tag-action-buttons button:nth-child(2)');
                if (pasteBtn instanceof HTMLElement) {
                    Utils.updateButtonState(pasteBtn, true, pasteBtn.innerHTML);
                }
            } catch (error) {
                progress.remove();
                throw error;
            }
        } catch (error) {
            handleError(error, () => {
                toast.error('粘贴标签失败：' + (error instanceof Error ? error.message : String(error)));
            });
        }
    }

    /**
     * 清空所有标签
     */
    private async clearTags(): Promise<void> {
        try {
            const confirmed = window.confirm('确定要清空所有标签吗？');
            if (!confirmed) return;

            const tagElements = this.api.tagElements;
            if (!tagElements) throw new Error('找不到标签容器');

            const deleteButtons = this.api.getTagDeleteButtons();
            if (deleteButtons.length === 0) {
                toast.warning('没有找到需要清空的标签');
                return;
            }

            const progress = this.createProgressTip(tagElements.container);

            try {
                // 从后往前逐个删除标签
                for (let i = deleteButtons.length - 1; i >= 0; i--) {
                    progress.updateProgress(deleteButtons.length - i, deleteButtons.length);

                    const button = deleteButtons[i];
                    button.click();
                    await Utils.sleep(1);
                }

                progress.complete(`处理完成！已清空 ${deleteButtons.length} 个标签。`);

                const clearBtn = document.querySelector('.tag-action-buttons button:nth-child(3)');
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

    /**
     * 创建进度提示
     */
    private createProgressTip(container: Element): ProgressTip {
        // 创建容器
        const tipContainer = document.createElement('div');
        tipContainer.style.cssText = `
            margin-bottom: 12px;
            background: #f5f7fa;
            border-radius: 4px;
            padding: 12px;
            position: relative;
        `;

        // 创建文本元素
        const textElement = document.createElement('div');
        textElement.style.cssText = 'color: #666; font-size: 14px; margin-bottom: 8px;';

        // 创建进度条容器
        const progressBarContainer = document.createElement('div');
        progressBarContainer.style.cssText = `
            background: #e4e7ed;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
        `;

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

        // 插入到输入框区域上方（tag 列表和输入区域之间）
        const inputWrapper = container.querySelector('div.w-full.mt-8.flex.gap-8.flex-col');
        if (inputWrapper) {
            inputWrapper.insertBefore(tipContainer, inputWrapper.firstChild);
        } else {
            container.appendChild(tipContainer);
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
}

