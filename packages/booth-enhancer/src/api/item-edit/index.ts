import { Simulate } from "../../utils/simulate";
import { BaseAPI } from "../BaseAPI";
import {
  ItemEditData,
  ItemEditSectionElement,
  ItemEditVariationElement,
  TagData,
  TagElements,
} from "./types";

/**
 * 商品编辑页面API
 * 提供完整的商品编辑数据访问
 * 自动识别页面URL：https://manage.booth.pm/items/:id/edit 或 edit_pre
 */
export class ItemEditAPI extends BaseAPI<ItemEditAPI> {
  private _data: ItemEditData = {
    nameInput: null,
    descriptionTextarea: null,
    sections: [],
    variations: [],
    tags: [],
    tagElements: null,
  };

  private _newSectionCallback?: (section: ItemEditSectionElement) => void;
  private _newVariationCallback?: (variation: ItemEditVariationElement) => void;

  constructor() {
    super();
  }

  /**
   * 判断是否应该在当前页面激活
   */
  protected shouldActivate(): boolean {
    const path = window.location.pathname;
    return /^\/items\/\d+\/edit(_pre)?$/.test(path);
  }

  /**
   * 等待名称输入框出现并填充数据
   */
  private waitForElements(timeout: number = 10000): Promise<void> {
    return new Promise((resolve) => {
      // 检查名称输入框是否存在且有值
      const checkNameInput = (): boolean => {
        const nameInput = document.querySelector(
          "#name input"
        ) as HTMLInputElement;

        // 名称输入框必须存在且有值（商品名称不可能为空）
        return nameInput && nameInput.value.trim().length > 0;
      };

      if (checkNameInput()) {
        resolve();
        return;
      }

      const timer = setTimeout(() => {
        observer.disconnect();
        resolve(); // 超时也继续，避免阻塞
      }, timeout);

      const observer = new MutationObserver(() => {
        if (checkNameInput()) {
          clearTimeout(timer);
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  /**
   * 加载数据
   * 等待关键元素出现后再加载
   */
  protected async load(): Promise<void> {
    // 等待关键元素出现
    await this.waitForElements();

    // 加载所有数据
    this.loadName();
    this.loadDescription();
    this.loadSectionsAndVariations();
    this.loadTagElements();
    this.setupListObserver();
  }

  /**
   * 加载商品名称
   */
  private loadName(): void {
    const input = document.querySelector("#name input") as HTMLInputElement;
    this._data.nameInput = input || null;
  }

  /**
   * 加载商品描述
   */
  private loadDescription(): void {
    const textarea = document.querySelector(
      "#description textarea"
    ) as HTMLTextAreaElement;
    this._data.descriptionTextarea = textarea || null;
  }

  /**
   * 加载 Section 和 Variation 列表
   */
  private loadSectionsAndVariations(): void {
    this._data.sections = [];
    this._data.variations = [];

    const ulElements = document.querySelectorAll("ul.grid.gap-16");

    ulElements.forEach((ul) => {
      const container = ul as HTMLElement;
      // 检查是否包含变体项
      if (container.querySelector("li .variation-box-head")) {
        const items = Array.from(container.children).filter(
          (child) => child.tagName.toLowerCase() === "li"
        ) as HTMLElement[];

        // 根据父级 section 特征判断类型
        const isSection = this.isSectionList(container);

        // 为每个 li 创建元素对象
        items.forEach((item) => {
          if (isSection) {
            // 解析 Section 的 headline 和 body
            const headlineInput = item.querySelector(
              "input.charcoal-text-field-input"
            ) as HTMLInputElement;
            const bodyTextarea = item.querySelector(
              "textarea.charcoal-text-area-textarea"
            ) as HTMLTextAreaElement;

            this._data.sections.push({
              element: item,
              container,
              headlineInput,
              bodyTextarea,
            });
          } else {
            // 解析 Variation 的字段
            const nameContainer = item.querySelector(
              'div[id^="variationName-"]'
            );
            const priceContainer = item.querySelector(
              'div[id^="variationDigitalPrice-"]'
            );

            const nameInput = nameContainer?.querySelector(
              "input.charcoal-text-field-input"
            ) as HTMLInputElement | null;
            const digitalPriceInput = priceContainer?.querySelector(
              "input.charcoal-text-field-input"
            ) as HTMLInputElement | null;

            this._data.variations.push({
              element: item,
              container,
              nameInput,
              priceInput: digitalPriceInput,
            });
          }
        });
      }
    });
  }

  /**
   * 判断是否为 Section 列表
   */
  private isSectionList(ul: HTMLElement): boolean {
    const section = ul.closest("section");
    if (!section) return false;

    // Section 列表的 section 有这些特定类名
    return (
      section.classList.contains("bg-white") &&
      section.classList.contains("desktop:px-24") &&
      section.classList.contains("desktop:pt-24") &&
      section.classList.contains("desktop:rounded-t-4")
    );
  }

  /**
   * 加载标签元素
   */
  private loadTagElements(): void {
    const container = document.querySelector("#item_tag") as HTMLElement;
    const input = document.querySelector(
      ".js-item-tags-array"
    ) as HTMLInputElement;
    const inputContainer = document.querySelector(
      "#item_tag .item-search-input__container"
    ) as HTMLElement;

    if (container && input && inputContainer) {
      this._data.tagElements = {
        container,
        input,
        inputContainer,
      };
    }
  }

  /**
   * 设置列表观察器，监听新增的列表
   */
  private setupListObserver(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) {
            // 检查是否是新的列表容器
            if (
              node.tagName === "UL" &&
              node.classList.contains("grid") &&
              node.classList.contains("gap-16") &&
              node.querySelector("li .variation-box-head")
            ) {
              const container = node;
              const items = Array.from(container.children).filter(
                (child) => child.tagName.toLowerCase() === "li"
              ) as HTMLElement[];

              const isSection = this.isSectionList(container);

              // 为每个 li 创建元素对象并触发回调
              items.forEach((item) => {
                if (isSection) {
                  // 解析 Section 的 headline 和 body
                  const headlineInput = item.querySelector(
                    "input.charcoal-text-field-input"
                  ) as HTMLInputElement;
                  const bodyTextarea = item.querySelector(
                    "textarea.charcoal-text-area-textarea"
                  ) as HTMLTextAreaElement;

                  const sectionElement = {
                    element: item,
                    container,
                    headlineInput,
                    bodyTextarea,
                  };
                  this._data.sections.push(sectionElement);
                  this._newSectionCallback?.(sectionElement);
                } else {
                  // 解析 Variation 的字段
                  const nameContainer = item.querySelector(
                    'div[id^="variationName-"]'
                  );
                  const priceContainer = item.querySelector(
                    'div[id^="variationDigitalPrice-"]'
                  );

                  const nameInput = nameContainer?.querySelector(
                    "input.charcoal-text-field-input"
                  ) as HTMLInputElement | null;
                  const priceInput = priceContainer?.querySelector(
                    "input.charcoal-text-field-input"
                  ) as HTMLInputElement | null;

                  const variationElement = {
                    element: item,
                    container,
                    nameInput,
                    priceInput,
                  };
                  this._data.variations.push(variationElement);
                  this._newVariationCallback?.(variationElement);
                }
              });
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 获取完整的商品编辑数据
   */
  get data(): ItemEditData {
    // 实时更新 tags
    this._data.tags = this.getTags();
    return { ...this._data };
  }

  /**
   * 获取所有 Section 元素
   */
  get sections(): ItemEditSectionElement[] {
    return [...this._data.sections];
  }

  /**
   * 获取所有 Variation 元素
   */
  get variations(): ItemEditVariationElement[] {
    return [...this._data.variations];
  }

  /**
   * 获取标签元素
   */
  get tagElements(): TagElements | null {
    return this._data.tagElements;
  }

  /**
   * 监听新增的 Section 元素
   */
  onSectionAdded(callback: (section: ItemEditSectionElement) => void): void {
    this._newSectionCallback = callback;
  }

  /**
   * 监听新增的 Variation 元素
   */
  onVariationAdded(
    callback: (variation: ItemEditVariationElement) => void
  ): void {
    this._newVariationCallback = callback;
  }

  /**
   * 获取当前所有标签数据
   */
  getTags(): TagData[] {
    const tags: TagData[] = [];
    const tagElements = document.querySelectorAll(
      "#item_tag .bg-secondary500 .font-bold"
    );

    tagElements.forEach((element) => {
      const text = element.textContent?.trim();
      if (text) {
        tags.push({
          text,
          element: element as HTMLElement,
        });
      }
    });

    return tags;
  }

  /**
   * 获取标签文本列表
   */
  getTagTexts(): string[] {
    return this.getTags().map((tag) => tag.text);
  }

  /**
   * 检查标签是否存在
   */
  hasTag(tagText: string): boolean {
    return this.getTagTexts().includes(tagText);
  }

  /**
   * 获取标签删除按钮
   */
  getTagDeleteButtons(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll(
        '#item_tag .bg-secondary500 a.flex pixiv-icon[name="32/BoothClose"]'
      )
    )
      .map((icon) => icon.closest("a") as HTMLElement)
      .filter(Boolean);
  }

  /**
   * 获取/设置商品名
   */
  get name(): string {
    return this._data.nameInput?.value || "";
  }

  set name(value: string) {
    if (!this._data.nameInput) {
      console.error("找不到商品名输入框");
      return;
    }

    Simulate.input(this._data.nameInput, value);
  }

  /**
   * 获取/设置商品描述
   */
  get description(): string {
    return this._data.descriptionTextarea?.value || "";
  }

  set description(value: string) {
    if (!this._data.descriptionTextarea) {
      console.error("找不到商品描述文本域");
      return;
    }

    Simulate.input(this._data.descriptionTextarea, value);
  }

  /**
   * 设置商品名（别名）
   */
  setName(value: string): void {
    this.name = value;
  }

  /**
   * 设置商品描述（别名）
   */
  setDescription(value: string): void {
    this.description = value;
  }

  /**
   * 更新指定 Section
   */
  updateSection(index: number, data: { headline?: string; body?: string }): void {
    const section = this._data.sections[index];
    if (!section) return;

    if (data.headline !== undefined && section.headlineInput) {
      Simulate.input(section.headlineInput, data.headline);
    }
    if (data.body !== undefined && section.bodyTextarea) {
      Simulate.input(section.bodyTextarea, data.body);
    }
  }

  /**
   * 更新指定 Variation
   */
  updateVariation(index: number, data: { name?: string; price?: string }): void {
    const variation = this._data.variations[index];
    if (!variation) return;

    if (data.name !== undefined && variation.nameInput) {
      Simulate.input(variation.nameInput, data.name);
    }
    if (data.price !== undefined && variation.priceInput) {
      Simulate.input(variation.priceInput, data.price);
    }
  }

  /**
   * 批量添加 Tags
   */
  async addTags(tags: string[]): Promise<void> {
    if (!this._data.tagElements) return;

    const { input, inputContainer } = this._data.tagElements;

    for (const tag of tags) {
      if (this.hasTag(tag)) continue;

      // 模拟输入
      Simulate.input(input, tag);

      // 模拟回车
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(enterEvent);

      // 等待一点时间，避免太快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 监听商品名变化
   */
  onNameChange(callback: (value: string) => void): void {
    this._nameChangeCallback = callback;
    if (this._data.nameInput) {
      this._data.nameInput.addEventListener('input', (e) => {
        callback((e.target as HTMLInputElement).value);
      });
    }
  }

  /**
   * 监听描述变化
   */
  onDescriptionChange(callback: (value: string) => void): void {
    this._descriptionChangeCallback = callback;
    if (this._data.descriptionTextarea) {
      this._data.descriptionTextarea.addEventListener('input', (e) => {
        callback((e.target as HTMLTextAreaElement).value);
      });
    }
  }

  /**
   * 监听 Section 列表变化
   */
  onSectionsChange(callback: () => void): void {
    this._sectionsChangeCallback = callback;
    this._data.sections.forEach(section => {
      section.headlineInput?.addEventListener('input', () => callback());
      section.bodyTextarea?.addEventListener('input', () => callback());
    });
    const originalCallback = this._newSectionCallback;
    this._newSectionCallback = (section) => {
      section.headlineInput?.addEventListener('input', () => callback());
      section.bodyTextarea?.addEventListener('input', () => callback());
      originalCallback?.(section);
      callback();
    };
  }

  /**
   * 监听 Variation 列表变化
   */
  onVariationsChange(callback: () => void): void {
    this._variationsChangeCallback = callback;
    this._data.variations.forEach(variation => {
      variation.nameInput?.addEventListener('input', () => callback());
      variation.priceInput?.addEventListener('input', () => callback());
    });
    const originalCallback = this._newVariationCallback;
    this._newVariationCallback = (variation) => {
      variation.nameInput?.addEventListener('input', () => callback());
      variation.priceInput?.addEventListener('input', () => callback());
      originalCallback?.(variation);
      callback();
    };
  }
}

// 导出类型
export type {
  ItemEditData,
  ItemEditSectionElement,
  ItemEditVariationElement,
  TagData,
  TagElements
} from "./types";

