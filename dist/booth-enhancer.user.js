// ==UserScript==
// @name               Booth ItemPage Enhancer
// @name:zh-CN         Booth 商品页面增强
// @namespace          yueby.booth
// @version            0.1.13
// @author             Yueby
// @description        A userscript for enhancing Booth item page experience
// @description:zh-CN  增强 Booth 商品页面的功能体验，包括变体序号、标签管理、自动翻译等功能
// @icon               ./src/assets/icon.png
// @match              https://*.booth.pm/*
// @connect            raw.githubusercontent.com
// @grant              GM_notification
// @grant              GM_registerMenuCommand
// @grant              GM_setClipboard
// @grant              GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  class Simulate {
    /**
     * 模拟用户输入文本
     * @param element 目标输入元素
     * @param text 要输入的文本
     */
    static input(element, text) {
      var _a;
      const nativeInputValueSetter = (_a = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")) == null ? void 0 : _a.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, text);
      }
      const ev2 = new Event("input", { bubbles: true });
      element.dispatchEvent(ev2);
    }
    /**
     * 模拟键盘按下事件
     * @param element 目标元素
     * @param keyCode 键码
     */
    static keyDown(element, keyCode) {
      const keyboardEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        code: "Enter",
        keyCode,
        which: keyCode,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false
      });
      element.dispatchEvent(keyboardEvent);
    }
    /**
     * 模拟按下回车键
     * @param element 目标元素
     */
    static pressEnter(element) {
      this.keyDown(element, 13);
    }
    /**
     * 模拟鼠标点击事件
     * @param element 目标元素
     */
    static click(element) {
      const mouseEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
      });
      element.dispatchEvent(mouseEvent);
    }
  }
  class BaseAPI {
    constructor() {
      __publicField(this, "_isReady", false);
      __publicField(this, "_readyCallbacks", []);
      if (this.shouldActivate()) {
        this.initialize();
      }
    }
    /**
     * 异步初始化
     */
    async initialize() {
      try {
        await this.waitForDOMReady();
        await this.load();
        this._isReady = true;
        this.triggerReadyCallbacks();
      } catch (error) {
        console.error(`${this.constructor.name} 初始化失败:`, error);
      }
    }
    /**
     * 等待页面完全加载（包括所有资源和脚本）
     */
    waitForDOMReady() {
      if (document.readyState === "complete") {
        return Promise.resolve();
      }
      return new Promise(
        (resolve) => window.addEventListener("load", () => resolve(), { once: true })
      );
    }
    /**
     * 触发 ready 回调
     */
    triggerReadyCallbacks() {
      this._readyCallbacks.forEach((callback) => {
        try {
          callback(this);
        } catch (error) {
          console.error("Ready callback error:", error);
        }
      });
      this._readyCallbacks = [];
    }
    /**
     * 监听就绪事件
     * 如果已经就绪，立即调用回调
     * 否则等待就绪后调用
     */
    onReady(callback) {
      if (this._isReady) {
        callback(this);
      } else {
        this._readyCallbacks.push(callback);
      }
    }
    /**
     * 检查是否就绪
     */
    ready() {
      return this._isReady;
    }
    /**
     * 检查是否已激活（是否在正确的页面上）
     */
    isActivated() {
      return this.shouldActivate();
    }
  }
  class ItemEditAPI extends BaseAPI {
    constructor() {
      super();
      __publicField(this, "_data", {
        nameInput: null,
        descriptionTextarea: null,
        sections: [],
        variations: [],
        tags: [],
        tagElements: null
      });
      __publicField(this, "_newSectionCallback");
      __publicField(this, "_newVariationCallback");
    }
    /**
     * 判断是否应该在当前页面激活
     */
    shouldActivate() {
      const path = window.location.pathname;
      return /^\/items\/\d+\/edit(_pre)?$/.test(path);
    }
    /**
     * 等待名称输入框出现并填充数据
     */
    waitForElements(timeout = 1e4) {
      return new Promise((resolve) => {
        const checkNameInput = () => {
          const nameInput = document.querySelector(
            "#name input"
          );
          return nameInput && nameInput.value.trim().length > 0;
        };
        if (checkNameInput()) {
          resolve();
          return;
        }
        const timer = setTimeout(() => {
          observer.disconnect();
          resolve();
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
          subtree: true
        });
      });
    }
    /**
     * 加载数据
     * 等待关键元素出现后再加载
     */
    async load() {
      await this.waitForElements();
      this.loadName();
      this.loadDescription();
      this.loadSectionsAndVariations();
      this.loadTagElements();
      this.setupListObserver();
    }
    /**
     * 加载商品名称
     */
    loadName() {
      const input = document.querySelector("#name input");
      this._data.nameInput = input || null;
    }
    /**
     * 加载商品描述
     */
    loadDescription() {
      const textarea = document.querySelector(
        "#description textarea"
      );
      this._data.descriptionTextarea = textarea || null;
    }
    /**
     * 加载 Section 和 Variation 列表
     */
    loadSectionsAndVariations() {
      this._data.sections = [];
      this._data.variations = [];
      const ulElements = document.querySelectorAll("ul.grid.gap-16");
      ulElements.forEach((ul) => {
        const container = ul;
        if (container.querySelector("li .variation-box-head")) {
          const items = Array.from(container.children).filter(
            (child) => child.tagName.toLowerCase() === "li"
          );
          const isSection = this.isSectionList(container);
          items.forEach((item) => {
            if (isSection) {
              const headlineInput = item.querySelector(
                "input.charcoal-text-field-input"
              );
              const bodyTextarea = item.querySelector(
                "textarea.charcoal-text-area-textarea"
              );
              this._data.sections.push({
                element: item,
                container,
                headlineInput,
                bodyTextarea
              });
            } else {
              const nameContainer = item.querySelector(
                'div[id^="variationName-"]'
              );
              const priceContainer = item.querySelector(
                'div[id^="variationDigitalPrice-"]'
              );
              const nameInput = nameContainer == null ? void 0 : nameContainer.querySelector(
                "input.charcoal-text-field-input"
              );
              const digitalPriceInput = priceContainer == null ? void 0 : priceContainer.querySelector(
                "input.charcoal-text-field-input"
              );
              this._data.variations.push({
                element: item,
                container,
                nameInput,
                priceInput: digitalPriceInput
              });
            }
          });
        }
      });
    }
    /**
     * 判断是否为 Section 列表
     */
    isSectionList(ul) {
      const section = ul.closest("section");
      if (!section) return false;
      return section.classList.contains("bg-white") && section.classList.contains("desktop:px-24") && section.classList.contains("desktop:pt-24") && section.classList.contains("desktop:rounded-t-4");
    }
    /**
     * 加载标签元素
     */
    loadTagElements() {
      const container = document.querySelector("#item_tag");
      const input = document.querySelector(
        ".js-item-tags-array"
      );
      const inputContainer = document.querySelector(
        "#item_tag .item-search-input__container"
      );
      if (container && input && inputContainer) {
        this._data.tagElements = {
          container,
          input,
          inputContainer
        };
      }
    }
    /**
     * 设置列表观察器，监听新增的列表
     */
    setupListObserver() {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement) {
              if (node.tagName === "UL" && node.classList.contains("grid") && node.classList.contains("gap-16") && node.querySelector("li .variation-box-head")) {
                const container = node;
                const items = Array.from(container.children).filter(
                  (child) => child.tagName.toLowerCase() === "li"
                );
                const isSection = this.isSectionList(container);
                items.forEach((item) => {
                  var _a, _b;
                  if (isSection) {
                    const headlineInput = item.querySelector(
                      "input.charcoal-text-field-input"
                    );
                    const bodyTextarea = item.querySelector(
                      "textarea.charcoal-text-area-textarea"
                    );
                    const sectionElement = {
                      element: item,
                      container,
                      headlineInput,
                      bodyTextarea
                    };
                    this._data.sections.push(sectionElement);
                    (_a = this._newSectionCallback) == null ? void 0 : _a.call(this, sectionElement);
                  } else {
                    const nameContainer = item.querySelector(
                      'div[id^="variationName-"]'
                    );
                    const priceContainer = item.querySelector(
                      'div[id^="variationDigitalPrice-"]'
                    );
                    const nameInput = nameContainer == null ? void 0 : nameContainer.querySelector(
                      "input.charcoal-text-field-input"
                    );
                    const priceInput = priceContainer == null ? void 0 : priceContainer.querySelector(
                      "input.charcoal-text-field-input"
                    );
                    const variationElement = {
                      element: item,
                      container,
                      nameInput,
                      priceInput
                    };
                    this._data.variations.push(variationElement);
                    (_b = this._newVariationCallback) == null ? void 0 : _b.call(this, variationElement);
                  }
                });
              }
            }
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    /**
     * 获取完整的商品编辑数据
     */
    get data() {
      this._data.tags = this.getTags();
      return { ...this._data };
    }
    /**
     * 获取所有 Section 元素
     */
    get sections() {
      return [...this._data.sections];
    }
    /**
     * 获取所有 Variation 元素
     */
    get variations() {
      return [...this._data.variations];
    }
    /**
     * 获取标签元素
     */
    get tagElements() {
      return this._data.tagElements;
    }
    /**
     * 监听新增的 Section 元素
     */
    onSectionAdded(callback) {
      this._newSectionCallback = callback;
    }
    /**
     * 监听新增的 Variation 元素
     */
    onVariationAdded(callback) {
      this._newVariationCallback = callback;
    }
    /**
     * 获取当前所有标签数据
     */
    getTags() {
      const tags = [];
      const tagElements = document.querySelectorAll(
        "#item_tag .bg-secondary500 .font-bold"
      );
      tagElements.forEach((element) => {
        var _a;
        const text = (_a = element.textContent) == null ? void 0 : _a.trim();
        if (text) {
          tags.push({
            text,
            element
          });
        }
      });
      return tags;
    }
    /**
     * 获取标签文本列表
     */
    getTagTexts() {
      return this.getTags().map((tag) => tag.text);
    }
    /**
     * 检查标签是否存在
     */
    hasTag(tagText) {
      return this.getTagTexts().includes(tagText);
    }
    /**
     * 获取标签删除按钮
     */
    getTagDeleteButtons() {
      return Array.from(
        document.querySelectorAll(
          '#item_tag .bg-secondary500 a.flex pixiv-icon[name="32/BoothClose"]'
        )
      ).map((icon) => icon.closest("a")).filter(Boolean);
    }
    /**
     * 刷新数据
     */
    refresh() {
      this.loadName();
      this.loadDescription();
      this.loadSectionsAndVariations();
      this.loadTagElements();
    }
    /**
     * 获取/设置商品名
     */
    get name() {
      var _a;
      return ((_a = this._data.nameInput) == null ? void 0 : _a.value) || "";
    }
    set name(value) {
      if (!this._data.nameInput) {
        console.error("找不到商品名输入框");
        return;
      }
      Simulate.input(this._data.nameInput, value);
    }
    /**
     * 获取/设置商品描述
     */
    get description() {
      var _a;
      return ((_a = this._data.descriptionTextarea) == null ? void 0 : _a.value) || "";
    }
    set description(value) {
      if (!this._data.descriptionTextarea) {
        console.error("找不到商品描述文本域");
        return;
      }
      Simulate.input(this._data.descriptionTextarea, value);
    }
  }
  class PageFeature {
    constructor(context) {
      __publicField(this, "context");
      __publicField(this, "path");
      __publicField(this, "api");
      this.context = context;
      this.path = window.location.pathname;
    }
    /**
     * 执行页面功能
     */
    async execute() {
      this.api = this.createAPI();
      if (this.api) {
        await new Promise((resolve) => {
          this.api.onReady(async () => {
            await this.initialize();
            resolve();
          });
        });
      } else {
        await this.initialize();
      }
    }
    /**
     * 获取API实例
     */
    getAPI() {
      return this.api;
    }
  }
  class PageModule {
    constructor(api) {
      __publicField(this, "api");
      this.api = api;
      this.api.onReady((api2) => {
        this.initialize(api2);
      });
    }
  }
  class FileManager extends PageModule {
    constructor(api) {
      super(api);
    }
    initialize() {
      this.enhanceFilePanel();
    }
    /**
     * 增强文件管理面板
     */
    enhanceFilePanel() {
      const panel = this.findFilePanel();
      if (!panel) return;
      if (panel.hasAttribute("data-file-manager-enhanced")) return;
      panel.setAttribute("data-file-manager-enhanced", "true");
      const storageDiv = panel.querySelector(".font-heavy-sans.text-\\[14px\\]");
      if (!storageDiv) return;
      this.addActionButtons(storageDiv);
    }
    /**
     * 查找文件管理面板
     */
    findFilePanel() {
      var _a;
      const titleElements = document.querySelectorAll(".font-booth-demi");
      for (const title of Array.from(titleElements)) {
        if ((_a = title.textContent) == null ? void 0 : _a.includes("Add/Edit Files")) {
          return title.closest(".bg-white");
        }
      }
      return null;
    }
    /**
     * 添加操作按钮
     */
    addActionButtons(storageDiv) {
      var _a;
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "flex gap-8 py-12 px-16 border-b border-b-border300";
      buttonContainer.style.cssText = "background: #f8f9fa;";
      const selectAllBtn = document.createElement("button");
      selectAllBtn.type = "button";
      selectAllBtn.className = "btn calm small";
      selectAllBtn.textContent = "全选";
      selectAllBtn.onclick = () => this.selectAllFiles();
      const unselectAllBtn = document.createElement("button");
      unselectAllBtn.type = "button";
      unselectAllBtn.className = "btn calm small";
      unselectAllBtn.textContent = "全不选";
      unselectAllBtn.onclick = () => this.unselectAllFiles();
      buttonContainer.appendChild(selectAllBtn);
      buttonContainer.appendChild(unselectAllBtn);
      (_a = storageDiv.parentElement) == null ? void 0 : _a.insertBefore(buttonContainer, storageDiv.nextSibling);
    }
    /**
     * 全选所有文件
     */
    selectAllFiles() {
      this.setAllCheckboxes(true);
    }
    /**
     * 全不选所有文件
     */
    unselectAllFiles() {
      this.setAllCheckboxes(false);
    }
    /**
     * 设置所有复选框状态
     */
    setAllCheckboxes(checked) {
      const fileCheckboxes = document.querySelectorAll(
        'ul.list-none input.charcoal-checkbox-input[type="checkbox"]'
      );
      Array.from(fileCheckboxes).forEach((checkbox) => {
        const input = checkbox;
        if (input.checked !== checked) {
          Simulate.click(input);
        }
      });
    }
  }
  class ItemNumbers extends PageModule {
    constructor(api) {
      super(api);
      __publicField(this, "_observedContainers");
    }
    get observedContainers() {
      if (!this._observedContainers) {
        this._observedContainers = /* @__PURE__ */ new WeakMap();
      }
      return this._observedContainers;
    }
    initialize(api) {
      const containers = /* @__PURE__ */ new Set();
      api.sections.forEach((section) => containers.add(section.container));
      api.variations.forEach((variation) => containers.add(variation.container));
      containers.forEach((container) => {
        this.addNumbersToList(container);
      });
      api.onSectionAdded((section) => {
        if (!this.observedContainers.has(section.container)) {
          this.addNumbersToList(section.container);
        }
      });
      api.onVariationAdded((variation) => {
        if (!this.observedContainers.has(variation.container)) {
          this.addNumbersToList(variation.container);
        }
      });
    }
    /**
     * 为列表添加序号
     */
    addNumbersToList(ul) {
      const items = Array.from(ul.children).filter(
        (child) => child.tagName.toLowerCase() === "li"
      );
      items.forEach((li, index) => {
        this.addNumberToItem(li, index + 1);
      });
      this.setupListObserver(ul);
    }
    /**
     * 为单个列表项添加序号
     */
    addNumberToItem(li, number) {
      const existingNumber = li.querySelector(".variation-number");
      existingNumber == null ? void 0 : existingNumber.remove();
      const titleContainer = li.querySelector(".variation-box-head .flex.items-center.gap-4");
      if (!titleContainer) return;
      const numberSpan = document.createElement("span");
      numberSpan.className = "variation-number typography-14 inline-block font-semibold";
      numberSpan.style.cssText = "margin-right: 8px; color: #666;";
      numberSpan.textContent = `#${number}`;
      titleContainer.insertBefore(numberSpan, titleContainer.firstChild);
    }
    /**
     * 设置列表观察器
     */
    setupListObserver(ul) {
      const existingObserver = this.observedContainers.get(ul);
      if (existingObserver) {
        existingObserver.disconnect();
      }
      const observer = new MutationObserver(() => {
        const items = Array.from(ul.children).filter(
          (child) => child.tagName.toLowerCase() === "li"
        );
        items.forEach((li, index) => {
          this.addNumberToItem(li, index + 1);
        });
      });
      observer.observe(ul, {
        childList: true,
        subtree: false
      });
      this.observedContainers.set(ul, observer);
    }
  }
  function handleError(error, fallback) {
    console.error("Booth Helper Error:", error);
    if (fallback) {
      try {
        fallback();
      } catch (e) {
        console.error("Fallback handler failed:", e);
      }
    }
  }
  const Config = {
    throttleDelay: 100,
    animationDelay: 1e3
  };
  class Utils {
    // 优化的节流函数，使用Map缓存
    static throttle(func, limit) {
      const key = func.toString();
      if (!this.throttleCache.has(key)) {
        let inThrottle;
        const throttled = function(...args) {
          if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        };
        this.throttleCache.set(key, throttled);
      }
      return this.throttleCache.get(key);
    }
    // 等待指定时间
    static sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // 等待DOM加载完成
    static async waitForDOMReady() {
      if (document.readyState === "loading") {
        await new Promise((resolve) => document.addEventListener("DOMContentLoaded", resolve));
      }
    }
    // 优化的按钮状态更新
    static updateButtonState(button, success = true, originalHtml) {
      if (!button) return;
      const newHtml = success ? '<i class="icon-check"></i><span class="cmd-label">已完成</span>' : originalHtml;
      button.innerHTML = newHtml;
      button.classList.toggle("calm", !success);
      button.classList.toggle("primary", success);
      if (success) {
        setTimeout(() => {
          button.innerHTML = originalHtml;
          button.classList.add("calm");
          button.classList.remove("primary");
        }, Config.animationDelay);
      }
    }
  }
  __publicField(Utils, "throttleCache", /* @__PURE__ */ new Map());
  class TagManager extends PageModule {
    constructor(api) {
      super(api);
    }
    initialize(api) {
      this.waitForTagContainer(api);
    }
    /**
     * 等待标签容器出现
     */
    waitForTagContainer(api) {
      const tagElements = api.tagElements;
      if (tagElements) {
        this.addTagButtons(tagElements.inputContainer);
        return;
      }
      const observer = new MutationObserver(() => {
        const elements = api.tagElements;
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
    addTagButtons(inputContainer) {
      if (inputContainer.querySelector(".tag-action-buttons")) return;
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "flex gap-2 tag-action-buttons";
      buttonContainer.style.cssText = `
            align-items: center;
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
        `;
      const copyBtn = document.createElement("a");
      copyBtn.className = "btn calm small";
      copyBtn.innerHTML = "复制标签";
      copyBtn.onclick = () => this.copyTags();
      const pasteBtn = document.createElement("a");
      pasteBtn.className = "btn calm small";
      pasteBtn.innerHTML = "粘贴标签";
      pasteBtn.onclick = () => this.pasteTags();
      const clearBtn = document.createElement("a");
      clearBtn.className = "btn calm small";
      clearBtn.innerHTML = "清空标签";
      clearBtn.onclick = () => this.clearTags();
      buttonContainer.appendChild(copyBtn);
      buttonContainer.appendChild(pasteBtn);
      buttonContainer.appendChild(clearBtn);
      inputContainer.appendChild(buttonContainer);
    }
    /**
     * 复制标签到剪贴板
     */
    copyTags() {
      try {
        const tags = this.api.getTagTexts();
        if (tags.length === 0) {
          alert("没有找到标签");
          return;
        }
        navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
          const copyBtn = document.querySelector(".tag-action-buttons .btn:first-child");
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
    async pasteTags() {
      try {
        const text = await navigator.clipboard.readText();
        const newTags = JSON.parse(text);
        if (!Array.isArray(newTags) || newTags.length === 0) {
          throw new Error("无效的标签数据");
        }
        const tagElements = this.api.tagElements;
        if (!tagElements) throw new Error("找不到标签容器");
        const { input, container } = tagElements;
        const existingTags = this.api.getTagTexts();
        const tagsToAdd = newTags.filter((tag) => !existingTags.includes(tag));
        if (tagsToAdd.length === 0) {
          alert("所有标签都已存在，无需添加");
          return;
        }
        const progress = this.createProgressTip(container);
        try {
          for (let i = 0; i < tagsToAdd.length; i++) {
            progress.updateProgress(i + 1, tagsToAdd.length);
            input.focus();
            Simulate.input(input, tagsToAdd[i]);
            await Utils.sleep(10);
            Simulate.pressEnter(input);
            await Utils.sleep(10);
          }
          progress.complete(
            `处理完成！已添加 ${tagsToAdd.length} 个新标签，跳过 ${newTags.length - tagsToAdd.length} 个已存在的标签。`
          );
          const pasteBtn = document.querySelector(".tag-action-buttons .btn:nth-child(2)");
          if (pasteBtn instanceof HTMLElement) {
            Utils.updateButtonState(pasteBtn, true, pasteBtn.innerHTML);
          }
        } catch (error) {
          progress.remove();
          throw error;
        }
      } catch (error) {
        handleError(error, () => {
          alert("粘贴标签失败：" + (error instanceof Error ? error.message : String(error)));
        });
      }
    }
    /**
     * 清空所有标签
     */
    async clearTags() {
      try {
        if (!confirm("确定要清空所有标签吗？")) return;
        const tagElements = this.api.tagElements;
        if (!tagElements) throw new Error("找不到标签容器");
        const deleteButtons = this.api.getTagDeleteButtons();
        if (deleteButtons.length === 0) {
          alert("没有找到需要清空的标签");
          return;
        }
        const progress = this.createProgressTip(tagElements.container);
        try {
          for (let i = deleteButtons.length - 1; i >= 0; i--) {
            progress.updateProgress(deleteButtons.length - i, deleteButtons.length);
            const button = deleteButtons[i];
            button.click();
            await Utils.sleep(1);
          }
          progress.complete(`处理完成！已清空 ${deleteButtons.length} 个标签。`);
          const clearBtn = document.querySelector(".tag-action-buttons .btn:nth-child(3)");
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
    createProgressTip(container) {
      const tipContainer = document.createElement("div");
      tipContainer.style.cssText = `
            margin-bottom: 12px;
            background: #f5f7fa;
            border-radius: 4px;
            padding: 12px;
            position: relative;
        `;
      const textElement = document.createElement("div");
      textElement.style.cssText = "color: #666; font-size: 14px; margin-bottom: 8px;";
      const progressBarContainer = document.createElement("div");
      progressBarContainer.style.cssText = `
            background: #e4e7ed;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
        `;
      const progressBar = document.createElement("div");
      progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: #409EFF;
            transition: width 0.3s ease;
            border-radius: 3px;
        `;
      progressBarContainer.appendChild(progressBar);
      tipContainer.appendChild(textElement);
      tipContainer.appendChild(progressBarContainer);
      const inputContainer = container.querySelector(".item-search-input__container");
      if (inputContainer == null ? void 0 : inputContainer.parentElement) {
        inputContainer.parentElement.insertBefore(tipContainer, inputContainer);
      } else {
        container.insertBefore(tipContainer, container.firstChild);
      }
      return {
        container: tipContainer,
        progressBar,
        textElement,
        updateProgress: (current, total, message) => {
          const percentage = current / total * 100;
          progressBar.style.width = `${percentage}%`;
          textElement.textContent = message || `处理中... (${current}/${total})`;
        },
        complete: (message) => {
          progressBar.style.width = "100%";
          progressBar.style.background = "#67C23A";
          textElement.textContent = message;
          setTimeout(() => tipContainer.remove(), 2e3);
        },
        remove: () => tipContainer.remove()
      };
    }
  }
  class ItemEditFeature extends PageFeature {
    constructor(context) {
      super(context);
      __publicField(this, "modules", []);
    }
    shouldExecute() {
      const path = window.location.pathname;
      return /^\/items\/\d+\/edit(_pre)?$/.test(path);
    }
    createAPI() {
      return new ItemEditAPI();
    }
    async initialize() {
      var _a;
      if (this.api) {
        this.modules.push(
          new ItemNumbers(this.api),
          new TagManager(this.api),
          new FileManager(this.api)
        );
      }
      console.log((_a = this.api) == null ? void 0 : _a.data);
    }
  }
  class ItemManageParser {
    /**
     * 从元素中提取商品ID
     */
    extractId(element) {
      var _a;
      const dataId = element.getAttribute("data-id");
      if (dataId) return dataId;
      const link = ((_a = element.querySelector(".nav")) == null ? void 0 : _a.getAttribute("href")) || "";
      const match = link.match(/\/items\/(\d+)/);
      return match ? match[1] : "";
    }
    /**
     * 解析变体列表（数据+元素）
     */
    parseVariations(element) {
      const variations = [];
      const rows = element.querySelectorAll(".dashboard-items-variation .row");
      rows.forEach((row) => {
        var _a, _b, _c, _d;
        const labelEl = row.querySelector(".dashboard-items-variation-label");
        let name = "";
        if (labelEl) {
          const textContent = labelEl.textContent || "";
          const match = textContent.match(/#\d+\s*(.+)/);
          name = match ? match[1].trim() : textContent.trim();
        }
        const priceEl = row.querySelector(".price");
        const priceText = ((_a = priceEl == null ? void 0 : priceEl.textContent) == null ? void 0 : _a.trim()) || "0";
        const price = parseInt(priceText.replace(/[^\d]/g, ""), 10) || 0;
        const salesText = ((_c = (_b = row.querySelector(".sales_quantity .count")) == null ? void 0 : _b.textContent) == null ? void 0 : _c.trim()) || "0";
        const salesCount = parseInt(salesText, 10) || 0;
        const revenueEl = row.querySelector(".sales_subtotal");
        const revenueText = ((_d = revenueEl == null ? void 0 : revenueEl.textContent) == null ? void 0 : _d.trim()) || "0";
        const revenue = parseInt(revenueText.replace(/[^\d]/g, ""), 10) || 0;
        variations.push({
          data: { name, price, salesCount, revenue },
          element: row
        });
      });
      return variations;
    }
    /**
     * 解析标签列表（文本+元素）
     */
    parseTags(element) {
      const tags = [];
      const tagElements = element.querySelectorAll(".dashboard-items-tags li");
      tagElements.forEach((li) => {
        var _a;
        const textEl = li.querySelector(".tag-text");
        const text = (_a = textEl == null ? void 0 : textEl.textContent) == null ? void 0 : _a.trim();
        if (text) {
          tags.push({
            text,
            element: li
          });
        }
      });
      return tags;
    }
    /**
     * 解析单个商品（只返回数据）
     */
    parseItem(element) {
      var _a, _b, _c, _d;
      try {
        const id = this.extractId(element);
        if (!id) return null;
        const name = ((_b = (_a = element.querySelector(".nav")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "";
        const url = ((_c = element.querySelector(".nav")) == null ? void 0 : _c.getAttribute("href")) || "";
        const thumbnail = ((_d = element.querySelector(".thumbnail img")) == null ? void 0 : _d.src) || "";
        const tags = this.parseTags(element).map((t) => t.text);
        const variations = this.parseVariations(element).map((v) => v.data);
        const favElement = element.querySelector(".item-stat.favs .count");
        const favoritesCount = favElement ? parseInt(favElement.textContent || "0", 10) || 0 : 0;
        return {
          id,
          name,
          url,
          thumbnail,
          tags,
          variations,
          favoritesCount
        };
      } catch (error) {
        console.error("解析商品失败:", error);
        return null;
      }
    }
  }
  class ItemManageAPI extends BaseAPI {
    constructor() {
      super();
      __publicField(this, "_items", []);
      __publicField(this, "_parser");
      this._parser = new ItemManageParser();
    }
    /**
     * 判断是否应该在当前页面激活
     * 只在商品管理列表页面激活（不包括编辑页面）
     */
    shouldActivate() {
      const path = window.location.pathname;
      return (path === "/items" || path === "/items/") && !path.match(/\/items\/\d+\/(edit|edit_pre)/);
    }
    /**
     * 等待商品元素出现
     */
    waitForElements(timeout = 5e3) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(".item-wrapper")) {
          resolve();
          return;
        }
        const timer = setTimeout(() => {
          observer.disconnect();
          reject(new Error("等待商品元素超时"));
        }, timeout);
        const observer = new MutationObserver(() => {
          if (document.querySelector(".item-wrapper")) {
            clearTimeout(timer);
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }
    /**
     * 加载商品数据
     * 等待商品元素出现后再加载
     */
    async load() {
      await this.waitForElements();
      this._items = [];
      const elements = document.querySelectorAll(".item-wrapper");
      elements.forEach((element) => {
        const htmlElement = element;
        const data = this._parser.parseItem(element);
        if (data) {
          const variationsUl = htmlElement.querySelector(".dashboard-items-variation");
          const tagsUl = htmlElement.querySelector(".dashboard-items-tags");
          const variations = this._parser.parseVariations(htmlElement);
          const tags = this._parser.parseTags(htmlElement);
          this._items.push({
            data,
            element: htmlElement,
            variationsUl,
            tagsUl,
            variations,
            tags
          });
        }
      });
    }
    /**
     * 获取所有商品（包含数据和DOM元素）
     */
    getItems() {
      return [...this._items];
    }
    /**
     * 获取所有商品数据（只返回数据，不含DOM元素）
     */
    getItemsData() {
      return this._items.map((item) => item.data);
    }
    /**
     * 根据ID获取商品（包含数据和DOM元素）
     */
    getItem(id) {
      return this._items.find((item) => item.data.id === id);
    }
    /**
     * 根据ID获取商品数据（只返回数据）
     */
    getItemData(id) {
      var _a;
      return (_a = this._items.find((item) => item.data.id === id)) == null ? void 0 : _a.data;
    }
    /**
     * 根据ID获取DOM元素
     */
    getItemElement(id) {
      var _a;
      return (_a = this._items.find((item) => item.data.id === id)) == null ? void 0 : _a.element;
    }
    /**
     * 刷新数据（重新解析DOM）
     */
    refresh() {
      this.load();
    }
    /**
     * 复制商品标签到剪贴板
     * @param itemId 商品ID
     * @returns 是否复制成功
     */
    async copyItemTags(itemId) {
      const item = this.getItem(itemId);
      if (!item) {
        console.error(`未找到商品: ${itemId}`);
        return false;
      }
      const tags = item.data.tags;
      if (tags.length === 0) {
        alert("没有找到标签");
        return false;
      }
      try {
        await navigator.clipboard.writeText(JSON.stringify(tags));
        return true;
      } catch (error) {
        console.error("复制标签失败:", error);
        return false;
      }
    }
  }
  class ItemActions extends PageModule {
    constructor(api) {
      super(api);
    }
    initialize(api) {
      const items = api.getItems();
      items.forEach((item) => {
        this.addToItem(item.element);
      });
    }
    /**
     * 为商品添加操作按钮
     * @param item 商品元素
     */
    addToItem(item) {
      try {
        if (item.querySelector(".tag-copy-btn") || item.querySelector(".item-delete-btn-x")) return;
        this.addDeleteButton(item);
        this.addCopyTagsButton(item);
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 添加删除按钮
     */
    addDeleteButton(item) {
      const itemId = item.getAttribute("data-id");
      if (!itemId) return;
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "item-delete-btn-x";
      deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
      deleteBtn.title = "删除商品";
      deleteBtn.onclick = async (e) => {
        e.preventDefault();
        await this.handleDeleteItem(item, itemId);
      };
      if (getComputedStyle(item).position === "static") {
        item.style.position = "relative";
      }
      this.injectDeleteButtonStyles();
      item.appendChild(deleteBtn);
    }
    /**
     * 注入删除按钮样式
     */
    injectDeleteButtonStyles() {
      if (document.getElementById("item-delete-btn-styles")) return;
      const style = document.createElement("style");
      style.id = "item-delete-btn-styles";
      style.textContent = `
            .item-delete-btn-x {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 10;
                width: 28px;
                height: 28px;
                padding: 0;
                border: none;
                border-radius: 50%;
                background-color: #fff;
                color: #666;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .item-delete-btn-x svg {
                width: 16px;
                height: 16px;
                display: block;
            }

            .item-delete-btn-x:hover {
                background-color: #ff5252;
                color: #fff;
                box-shadow: 0 4px 8px rgba(255, 82, 82, 0.3);
                transform: scale(1.1);
            }

            .item-delete-btn-x:active {
                transform: scale(0.95);
            }
        `;
      document.head.appendChild(style);
    }
    /**
     * 添加复制标签按钮
     */
    addCopyTagsButton(item) {
      const tagList = item.querySelector(".dashboard-items-tags");
      const footerActions = item.querySelector(".dashboard-item-footer-actions");
      const itemId = item.getAttribute("data-id");
      if (tagList && footerActions && itemId) {
        const copyBtn = document.createElement("a");
        copyBtn.className = "btn calm small tag-copy-btn mr-8";
        copyBtn.innerHTML = "复制标签";
        copyBtn.onclick = async (e) => {
          e.preventDefault();
          const success = await this.api.copyItemTags(itemId);
          if (success) {
            Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
          }
        };
        footerActions.insertBefore(copyBtn, footerActions.firstChild);
      }
    }
    /**
     * 处理删除商品
     */
    async handleDeleteItem(item, itemId) {
      var _a, _b, _c;
      try {
        if (!confirm("确定要删除这个商品吗？此操作不可恢复。")) return;
        const itemName = ((_b = (_a = item.querySelector(".nav")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "未知商品";
        if (!confirm(`再次确认删除商品：
${itemName}
ID: ${itemId}`)) return;
        const csrfToken = (_c = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _c.getAttribute("content");
        if (!csrfToken) {
          throw new Error("无法获取CSRF token");
        }
        const response = await fetch(`https://manage.booth.pm/items/${itemId}`, {
          method: "DELETE",
          headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "x-requested-with": "XMLHttpRequest",
            "x-csrf-token": csrfToken
          },
          referrer: window.location.href,
          referrerPolicy: "strict-origin-when-cross-origin",
          mode: "cors",
          credentials: "include"
        });
        if (response.ok) {
          item.remove();
        } else {
          const errorText = await response.text();
          console.log("删除失败响应:", errorText);
          throw new Error(`删除失败: ${response.status}
${errorText}`);
        }
      } catch (error) {
        handleError(error, () => {
          alert("删除商品失败，请刷新页面重试");
        });
      }
    }
  }
  class ItemCollapse extends PageModule {
    constructor(api) {
      super(api);
      __publicField(this, "_processedItems");
      __publicField(this, "stylesInjected", false);
    }
    get processedItems() {
      if (!this._processedItems) {
        this._processedItems = /* @__PURE__ */ new Set();
      }
      return this._processedItems;
    }
    initialize(api) {
      this.injectStyles();
      const items = api.getItems();
      items.forEach((itemElement) => {
        this.addToItem(itemElement);
      });
    }
    /**
     * 为商品添加折叠功能
     * @param itemElement API 提供的商品元素
     */
    addToItem(itemElement) {
      var _a, _b;
      try {
        const { element, variationsUl, tagsUl, variations } = itemElement;
        if (this.processedItems.has(element)) return;
        this.processedItems.add(element);
        const headers = [];
        if (variationsUl && variations.length > 0 && !((_a = variationsUl.previousElementSibling) == null ? void 0 : _a.classList.contains("item-collapse-header"))) {
          const header = this.createVariationHeader(itemElement);
          headers.push({ header, target: variationsUl });
        }
        if (tagsUl && itemElement.tags.length > 0 && !((_b = tagsUl.previousElementSibling) == null ? void 0 : _b.classList.contains("item-collapse-header"))) {
          const header = this.createTagHeader(tagsUl);
          headers.push({ header, target: tagsUl });
        }
        headers.forEach(({ header, target }) => {
          var _a2;
          (_a2 = target.parentElement) == null ? void 0 : _a2.insertBefore(header, target);
          target.classList.add("item-collapsible", "collapsed");
        });
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 创建变体列表折叠标题（使用 API 数据）
     */
    createVariationHeader(itemElement) {
      const { variations, variationsUl } = itemElement;
      const count = variations.length;
      const totalSales = variations.reduce((sum, v) => sum + v.data.salesCount, 0);
      const totalRevenue = variations.reduce((sum, v) => sum + v.data.revenue, 0);
      const header = document.createElement("div");
      header.className = "item-collapse-header";
      const titleSection = document.createElement("div");
      titleSection.className = "item-collapse-title";
      titleSection.innerHTML = `
            <span class="item-collapse-icon collapsed">▼</span>
            <span>变体列表</span>
        `;
      const badgesContainer = document.createElement("div");
      badgesContainer.className = "item-collapse-badges";
      badgesContainer.innerHTML = `
            <span class="item-badge item-badge-count">变体: <strong>${count}</strong></span>
            <span class="item-badge item-badge-sales">销量: <strong>${totalSales}</strong></span>
            <span class="item-badge item-badge-revenue">收益: <strong>${totalRevenue.toLocaleString()}</strong></span>
        `;
      header.appendChild(titleSection);
      header.appendChild(badgesContainer);
      const icon = header.querySelector(".item-collapse-icon");
      let isCollapsed = true;
      header.onclick = () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
          variationsUl.classList.add("collapsed");
          icon.classList.add("collapsed");
        } else {
          variationsUl.classList.remove("collapsed");
          icon.classList.remove("collapsed");
        }
      };
      return header;
    }
    /**
     * 创建标签列表折叠标题
     */
    createTagHeader(tagsUl) {
      const header = document.createElement("div");
      header.className = "item-collapse-header";
      const titleSection = document.createElement("div");
      titleSection.className = "item-collapse-title";
      titleSection.innerHTML = `
            <span class="item-collapse-icon collapsed">▼</span>
            <span>标签列表</span>
        `;
      header.appendChild(titleSection);
      const icon = header.querySelector(".item-collapse-icon");
      let isCollapsed = true;
      header.onclick = () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
          tagsUl.classList.add("collapsed");
          icon.classList.add("collapsed");
        } else {
          tagsUl.classList.remove("collapsed");
          icon.classList.remove("collapsed");
        }
      };
      return header;
    }
    /**
     * 注入样式表
     */
    injectStyles() {
      if (this.stylesInjected) {
        return;
      }
      this.stylesInjected = true;
      const style = document.createElement("style");
      style.id = "booth-item-collapse-styles";
      style.textContent = `
            /* 折叠图标样式 */
            .item-collapse-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                margin-right: 6px;
                font-size: 10px;
                color: #666;
                flex-shrink: 0;
                transition: transform 0.2s ease;
            }

            .item-collapse-icon.collapsed {
                transform: rotate(-90deg);
            }

            /* 折叠容器样式 - 使用 GPU 加速属性 */
            .item-collapsible {
                overflow: hidden;
                max-height: 5000px;
                will-change: max-height, opacity; /* 提示浏览器优化 */
                contain: layout style paint; /* 限制重排范围 */
            }

            .item-collapsible.collapsed {
                max-height: 0 !important;
                opacity: 0;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                /* 使用 transform 代替部分属性，GPU 加速 */
                transform: translateZ(0);
            }

            /* 折叠标题容器 */
            .item-collapse-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 13px;
                color: #333;
                user-select: none;
                border-bottom: 1px solid #e0e0e0;
                cursor: pointer;
                transition: background-color 0.2s ease;
                gap: 12px;
            }
            
            .item-collapse-header:hover {
                background-color: #f5f5f5;
            }
            
            .item-collapse-header:first-of-type {
                margin-top: 8px;
            }

            /* 标题部分 */
            .item-collapse-title {
                display: flex;
                align-items: center;
                flex-shrink: 0;
            }

            /* Badges 容器 */
            .item-collapse-badges {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: auto;
                flex-wrap: wrap;
                justify-content: flex-end;
            }

            /* Badge 基础样式 */
            .item-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 400;
                border-radius: 12px;
                white-space: nowrap;
            }

            .item-badge strong {
                font-weight: 600;
            }

            /* Badge 变体数量 */
            .item-badge-count {
                background-color: #e3f2fd;
                color: #1976d2;
            }

            /* Badge 销量 */
            .item-badge-sales {
                background-color: #f3e5f5;
                color: #7b1fa2;
            }

            /* Badge 收益 */
            .item-badge-revenue {
                background-color: #e8f5e9;
                color: #388e3c;
            }
        `;
      document.head.appendChild(style);
    }
  }
  class ItemNavigation extends PageModule {
    constructor(api) {
      super(api);
      __publicField(this, "navigationContainer", null);
      __publicField(this, "toggleButton", null);
      __publicField(this, "items", []);
      __publicField(this, "isExpanded", false);
      __publicField(this, "searchInput", null);
      __publicField(this, "filteredItems", []);
      __publicField(this, "isScrolling", false);
      __publicField(this, "scrollTimeout", null);
      __publicField(this, "hoverTimeout", null);
    }
    initialize(api) {
      this.items = api.getItems();
      this.injectStyles();
      setTimeout(() => {
        this.createNavigation();
      }, 1e3);
    }
    /**
     * 创建商品导航栏
     */
    createNavigation() {
      try {
        if (document.querySelector(".item-navigation")) return;
        if (this.items.length === 0) return;
        this.injectStyles();
        this.createToggleButton();
        this.createNavigationContainer();
        this.createNavigationItems();
        this.setupScrollListener();
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 注入样式表
     */
    injectStyles() {
      if (document.querySelector("#booth-navigation-styles")) return;
      const style = document.createElement("style");
      style.id = "booth-navigation-styles";
      style.textContent = `
            .navigation-toggle-button {
            position: fixed;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
                width: 30px;
                height: 60px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e0e0e0;
            border-right: none;
            border-radius: 8px 0 0 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.2s ease;
                z-index: 999;
                font-size: 12px;
                color: #666;
            }

            .navigation-toggle-button:hover {
                background: #f8f9fa;
                box-shadow: -2px 0 6px rgba(0, 0, 0, 0.15);
            }

            .item-navigation {
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%) translateX(100%);
                width: 400px;
                min-width: 300px;
                max-width: 500px;
                height: 80vh;
                max-height: 80vh;
                z-index: 1000;
                transition: transform 0.3s ease;
                pointer-events: none;
                box-sizing: border-box;
            }

            .item-navigation.expanded {
                transform: translateY(-50%) translateX(0);
            }

            .navigation-content {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #e0e0e0;
            border-radius: 12px 0 0 12px;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
                pointer-events: auto;
            }

            /* 导航项样式 */
            .navigation-item {
                padding: 6px 8px;
                margin-bottom: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
                display: flex;
                align-items: flex-start;
                gap: 8px;
            }

            /* 导航项hover效果 */
            .navigation-item:hover:not(.active) {
                background-color: #f8f9fa;
                border-color: #e9ecef;
            }

            /* 导航项active状态 */
            .navigation-item.active {
                background-color: #e3f2fd !important;
                border-left-color: #2196f3 !important;
                border-color: #bbdefb !important;
            }

            /* PC端：hover显示（通过JavaScript处理，这里只处理样式） */
            @media (hover: hover) and (pointer: fine) {
                .item-navigation:hover {
                    pointer-events: auto;
                }
            }

            /* 移动端：点击切换 */
            @media (max-width: 768px) {
                .item-navigation {
                    width: 100%;
                    max-width: 400px;
                    height: 70vh;
                    max-height: 70vh;
                }

                .navigation-toggle-button {
                    width: 40px;
                    height: 60px;
                }
            }

            /* 小屏幕移动端 */
            @media (max-width: 480px) {
                .item-navigation {
                    width: 100%;
                    height: 85vh;
                    max-height: 85vh;
                    top: 50%;
                    transform: translateY(-50%) translateX(100%);
                }

                .item-navigation.expanded {
                    transform: translateY(-50%) translateX(0);
                }
            }

            /* 头部样式 */
            .navigation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            flex-shrink: 0;
                pointer-events: auto;
            }

            .navigation-header-title {
            font-weight: 600;
            color: #333;
            font-size: 14px;
            }

            /* 关闭按钮样式 */
            .navigation-close-button {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #666;
                font-size: 20px;
                line-height: 1;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .navigation-close-button:hover {
                background-color: #e0e0e0;
                color: #333;
            }

            /* 搜索容器样式 */
            .navigation-search {
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #fff;
            flex-shrink: 0;
            width: 100%;
                min-width: 0;
                box-sizing: border-box;
                display: block;
            }

            /* 搜索输入框样式 */
            .navigation-search-input {
                width: 100% !important;
                height: 32px;
            padding: 8px 12px;
                margin: 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 12px;
            outline: none;
            transition: border-color 0.2s;
                box-sizing: border-box;
                line-height: 1;
                display: block;
                max-width: none;
                min-width: 0;
            }

            .navigation-search-input:focus {
                border-color: #2196f3;
            }

            /* 列表容器样式 */
            .navigation-items-container {
            flex: 1;
            overflow-y: auto;
            padding: 4px;
            min-height: 0;
            scrollbar-width: thin;
            scrollbar-color: #ccc #f5f5f5;
            }

            /* 空状态样式 */
            .navigation-empty-state {
                text-align: center;
                color: #666;
                padding: 20px;
                font-style: italic;
            }

            /* 缩略图容器样式 */
            .navigation-thumbnail {
                width: 40px;
                height: 40px;
                flex-shrink: 0;
                border-radius: 4px;
                overflow: hidden;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .navigation-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* 商品信息容器样式 */
            .navigation-item-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                flex: 1;
                min-width: 0;
            }

            .navigation-item-name-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 8px;
            }

            .navigation-item-name {
                flex: 1;
                margin-right: 6px;
                font-weight: 500;
                font-size: 11px;
                line-height: 1.3;
                word-wrap: break-word;
                min-width: 0;
            }

            .navigation-item-variant-count {
                color: #666;
                font-size: 9px;
                flex-shrink: 0;
                background: #f0f0f0;
                padding: 1px 4px;
                border-radius: 8px;
            }

            .navigation-item-stats-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
                color: #666;
            }

            .navigation-item-stats-left {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .navigation-item-sales {
                font-weight: 500;
            }

            .navigation-item-sales.has-sales {
                color: #28a745;
            }

            .navigation-item-sales.no-sales {
                color: #999;
            }

            .navigation-item-favorites {
                font-weight: 500;
            }

            .navigation-item-favorites.has-favorites {
                color: #f48fb1;
            }

            .navigation-item-favorites.no-favorites {
                color: #999;
            }

            .navigation-item-index {
                color: #999;
                font-size: 9px;
            }
        `;
      document.head.appendChild(style);
    }
    /**
     * 创建独立的切换按钮
     */
    createToggleButton() {
      if (document.querySelector(".navigation-toggle-button")) return;
      this.toggleButton = document.createElement("div");
      this.toggleButton.className = "navigation-toggle-button";
      this.toggleButton.innerHTML = "◀";
      this.toggleButton.onclick = (e) => {
        e.stopPropagation();
        this.toggleNavigation();
      };
      this.toggleButton.onmouseenter = () => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          this.showNavigation();
        }
      };
      document.body.appendChild(this.toggleButton);
    }
    /**
     * 创建导航栏容器
     */
    createNavigationContainer() {
      this.navigationContainer = document.createElement("div");
      this.navigationContainer.className = "item-navigation";
      this.createContentContainer();
      document.body.appendChild(this.navigationContainer);
      this.setupPCHoverBehavior();
    }
    /**
     * 设置PC端hover行为
     */
    setupPCHoverBehavior() {
      if (!this.navigationContainer || !this.toggleButton) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }
      this.navigationContainer.onmouseenter = () => {
        if (this.hoverTimeout) {
          clearTimeout(this.hoverTimeout);
          this.hoverTimeout = null;
        }
      };
      this.navigationContainer.onmouseleave = () => {
        if (this.hoverTimeout) {
          clearTimeout(this.hoverTimeout);
        }
        this.hoverTimeout = window.setTimeout(() => {
          const buttonRect = this.toggleButton.getBoundingClientRect();
          const mouseX = window.lastMouseX || 0;
          const mouseY = window.lastMouseY || 0;
          if (!(mouseX >= buttonRect.left && mouseX <= buttonRect.right && mouseY >= buttonRect.top && mouseY <= buttonRect.bottom)) {
            this.hideNavigation();
          }
        }, 200);
      };
      document.addEventListener("mousemove", (e) => {
        window.lastMouseX = e.clientX;
        window.lastMouseY = e.clientY;
      });
    }
    /**
     * 创建内容容器
     */
    createContentContainer() {
      const contentContainer = document.createElement("div");
      contentContainer.className = "navigation-content";
      const header = document.createElement("div");
      header.className = "navigation-header";
      const title = document.createElement("div");
      title.className = "navigation-header-title";
      title.textContent = `商品导航 (${this.items.length})`;
      header.appendChild(title);
      const closeButton = document.createElement("div");
      closeButton.className = "navigation-close-button";
      closeButton.innerHTML = "×";
      closeButton.onclick = () => {
        this.hideNavigation();
      };
      header.appendChild(closeButton);
      const searchContainer = document.createElement("div");
      searchContainer.className = "navigation-search";
      this.searchInput = document.createElement("input");
      this.searchInput.type = "text";
      this.searchInput.className = "navigation-search-input";
      this.searchInput.placeholder = "搜索商品...";
      this.searchInput.oninput = () => this.filterItems();
      searchContainer.appendChild(this.searchInput);
      const itemsContainer = document.createElement("div");
      itemsContainer.className = "navigation-items-container";
      if (!document.querySelector("#navigation-scrollbar-style")) {
        const style = document.createElement("style");
        style.id = "navigation-scrollbar-style";
        style.textContent = `
                .navigation-items-container::-webkit-scrollbar {
                    width: 6px;
                }
                .navigation-items-container::-webkit-scrollbar-track {
                    background: #f5f5f5;
                    border-radius: 3px;
                }
                .navigation-items-container::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 3px;
                }
                .navigation-items-container::-webkit-scrollbar-thumb:hover {
                    background: #999;
                }
            `;
        document.head.appendChild(style);
      }
      contentContainer.appendChild(header);
      contentContainer.appendChild(searchContainer);
      contentContainer.appendChild(itemsContainer);
      this.navigationContainer.appendChild(contentContainer);
    }
    /**
     * 切换导航栏状态（移动端使用）
     */
    toggleNavigation() {
      if (!this.navigationContainer) return;
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.showNavigation();
      } else {
        this.hideNavigation();
      }
    }
    /**
     * 显示导航栏
     */
    showNavigation() {
      if (!this.navigationContainer) return;
      this.navigationContainer.classList.add("expanded");
      this.isExpanded = true;
      if (this.toggleButton) {
        this.toggleButton.innerHTML = "▶";
      }
    }
    /**
     * 隐藏导航栏
     */
    hideNavigation() {
      if (!this.navigationContainer) return;
      this.navigationContainer.classList.remove("expanded");
      this.isExpanded = false;
      if (this.toggleButton) {
        this.toggleButton.innerHTML = "◀";
      }
    }
    /**
     * 创建导航项（使用 API 数据）
     */
    createNavigationItems() {
      var _a;
      if (!this.navigationContainer) return;
      const itemsContainer = this.navigationContainer.querySelector(".navigation-items-container");
      if (!itemsContainer) return;
      itemsContainer.innerHTML = "";
      const itemsToShow = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      if (itemsToShow.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "navigation-empty-state";
        emptyState.textContent = ((_a = this.searchInput) == null ? void 0 : _a.value) ? "未找到匹配的商品" : "暂无商品";
        itemsContainer.appendChild(emptyState);
        return;
      }
      itemsToShow.forEach((itemElement, index) => {
        const { data, element, variations } = itemElement;
        const variationCount = variations.length;
        const salesCount = variations.reduce((sum, v) => sum + v.data.salesCount, 0);
        const favoritesCount = data.favoritesCount;
        const navItem = document.createElement("div");
        navItem.className = "navigation-item";
        navItem.setAttribute("data-item-id", data.id);
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.className = "navigation-thumbnail";
        if (data.thumbnail) {
          const img = document.createElement("img");
          img.src = data.thumbnail;
          img.onerror = () => {
            thumbnailContainer.innerHTML = '<div style="color: #999; font-size: 10px;">无图</div>';
          };
          thumbnailContainer.appendChild(img);
        } else {
          thumbnailContainer.innerHTML = '<div style="color: #999; font-size: 10px;">无图</div>';
        }
        const itemInfo = document.createElement("div");
        itemInfo.className = "navigation-item-info";
        const nameRow = document.createElement("div");
        nameRow.className = "navigation-item-name-row";
        const nameSpan = document.createElement("span");
        nameSpan.className = "navigation-item-name";
        nameSpan.textContent = data.name;
        const countSpan = document.createElement("span");
        countSpan.className = "navigation-item-variant-count";
        countSpan.textContent = `${variationCount}变体`;
        nameRow.appendChild(nameSpan);
        nameRow.appendChild(countSpan);
        const statsRow = document.createElement("div");
        statsRow.className = "navigation-item-stats-row";
        const statsLeft = document.createElement("div");
        statsLeft.className = "navigation-item-stats-left";
        const salesSpan = document.createElement("span");
        salesSpan.className = `navigation-item-sales ${salesCount > 0 ? "has-sales" : "no-sales"}`;
        salesSpan.textContent = `销量: ${salesCount}`;
        const favsSpan = document.createElement("span");
        favsSpan.className = `navigation-item-favorites ${favoritesCount > 0 ? "has-favorites" : "no-favorites"}`;
        favsSpan.innerHTML = `<span style="color: inherit;">❤️</span> ${favoritesCount}`;
        statsLeft.appendChild(salesSpan);
        statsLeft.appendChild(favsSpan);
        const indexSpan = document.createElement("span");
        indexSpan.className = "navigation-item-index";
        indexSpan.textContent = `#${index + 1}`;
        statsRow.appendChild(statsLeft);
        statsRow.appendChild(indexSpan);
        itemInfo.appendChild(statsRow);
        itemInfo.appendChild(nameRow);
        navItem.appendChild(thumbnailContainer);
        navItem.appendChild(itemInfo);
        navItem.onclick = () => this.scrollToItem(element, navItem);
        itemsContainer.appendChild(navItem);
      });
    }
    /**
     * 过滤商品（使用 API 数据）
     */
    filterItems() {
      if (!this.searchInput) return;
      const searchTerm = this.searchInput.value.toLowerCase().trim();
      if (searchTerm === "") {
        this.filteredItems = [];
      } else {
        this.filteredItems = this.items.filter((itemElement) => {
          const { data } = itemElement;
          return data.name.toLowerCase().includes(searchTerm) || data.id.includes(searchTerm);
        });
      }
      this.createNavigationItems();
    }
    /**
     * 滚动到指定商品
     */
    scrollToItem(item, navItem) {
      try {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.setActiveItem(navItem);
        this.isScrolling = true;
        if (window.matchMedia("(max-width: 768px)").matches && !this.isExpanded) {
          this.showNavigation();
        }
        item.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        this.scrollTimeout = window.setTimeout(() => {
          this.highlightItem(item);
          this.setActiveItem(navItem);
          this.isScrolling = false;
          this.scrollTimeout = null;
        }, 800);
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 设置活跃商品
     */
    setActiveItem(activeNavItem) {
      var _a;
      (_a = this.navigationContainer) == null ? void 0 : _a.querySelectorAll(".navigation-item").forEach((el) => {
        el.classList.remove("active");
      });
      activeNavItem.classList.add("active");
    }
    /**
     * 高亮商品
     */
    highlightItem(item) {
      item.style.outline = "2px solid #2196f3";
      item.style.outlineOffset = "2px";
      item.style.transition = "outline 0.3s ease";
      setTimeout(() => {
        item.style.outline = "";
        item.style.outlineOffset = "";
      }, 3e3);
    }
    /**
     * 设置滚动监听
     */
    setupScrollListener() {
      let ticking = false;
      const updateActiveItem = () => {
        if (!this.navigationContainer || this.isScrolling) return;
        const windowHeight = window.innerHeight;
        let activeItem = null;
        let minDistance = Infinity;
        const currentItems = Array.from(document.querySelectorAll(".item-wrapper"));
        currentItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (rect.top < windowHeight && rect.bottom > 0) {
            const itemCenter = rect.top + rect.height / 2;
            const screenCenter = windowHeight / 2;
            const distance = Math.abs(itemCenter - screenCenter);
            if (distance < minDistance) {
              minDistance = distance;
              activeItem = item;
            }
          }
        });
        if (activeItem) {
          const itemId = activeItem.getAttribute("data-id");
          if (itemId) {
            const activeNavItem = this.navigationContainer.querySelector(`[data-item-id="${itemId}"]`);
            if (activeNavItem instanceof HTMLElement) {
              this.setActiveItem(activeNavItem);
            }
          }
        }
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(updateActiveItem);
          ticking = true;
        }
      };
      window.addEventListener("scroll", onScroll);
      this.scrollListener = onScroll;
    }
  }
  class VariationNumbers extends PageModule {
    constructor(api) {
      super(api);
    }
    initialize(api) {
      const items = api.getItems();
      items.forEach((itemElement) => {
        this.addToItem(itemElement);
      });
    }
    /**
     * 为商品添加变体序号（使用 API 数据）
     * @param itemElement API 提供的商品元素
     */
    addToItem(itemElement) {
      try {
        const { element, variationsUl, variations } = itemElement;
        if (!variationsUl || !variations.length) return;
        this.addNumbersToVariations(variations);
        this.setupVariationObserver(element, variationsUl, variations);
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 为变体添加序号（使用 API 的 variations）
     */
    addNumbersToVariations(variations) {
      variations.forEach((variationElement, index) => {
        const labelArea = variationElement.element.querySelector(".dashboard-items-variation-label");
        if (!labelArea) return;
        let numberSpan = variationElement.element.querySelector(".variation-number");
        if (!numberSpan) {
          numberSpan = document.createElement("span");
          numberSpan.className = "variation-number";
          numberSpan.style.cssText = "margin-right: 8px; color: #666;";
          labelArea.insertBefore(numberSpan, labelArea.firstChild);
        }
        numberSpan.textContent = `#${index + 1}`;
      });
    }
    /**
     * 设置变体列表观察器（使用 API 的 variations）
     */
    setupVariationObserver(item, variationList, variations) {
      const observer = new MutationObserver(Utils.throttle((_mutations, _observer) => {
        const needsUpdate = variations.some((variationElement, index) => {
          const numberSpan = variationElement.element.querySelector(".variation-number");
          return !numberSpan || numberSpan.textContent !== `#${index + 1}`;
        });
        if (needsUpdate) {
          requestAnimationFrame(() => this.addNumbersToVariations(variations));
        }
      }, Config.throttleDelay));
      observer.observe(variationList, {
        childList: true,
        subtree: false
      });
      item.variationObserver = observer;
    }
  }
  class ItemManageFeature extends PageFeature {
    constructor(context) {
      super(context);
      __publicField(this, "modules", []);
    }
    shouldExecute() {
      return this.path === "/items" || this.path === "/items/";
    }
    createAPI() {
      return new ItemManageAPI();
    }
    async initialize() {
      if (this.api) {
        this.modules.push(
          new ItemNavigation(this.api),
          new ItemActions(this.api),
          new ItemCollapse(this.api),
          new VariationNumbers(this.api)
        );
      }
    }
  }
  var _GM_notification = /* @__PURE__ */ (() => typeof GM_notification != "undefined" ? GM_notification : void 0)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_setClipboard = /* @__PURE__ */ (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  class SessionAPI extends BaseAPI {
    constructor() {
      super();
    }
    /**
     * 判断是否应该在当前页面激活
     * Session API 在所有页面都可用
     */
    shouldActivate() {
      return true;
    }
    /**
     * 加载数据（Session API 不需要预加载）
     */
    load() {
    }
    /**
     * 从响应头中提取 Cookie 信息
     */
    extractCookieInfo(headers) {
      var _a, _b;
      const cookieHeader = headers.split("\n").find((line) => line.toLowerCase().startsWith("set-cookie:") && line.includes("_plaza_session_nktz7u="));
      if (!cookieHeader) return null;
      const value = cookieHeader.split(";")[0].split("=").slice(1).join("=").trim();
      const expires = (_b = (_a = cookieHeader.match(/expires=([^;]+)/i)) == null ? void 0 : _a[1]) == null ? void 0 : _b.trim();
      return {
        value,
        expires: expires ? new Date(expires).toISOString() : null
      };
    }
    /**
     * 获取 Booth Session
     * @returns Promise<SessionResult> Session 数据或错误信息
     */
    async getSession() {
      return new Promise((resolve) => {
        _GM_xmlhttpRequest({
          method: "GET",
          url: "https://manage.booth.pm/orders",
          headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8"
          },
          onload: (response) => {
            const cookieInfo = this.extractCookieInfo(response.responseHeaders);
            if (cookieInfo) {
              const sessionData = {
                _plaza_session_nktz7u: cookieInfo.value,
                updated_at: (/* @__PURE__ */ new Date()).toISOString(),
                expires_at: cookieInfo.expires
              };
              resolve({
                success: true,
                data: sessionData
              });
            } else {
              resolve({
                success: false,
                error: "未找到有效的 Session"
              });
            }
          },
          onerror: (error) => {
            resolve({
              success: false,
              error: `请求出错: ${error.error || "网络错误"}`
            });
          }
        });
      });
    }
    /**
     * 获取 Session 并格式化为 JSON 字符串
     * @returns Promise<string | null> JSON 格式的 Session 数据
     */
    async getSessionJSON() {
      const result = await this.getSession();
      if (result.success && result.data) {
        return JSON.stringify(result.data, null, 2);
      }
      return null;
    }
  }
  class SessionFeature extends PageFeature {
    constructor(context) {
      super(context);
    }
    shouldExecute() {
      return true;
    }
    createAPI() {
      return new SessionAPI();
    }
    async initialize() {
      _GM_registerMenuCommand("获取Booth Session", () => this.getSessionAndCopy());
    }
    /**
     * 获取 Session 并复制到剪贴板
     */
    async getSessionAndCopy() {
      const api = this.getAPI();
      if (!api) return;
      const result = await api.getSession();
      if (result.success && result.data) {
        const jsonData = JSON.stringify(result.data, null, 2);
        _GM_setClipboard(jsonData, "Booth Session");
        _GM_notification({
          text: result.data.expires_at ? `Session已复制
过期时间: ${new Date(result.data.expires_at).toLocaleString()}` : "Session已复制到剪贴板",
          title: "获取成功",
          timeout: 3e3
        });
      } else {
        _GM_notification({
          text: result.error || "未找到有效的 Session",
          title: "获取失败",
          timeout: 3e3
        });
      }
    }
  }
  class BoothEnhancer {
    constructor() {
      __publicField(this, "context", {
        observers: /* @__PURE__ */ new Map(),
        cachedElements: /* @__PURE__ */ new Map()
      });
      __publicField(this, "features", [
        // new OrderAnalysisFeature(this.context),
        new ItemEditFeature(this.context),
        new ItemManageFeature(this.context),
        new SessionFeature(this.context)
      ]);
    }
    async init() {
      try {
        for (const feature of this.features) {
          try {
            if (feature.shouldExecute()) {
              await feature.execute();
            }
          } catch (error) {
            handleError(error);
          }
        }
      } catch (error) {
        handleError(error, () => {
          console.error("Booth Enhancer 启动失败");
        });
      }
    }
  }
  new BoothEnhancer().init();

})();