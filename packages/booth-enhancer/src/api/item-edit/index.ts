import { Simulate } from "../../utils/simulate";
import { BaseAPI } from "../BaseAPI";
import {
  DownloadableFileElement,
  ItemEditSectionElement,
  ItemEditVariationElement,
  TagData,
  TagElements,
  VariationEditPanel
} from "./types";

/**
 * 商品编辑页面API
 * 提供完整的商品编辑数据访问
 * 自动识别页面URL：https://manage.booth.pm/items/:id/edit 或 edit_pre
 */
export class ItemEditAPI extends BaseAPI<ItemEditAPI> {
  private _data = {
    nameInput: null as HTMLInputElement | null,
    descriptionTextarea: null as HTMLTextAreaElement | null,
    tags: [] as TagData[],
    tagElements: null as TagElements | null,
  };

  private _newSectionCallback?: (section: ItemEditSectionElement) => void;
  private _newVariationCallback?: (variation: ItemEditVariationElement) => void;
  private _sectionRemovedCallback?: (element: HTMLElement) => void;
  private _variationRemovedCallback?: (element: HTMLElement) => void;
  
  // 临时一次性回调（用于 addSection/removeSection 等待方法）
  private _tempSectionAddedCallback?: () => void;
  private _tempVariationAddedCallback?: () => void;
  private _tempSectionRemovedCallback?: () => void;
  private _tempVariationRemovedCallback?: () => void;

  constructor() {
    super();
  }

  /**
   * 实时获取 sections（不缓存）
   */
  get sections(): ItemEditSectionElement[] {
    return this.parseSections();
  }

  /**
   * 实时获取 variations（不缓存）
   */
  get variations(): ItemEditVariationElement[] {
    return this.parseVariations();
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
   * 查找所有包含变体项的 ul 容器
   */
  private findAllListContainers(): HTMLElement[] {
    const ulSet = new Set<HTMLElement>();
    
    // 通过父 section 特征查找
    document.querySelectorAll("section.bg-white.desktop\\:px-24.desktop\\:pt-24.desktop\\:rounded-t-4 ul")
      .forEach(ul => ulSet.add(ul as HTMLElement));
    
    // 通过 ul.grid.gap-16 查找
    document.querySelectorAll("ul.grid.gap-16")
      .forEach(ul => ulSet.add(ul as HTMLElement));
    
    // 过滤出包含 .variation-box-head 的容器
    return Array.from(ulSet).filter(container =>
      container.querySelector("li .variation-box-head")
    );
  }

  /**
   * 从容器中获取所有 li 元素
   */
  private getListItems(container: HTMLElement): HTMLElement[] {
    return Array.from(container.children).filter(
      child => child.tagName.toLowerCase() === "li"
    ) as HTMLElement[];
  }

  /**
   * 实时解析 Sections（从 DOM）
   */
  private parseSections(): ItemEditSectionElement[] {
    return this.findAllListContainers()
      .filter(container => this.isSectionList(container))
      .flatMap(container => 
        this.getListItems(container).flatMap(item => {
          const headlineInput = item.querySelector("input.charcoal-text-field-input") as HTMLInputElement;
          const bodyTextarea = item.querySelector("textarea.charcoal-text-area-textarea") as HTMLTextAreaElement;
          
          if (!headlineInput || !bodyTextarea) return [];
          
          return [{
            element: item,
            container,
            headlineInput,
            bodyTextarea,
            deleteButton: this.findDeleteButton(item),
          }];
        })
      );
  }

  /**
   * 实时解析 Variations（从 DOM）
   */
  private parseVariations(): ItemEditVariationElement[] {
    return this.findAllListContainers()
      .filter(container => !this.isSectionList(container))
      .flatMap(container =>
        this.getListItems(container).flatMap(item => {
          const nameContainer = item.querySelector('div[id^="variationName-"]');
          const priceContainer = item.querySelector('div[id^="variationDigitalPrice-"]');
          const nameInput = nameContainer?.querySelector("input.charcoal-text-field-input") as HTMLInputElement | null;
          const priceInput = priceContainer?.querySelector("input.charcoal-text-field-input") as HTMLInputElement | null;
          
          if (!nameInput || !priceInput) return [];
          
          return [{
            element: item,
            container,
            nameInput,
            priceInput,
            deleteButton: this.findDeleteButton(item),
            dragHandle: this.findDragHandle(item),
          }];
        })
      );
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
   * 解析并添加 Section 元素
   */
  private addSectionElement(item: HTMLElement, container: HTMLElement): void {
    const headlineInput = item.querySelector("input.charcoal-text-field-input") as HTMLInputElement;
    const bodyTextarea = item.querySelector("textarea.charcoal-text-area-textarea") as HTMLTextAreaElement;
    
    if (!headlineInput || !bodyTextarea) return;
    
    const sectionElement = {
      element: item,
      container,
      headlineInput,
      bodyTextarea,
      deleteButton: this.findDeleteButton(item),
    };
    
    this._newSectionCallback?.(sectionElement);
    
    if (this._tempSectionAddedCallback) {
      this._tempSectionAddedCallback();
      this._tempSectionAddedCallback = undefined;
    }
  }

  /**
   * 解析并添加 Variation 元素
   */
  private addVariationElement(item: HTMLElement, container: HTMLElement): void {
    const nameContainer = item.querySelector('div[id^="variationName-"]');
    const priceContainer = item.querySelector('div[id^="variationDigitalPrice-"]');
    const nameInput = nameContainer?.querySelector("input.charcoal-text-field-input") as HTMLInputElement | null;
    const priceInput = priceContainer?.querySelector("input.charcoal-text-field-input") as HTMLInputElement | null;
    
    if (!nameInput || !priceInput) return;
    
    const variationElement = {
      element: item,
      container,
      nameInput,
      priceInput,
      deleteButton: this.findDeleteButton(item),
      dragHandle: this.findDragHandle(item),
    };
    
    this._newVariationCallback?.(variationElement);
    
    if (this._tempVariationAddedCallback) {
      this._tempVariationAddedCallback();
      this._tempVariationAddedCallback = undefined;
    }
  }

  /**
   * 处理单个列表项的添加
   */
  private handleItemAdded(item: HTMLElement, container: HTMLElement): void {
    const isSection = this.isSectionList(container);
    
    if (isSection) {
      this.addSectionElement(item, container);
    } else {
      this.addVariationElement(item, container);
    }
  }

  /**
   * 检查元素是否是我们关注的列表容器
   */
  private isTargetListContainer(element: HTMLElement): boolean {
    return (
      element.tagName === "UL" &&
      element.classList.contains("grid") &&
      element.classList.contains("gap-16")
    );
  }

  /**
   * 设置列表观察器，监听新增和删除的列表项
   */
  private setupListObserver(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;

          // 情况1：整个列表容器被添加（初始化）
          if (this.isTargetListContainer(node) && node.querySelector("li .variation-box-head")) {
            const items = Array.from(node.children).filter(
              (child) => child.tagName.toLowerCase() === "li"
            ) as HTMLElement[];
            
            items.forEach((item) => this.handleItemAdded(item, node));
          }
          // 情况2：单个列表项被添加（用户操作）
          else if (node.tagName.toLowerCase() === "li") {
            const container = node.parentElement as HTMLElement;
            
            if (container && this.isTargetListContainer(container) && node.querySelector(".variation-box-head")) {
              this.handleItemAdded(node, container);
            }
          }
        }

        for (const node of Array.from(mutation.removedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.tagName.toLowerCase() !== "li") continue;

          // 判断是 section 还是 variation
          const container = mutation.target as HTMLElement;
          const isSection = this.isSectionList(container);
          
          if (isSection) {
            this._sectionRemovedCallback?.(node);
            
            if (this._tempSectionRemovedCallback) {
              this._tempSectionRemovedCallback();
              this._tempSectionRemovedCallback = undefined;
            }
          } else {
            this._variationRemovedCallback?.(node);
            
            if (this._tempVariationRemovedCallback) {
              this._tempVariationRemovedCallback();
              this._tempVariationRemovedCallback = undefined;
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
  get data() {
    // 实时更新 tags
    this._data.tags = this.getTags();
    return {
      ...this._data,
      sections: this.sections,
      variations: this.variations
    };
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
    const section = this.sections[index];
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
    const variation = this.variations[index];
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

    const { input } = this._data.tagElements;

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

      // 等待一点时间，避免太快（减少延迟以提高速度）
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * 批量移除 Tags
   */
  async removeTags(tags: string[]): Promise<void> {
    if (!this._data.tagElements) return;

    const tagsToRemove = new Set(tags);
    const currentTags = this.getTagTexts();
    
    // 找到需要删除的标签的索引
    const indicesToRemove: number[] = [];
    currentTags.forEach((tag, index) => {
      if (tagsToRemove.has(tag)) {
        indicesToRemove.push(index);
      }
    });

    if (indicesToRemove.length === 0) return;

    // 获取所有删除按钮
    const deleteButtons = this.getTagDeleteButtons();
    
    // 从后往前删除，避免索引变化
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const index = indicesToRemove[i];
      if (deleteButtons[index]) {
        deleteButtons[index].click();
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  /**
   * 监听商品名变化
   */
  onNameChange(callback: (value: string) => void): void {
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
    if (this._data.descriptionTextarea) {
      this._data.descriptionTextarea.addEventListener('input', (e) => {
        callback((e.target as HTMLTextAreaElement).value);
      });
    }
  }

  /**
   * 为元素添加输入监听器
   */
  private addInputListeners(elements: (HTMLElement | null | undefined)[], callback: () => void): void {
    elements.forEach(element => {
      element?.addEventListener('input', () => callback());
    });
  }

  /**
   * 监听 Section 列表变化
   */
  onSectionsChange(callback: () => void): void {
    this.sections.forEach(section => {
      this.addInputListeners([section.headlineInput, section.bodyTextarea], callback);
    });
    
    const originalCallback = this._newSectionCallback;
    this._newSectionCallback = (section) => {
      this.addInputListeners([section.headlineInput, section.bodyTextarea], callback);
      originalCallback?.(section);
      callback();
    };
  }

  /**
   * 监听 Variation 列表变化
   */
  onVariationsChange(callback: () => void): void {
    this.variations.forEach(variation => {
      this.addInputListeners([variation.nameInput, variation.priceInput], callback);
    });
    
    const originalCallback = this._newVariationCallback;
    this._newVariationCallback = (variation) => {
      this.addInputListeners([variation.nameInput, variation.priceInput], callback);
      originalCallback?.(variation);
      callback();
    };
  }

  /**
   * 查找 Section 元素内的删除按钮
   * @param sectionElement Section 的 li 元素
   * @returns 删除按钮或 null
   */
  private findDeleteButton(itemElement: HTMLElement): HTMLButtonElement | null {
    // li 下的第二个 button 就是删除按钮
    const buttons = itemElement.querySelectorAll<HTMLButtonElement>('button');
    return buttons.length >= 2 ? buttons[1] : null;
  }

  /**
   * 查找 Variation 的拖拽按钮
   * @param itemElement Variation 的 li 元素
   * @returns 拖拽按钮或 null
   */
  private findDragHandle(itemElement: HTMLElement): HTMLButtonElement | null {
    // li 下的第一个 button 就是拖拽按钮（class 包含 variation-box-head）
    const firstButton = itemElement.querySelector<HTMLButtonElement>('button.variation-box-head');
    return firstButton;
  }

  /**
   * 查找"添加段落"按钮
   * 该按钮位于 Section 列表底部
   */
  private findAddSectionButton(): HTMLElement | null {
    const buttons = document.querySelectorAll<HTMLElement>('div.cursor-pointer');
    
    for (const button of buttons) {
      const hasIcon = button.querySelector('.icon-plus');
      const textContent = button.textContent?.trim();
      if (hasIcon && textContent?.includes('段落')) {
        return button;
      }
    }
    
    return null;
  }

  /**
   * 查找"添加 Variation"按钮
   * 该按钮位于 Variation 列表区域
   */
  private findAddVariationButton(): HTMLButtonElement | null {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      'button.flex.flex-col.justify-between.items-center'
    );
    
    for (const button of buttons) {
      const hasDownloadIcon = button.querySelector('pixiv-icon[name="16/Download"]');
      const textContent = button.textContent?.trim();
      if (hasDownloadIcon && textContent?.includes('Digital')) {
        return button;
      }
    }
    
    return null;
  }

  /**
   * 点击"添加段落"按钮，自动创建新的 Section
   * @returns 是否成功找到并点击按钮
   */
  clickAddSectionButton(): boolean {
    const button = this.findAddSectionButton();
    if (button) {
      button.click();
      return true;
    }
    return false;
  }

  /**
   * 点击"添加 Variation"按钮，自动创建新的 Variation
   * @returns 是否成功找到并点击按钮
   */
  clickAddVariationButton(): boolean {
    const button = this.findAddVariationButton();
    if (button) {
      button.click();
      return true;
    }
    return false;
  }

  /**
   * 创建一个带超时的等待 Promise
   */
  private createWaitPromise(
    setCallback: (callback: () => void) => void,
    clearCallback: () => void,
    timeout: number
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        clearCallback();
        resolve(false);
      }, timeout);

      setCallback(() => {
        clearTimeout(timer);
        resolve(true);
      });
    });
  }

  /**
   * 添加 Section 并等待完成
   * @param timeout 超时时间（毫秒），默认 5000ms
   * @returns Promise<boolean> 是否成功添加
   */
  async addSection(timeout = 5000): Promise<boolean> {
    if (!this.clickAddSectionButton()) {
      return false;
    }

    return this.createWaitPromise(
      (callback) => { this._tempSectionAddedCallback = callback; },
      () => { this._tempSectionAddedCallback = undefined; },
      timeout
    );
  }

  /**
   * 添加 Variation 并等待完成
   * @param timeout 超时时间（毫秒），默认 5000ms
   * @returns Promise<boolean> 是否成功添加
   */
  async addVariation(timeout = 5000): Promise<boolean> {
    if (!this.clickAddVariationButton()) {
      return false;
    }

    return this.createWaitPromise(
      (callback) => { this._tempVariationAddedCallback = callback; },
      () => { this._tempVariationAddedCallback = undefined; },
      timeout
    );
  }

  /**
   * 设置"添加段落"按钮的点击监听器
   * 当用户手动点击按钮时触发回调
   */
  setupAddSectionButtonListener(callback: () => void): void {
    const checkAndAttach = () => {
      const button = this.findAddSectionButton();
      if (button && !button.dataset.listenerAttached) {
        button.dataset.listenerAttached = 'true';
        button.addEventListener('click', () => {
          callback();
        });
      }
    };

    checkAndAttach();

    const observer = new MutationObserver(() => {
      checkAndAttach();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 设置"添加 Variation"按钮的点击监听器
   * 当用户手动点击按钮时触发回调
   */
  setupAddVariationButtonListener(callback: () => void): void {
    const checkAndAttach = () => {
      const button = this.findAddVariationButton();
      if (button && !button.dataset.listenerAttached) {
        button.dataset.listenerAttached = 'true';
        button.addEventListener('click', () => {
          callback();
        });
      }
    };

    checkAndAttach();

    const observer = new MutationObserver(() => {
      checkAndAttach();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 删除指定的 Section
   * @param section Section 元素对象
   * @returns 是否成功删除
   */
  deleteSectionByElement(section: ItemEditSectionElement): boolean {
    if (!section.deleteButton) {
      // 如果没有缓存删除按钮，尝试重新查找
      section.deleteButton = this.findDeleteButton(section.element);
    }

    if (section.deleteButton) {
      section.deleteButton.click();
      // MutationObserver 会自动从列表中移除，无需手动处理
      return true;
    }

    return false;
  }

  /**
   * 删除指定索引的 Section
   * @param index Section 在列表中的索引
   * @returns 是否成功点击删除按钮
   */
  deleteSectionByIndex(index: number): boolean {
    const section = this.sections[index];
    if (section) {
      return this.deleteSectionByElement(section);
    }
    return false;
  }

  /**
   * 删除 Section 并等待完成
   * @param index Section 在列表中的索引
   * @param timeout 超时时间（毫秒），默认 5000ms
   * @returns Promise<boolean> 是否成功删除
   */
  async removeSection(index: number, timeout = 5000): Promise<boolean> {
    const section = this.sections[index];
    if (!section) return false;

    if (!section.deleteButton) {
      section.deleteButton = this.findDeleteButton(section.element);
    }

    if (!section.deleteButton) return false;

    section.deleteButton.click();

    return this.createWaitPromise(
      (callback) => { this._tempSectionRemovedCallback = callback; },
      () => { this._tempSectionRemovedCallback = undefined; },
      timeout
    );
  }

  /**
   * 删除所有 Sections
   * @returns 成功删除的数量
   */
  deleteAllSections(): number {
    let count = 0;
    // 从后往前删除，避免索引变化问题
    // 注意：每次删除后 sections length 会变化，所以需要重新获取
    while (this.sections.length > 0) {
      if (this.deleteSectionByIndex(this.sections.length - 1)) {
        count++;
      } else {
        break; // 删除失败，避免无限循环
      }
    }
    return count;
  }

  /**
   * 删除指定的 Variation
   * @param variation Variation 元素对象
   * @returns 是否成功删除
   */
  deleteVariationByElement(variation: ItemEditVariationElement): boolean {
    if (!variation.deleteButton) {
      // 如果没有缓存删除按钮，尝试重新查找
      variation.deleteButton = this.findDeleteButton(variation.element);
    }

    if (variation.deleteButton) {
      variation.deleteButton.click();
      // MutationObserver 会自动从列表中移除，无需手动处理
      return true;
    }

    return false;
  }

  /**
   * 根据索引删除 Variation
   * @param index Variation 在列表中的索引
   * @returns 是否成功删除
   */
  deleteVariationByIndex(index: number): boolean {
    const variation = this.variations[index];
    if (variation) {
      return this.deleteVariationByElement(variation);
    }
    return false;
  }

  /**
   * 删除 Variation 并等待完成
   * @param index Variation 在列表中的索引
   * @param timeout 超时时间（毫秒），默认 5000ms
   * @returns Promise<boolean> 是否成功删除
   */
  async removeVariation(index: number, timeout = 5000): Promise<boolean> {
    const variation = this.variations[index];
    if (!variation) return false;

    if (!variation.deleteButton) {
      variation.deleteButton = this.findDeleteButton(variation.element);
    }

    if (!variation.deleteButton) return false;

    variation.deleteButton.click();

    return this.createWaitPromise(
      (callback) => { this._tempVariationRemovedCallback = callback; },
      () => { this._tempVariationRemovedCallback = undefined; },
      timeout
    );
  }

  /**
   * 删除所有 Variations
   * @returns 成功删除的数量
   */
  deleteAllVariations(): number {
    let count = 0;
    // 从后往前删除，避免索引变化问题
    // 注意：每次删除后 variations length 会变化，所以需要重新获取
    while (this.variations.length > 0) {
      if (this.deleteVariationByIndex(this.variations.length - 1)) {
        count++;
      } else {
        break; // 删除失败，避免无限循环
      }
    }
    return count;
  }

  // ===== Variation 文件管理方法 =====

  /**
   * 从页面的文件管理面板获取所有文件列表
   * @returns 文件元素数组
   */
  /**
   * 获取 variation 的已关联文件
   * @param variationIndex variation 索引
   * @returns 文件 ID 数组
   */
  getVariationFiles(variationIndex: number): string[] {
    const variation = this.variations[variationIndex];
    if (!variation) return [];
    
    // 在 variation 元素中查找文件列表
    const fileLinks = variation.element.querySelectorAll('a[href*="/downloadables/"]');
    const fileIds: string[] = [];
    
    fileLinks.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      const idMatch = href.match(/\/downloadables\/(\d+)/);
      if (idMatch) {
        fileIds.push(idMatch[1]);
      }
    });
    
    return fileIds;
  }

  /**
   * 获取所有可下载文件（实时从 DOM 获取）
   */
  get files(): Array<{ id: string; name: string }> {
    return this.getAllFiles().map(file => ({
      id: file.id,
      name: file.name
    }));
  }

  getAllFiles(): DownloadableFileElement[] {
    // 查找文件管理面板中的文件列表
    // 通过标题 "Add/Edit Files" 定位面板
    const titleElements = document.querySelectorAll('.font-booth-demi');
    let filePanel: HTMLElement | null = null;
    
    for (const title of Array.from(titleElements)) {
      if (title.textContent?.includes('Add/Edit Files')) {
        filePanel = title.closest('.bg-white') as HTMLElement;
        break;
      }
    }
    
    if (!filePanel) return [];
    
    // 查找文件列表 ul
    const fileList = filePanel.querySelector('ul.list-none');
    if (!fileList) return [];
    
    return this.parseFileListFromContainer(fileList as HTMLElement);
  }

  /**
   * 从容器中解析文件列表
   * @param container 文件列表容器
   * @returns 文件元素数组
   */
  private parseFileListFromContainer(container: HTMLElement): DownloadableFileElement[] {
    const fileElements = container.querySelectorAll('li');
    const files: DownloadableFileElement[] = [];
    
    fileElements.forEach(li => {
      const checkbox = li.querySelector('input.charcoal-checkbox-input[type="checkbox"]') as HTMLInputElement | null;
      const link = li.querySelector('a[href*="/downloadables/"]') as HTMLAnchorElement | null;
      
      if (checkbox && link) {
        const href = link.href;
        const idMatch = href.match(/\/downloadables\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        const name = link.textContent?.trim() || '';
        
        files.push({
          id,
          name,
          checkbox,
          checked: checkbox.checked
        });
      }
    });
    
    return files;
  }

  /**
   * 查找 variation 的编辑按钮或 "Add/Edit Files" 元素
   * @param index Variation 索引
   * @returns 编辑按钮/div 元素或 null
   */
  findVariationEditButton(index: number): HTMLElement | null {
    const variation = this.variations[index];
    if (!variation) return null;
    
    // 优先查找 "Add/Edit Files" div（新建 variation 无文件时）
    const iconElement = variation.element.querySelector('i.icon-downloadables');
    if (iconElement) {
      const clickableParent = iconElement.closest('div.cursor-pointer') as HTMLElement | null;
      if (clickableParent?.textContent?.includes('Add/Edit Files')) {
        return clickableParent;
      }
    }
    
    // 查找 "Edit" 按钮（已有文件时）
    const filesSection = variation.element.querySelector('div:nth-child(3)');
    if (filesSection) {
      const buttons = Array.from(filesSection.querySelectorAll<HTMLButtonElement>('button'));
      const editButton = buttons.find(btn => {
        const text = btn.textContent?.trim() || '';
        return text === 'Edit' || (text.includes('Edit') && !text.includes('Delete'));
      });
      
      if (editButton) return editButton;
    }
    
    console.error(`[ItemEditAPI] 未找到 Variation ${index} 的编辑按钮`);
    return null;
  }

  /**
   * 打开 variation 编辑面板并返回面板信息
   * @param index Variation 索引
   * @param timeout 超时时间（毫秒）
   * @returns Promise<VariationEditPanel | null>
   */
  async openVariationEditPanel(index: number, timeout = 5000): Promise<VariationEditPanel | null> {
    const button = this.findVariationEditButton(index);
    if (!button) return null;
    
    Simulate.click(button);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return new Promise((resolve) => {
      let observer: MutationObserver | null = null;
      
      const timer = setTimeout(() => {
        console.error(`[ItemEditAPI] Variation ${index} 打开面板超时`);
        observer?.disconnect();
        resolve(null);
      }, timeout);
      
      const checkPanel = (): boolean => {
        const panel = this.findVariationEditPanel();
        if (panel) {
          clearTimeout(timer);
          observer?.disconnect();
          resolve(panel);
          return true;
        }
        return false;
      };
      
      if (checkPanel()) return;
      
      observer = new MutationObserver(checkPanel);
      observer.observe(document.body, {
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: true
      });
    });
  }

  /**
   * 查找 variation 编辑面板
   * @returns VariationEditPanel 或 null
   */
  private findVariationEditPanel(): VariationEditPanel | null {
    const containers = document.querySelectorAll<HTMLElement>('body > div.fixed.top-0.left-0.right-0');
    
    const container = Array.from(containers).find(c => 
      c.textContent?.includes('Add/Edit Files')
    );
    
    if (!container) return null;
    
    const hasHiddenClass = container.classList.contains('hidden');
    const hasFileList = container.querySelector('ul.list-none') !== null;
    
    // 面板未打开：hidden 且无文件列表
    if (hasHiddenClass && !hasFileList) return null;
    
    const closeButton = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find(btn => btn.querySelector('pixiv-icon[name="32/BoothClose"]')) || null;
    
    const files = this.parseFileList(container);
    
    return { container, closeButton, files };
  }

  /**
   * 解析文件列表
   * @param container 面板容器
   * @returns 文件元素数组
   */
  private parseFileList(container: HTMLElement): DownloadableFileElement[] {
    const fileElements = container.querySelectorAll('ul.list-none > li');
    const files: DownloadableFileElement[] = [];
    
    fileElements.forEach(li => {
      const checkbox = li.querySelector('input.charcoal-checkbox-input[type="checkbox"]') as HTMLInputElement | null;
      const link = li.querySelector('a[href*="/downloadables/"]') as HTMLAnchorElement | null;
      
      if (checkbox && link) {
        const href = link.href;
        const idMatch = href.match(/\/downloadables\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        const name = link.textContent?.trim() || '';
        
        files.push({
          id,
          name,
          checkbox,
          checked: checkbox.checked
        });
      }
    });
    
    return files;
  }

  /**
   * 选择文件
   * @param panel Variation 编辑面板
   * @param fileIds 要选择的文件 ID 数组
   * @param mode 选择模式：replace（替换）或 append（追加）
   */
  selectFiles(panel: VariationEditPanel, fileIds: string[], mode: 'replace' | 'append' = 'replace'): void {
    panel.files.forEach((file: DownloadableFileElement) => {
      const shouldCheck = fileIds.includes(file.id);
      const needsUpdate = mode === 'replace' 
        ? file.checked !== shouldCheck 
        : shouldCheck && !file.checked;
      
      if (needsUpdate) {
        file.checkbox.click();
      }
    });
  }

  /**
   * 关闭 variation 编辑面板
   * @param panel Variation 编辑面板
   */
  closeVariationEditPanel(panel: VariationEditPanel): void {
    if (!panel.closeButton) {
      console.error(`[ItemEditAPI] 未找到关闭按钮`);
      return;
    }
    panel.closeButton.click();
  }

  /**
   * 获取已选文件 ID 列表
   * @param panel Variation 编辑面板
   * @returns 已选文件的 ID 数组
   */
  getSelectedFileIds(panel: VariationEditPanel): string[] {
    return panel.files.filter((f: DownloadableFileElement) => f.checked).map((f: DownloadableFileElement) => f.id);
  }

  /**
   * 从 variation 卡片读取已选择的文件 ID 列表
   * @param index Variation 索引
   * @returns 文件 ID 数组
   */
  getVariationSelectedFileIds(index: number): string[] {
    const variation = this.variations[index];
    if (!variation) return [];
    
    // 查找文件列表容器：div:nth-child(3) > div.grid.gap-12 > div > ul
    const filesSection = variation.element.querySelector('div:nth-child(3)');
    if (!filesSection) return [];
    
    const fileList = filesSection.querySelector('div.grid.gap-12 > div > ul');
    if (!fileList) return [];
    
    // 提取所有文件链接的 ID
    const fileLinks = fileList.querySelectorAll('a[href*="/downloadables/"]');
    const fileIds: string[] = [];
    
    fileLinks.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      const match = href.match(/\/downloadables\/(\d+)/);
      if (match) {
        fileIds.push(match[1]);
      }
    });
    
    return fileIds;
  }

  /**
   * 为 variation 设置文件（自动打开/关闭面板）
   * @param variationIndex Variation 索引
   * @param fileIds 要选择的文件 ID 数组
   * @param mode 选择模式：replace（替换）或 append（追加）
   * @returns Promise<{ success: boolean; updated: boolean }> success: 是否成功, updated: 是否实际更新了文件
   */
  async setVariationFiles(
    variationIndex: number, 
    fileIds: string[], 
    mode: 'replace' | 'append' = 'replace'
  ): Promise<{ success: boolean; updated: boolean }> {
    const currentSelectedIds = this.getVariationSelectedFileIds(variationIndex).sort();
    const targetIds = [...new Set(fileIds)].sort();
    
    const isIdentical = mode === 'replace' 
      && currentSelectedIds.length === targetIds.length
      && currentSelectedIds.every((id, index) => id === targetIds[index]);
    
    if (isIdentical) {
      return { success: true, updated: false };
    }
    
    const panel = await this.openVariationEditPanel(variationIndex);
    if (!panel) return { success: false, updated: false };
    
    this.selectFiles(panel, fileIds, mode);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.closeVariationEditPanel(panel);
    return { success: true, updated: true };
  }

  /**
   * 调整 Variation 的顺序（通过拖拽模拟）
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   * @returns 是否成功
   */
  moveVariation(fromIndex: number, toIndex: number): boolean {
    // 每次访问 this.variations 都会重新从 DOM 解析，确保数据最新
    const variations = this.variations;
    
    if (fromIndex < 0 || fromIndex >= variations.length ||
        toIndex < 0 || toIndex >= variations.length ||
        fromIndex === toIndex) {
      return false;
    }
    
    const sourceVar = variations[fromIndex];
    const targetVar = variations[toIndex];
    
    // 获取拖拽句柄和实际元素
    const sourceDragHandle = sourceVar.dragHandle || sourceVar.element;
    const targetDragHandle = targetVar.dragHandle || targetVar.element;
    const sourceElement = sourceVar.element;
    const targetElement = targetVar.element;
    
    // 模拟拖拽并移动 DOM
    // DOM 更新后，下次访问 this.variations 会自动得到新的顺序
    const position = fromIndex < toIndex ? 'after' : 'before';
    return Simulate.dragAndDrop(
      sourceDragHandle,
      targetDragHandle,
      sourceElement,
      targetElement,
      position
    );
  }
}

// 导出类型
export type {
  DownloadableFileElement, ItemEditData,
  ItemEditSectionElement,
  ItemEditVariationElement,
  TagData,
  TagElements, VariationEditPanel
} from "./types";

