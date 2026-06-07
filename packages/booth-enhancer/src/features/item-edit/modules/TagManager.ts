import type { ItemEditAPI } from "../../../api/item-edit";
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
			subtree: true,
		});
	}

	/**
	 * 添加标签操作按钮
	 */
	private createCharcoalButton(
		text: string,
		onClick: () => void,
	): HTMLButtonElement {
		const button = document.createElement("button");
		button.className = "charcoal-button";
		button.setAttribute("data-variant", "Default");

		const inner = document.createElement("div");
		inner.className = "flex gap-4 items-center";

		const span = document.createElement("span");
		span.textContent = text;

		inner.appendChild(span);
		button.appendChild(inner);
		button.addEventListener("click", onClick);

		return button;
	}

	/**
	 * 短暂切换按钮文字为完成状态，然后自动恢复
	 */
	private flashButtonText(
		button: HTMLElement,
		text: string,
		duration = 1500,
	): void {
		const span = button.querySelector("span");
		if (!span) return;
		const original = span.textContent || "";
		span.textContent = text;
		setTimeout(() => {
			span.textContent = original;
		}, duration);
	}

	private addTagButtons(inputContainer: HTMLElement): void {
		if (inputContainer.querySelector(".tag-action-buttons")) return;

		const buttonContainer = document.createElement("div");
		buttonContainer.className = "tag-action-buttons";
		buttonContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

		buttonContainer.appendChild(
			this.createCharcoalButton("复制", () => this.copyTags()),
		);
		buttonContainer.appendChild(
			this.createCharcoalButton("粘贴", () => this.pasteTags()),
		);
		buttonContainer.appendChild(
			this.createCharcoalButton("清空", () => this.clearTags()),
		);

		// 插入到 inputContainer（combobox 父级 div.w-full）的后面作为同级元素
		inputContainer.insertAdjacentElement("afterend", buttonContainer);
	}

	/**
	 * 复制标签到剪贴板
	 */
	private copyTags(): void {
		try {
			const tags = this.api.getTagTexts();

			if (tags.length === 0) {
				toast.warning("没有找到标签");
				return;
			}

			navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
				const copyBtn = document.querySelector(
					".tag-action-buttons button:nth-child(1)",
				);
				if (copyBtn instanceof HTMLElement) {
					this.flashButtonText(copyBtn, "已完成");
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
				throw new Error("无效的标签数据");
			}

			const tagElements = this.api.tagElements;
			if (!tagElements) throw new Error("找不到标签容器");

			const { input, container } = tagElements;

			// 获取现有标签
			const existingTags = this.api.getTagTexts();

			// 过滤出需要添加的新标签
			const tagsToAdd = newTags.filter((tag) => !existingTags.includes(tag));

			if (tagsToAdd.length === 0) {
				toast.info("所有标签都已存在，无需添加");
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
					`处理完成！已添加 ${tagsToAdd.length} 个新标签，跳过 ${newTags.length - tagsToAdd.length} 个已存在的标签。`,
				);

				const pasteBtn = document.querySelector(
					".tag-action-buttons button:nth-child(2)",
				);
				if (pasteBtn instanceof HTMLElement) {
					this.flashButtonText(pasteBtn, "已完成");
				}
			} catch (error) {
				progress.remove();
				throw error;
			}
		} catch (error) {
			handleError(error, () => {
				toast.error(
					"粘贴标签失败：" +
						(error instanceof Error ? error.message : String(error)),
				);
			});
		}
	}

	/**
	 * 清空所有标签
	 */
	private async clearTags(): Promise<void> {
		try {
			const confirmed = window.confirm("确定要清空所有标签吗？");
			if (!confirmed) return;

			const tagElements = this.api.tagElements;
			if (!tagElements) throw new Error("找不到标签容器");

			const deleteButtons = this.api.getTagDeleteButtons();
			if (deleteButtons.length === 0) {
				toast.warning("没有找到需要清空的标签");
				return;
			}

			const progress = this.createProgressTip(tagElements.container);

			try {
				// 从后往前逐个删除标签
				for (let i = deleteButtons.length - 1; i >= 0; i--) {
					progress.updateProgress(
						deleteButtons.length - i,
						deleteButtons.length,
					);

					const button = deleteButtons[i];
					button.click();
					await Utils.sleep(1);
				}

				progress.complete(`处理完成！已清空 ${deleteButtons.length} 个标签。`);

				const clearBtn = document.querySelector(
					".tag-action-buttons button:nth-child(3)",
				);
				if (clearBtn instanceof HTMLElement) {
					this.flashButtonText(clearBtn, "已完成");
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
		const tipContainer = document.createElement("div");
		tipContainer.style.cssText = `
            margin-bottom: 12px;
            background: #f5f7fa;
            border-radius: 4px;
            padding: 12px;
            position: relative;
        `;

		// 创建文本元素
		const textElement = document.createElement("div");
		textElement.style.cssText =
			"color: #666; font-size: 14px; margin-bottom: 8px;";

		// 创建进度条容器
		const progressBarContainer = document.createElement("div");
		progressBarContainer.style.cssText = `
            background: #e4e7ed;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
        `;

		// 创建进度条
		const progressBar = document.createElement("div");
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

		// 插入到 combobox 所在容器的上方
		const combobox = container.querySelector('[role="combobox"]');
		const inputWrapper = combobox?.closest(".w-full") as HTMLElement | null;
		if (inputWrapper?.parentElement) {
			inputWrapper.parentElement.insertBefore(tipContainer, inputWrapper);
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
				progressBar.style.width = "100%";
				progressBar.style.background = "#67C23A";
				textElement.textContent = message;
				setTimeout(() => tipContainer.remove(), 2000);
			},
			remove: () => tipContainer.remove(),
		};
	}
}
