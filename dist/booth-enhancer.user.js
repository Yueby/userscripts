// ==UserScript==
// @name               Booth ItemPage Enhancer
// @name:zh-CN         Booth 商品页面增强
// @namespace          yueby.booth
// @version            0.1.9
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
  class Feature {
    constructor(context) {
      __publicField(this, "context");
      __publicField(this, "path");
      this.context = context;
      this.path = window.location.pathname;
    }
    /**
     * 判断当前页面是否应该执行此功能
     */
    shouldExecute() {
      return false;
    }
    /**
     * 执行页面功能
     */
    async execute() {
    }
    /**
     * 清理资源
     */
    cleanup() {
    }
  }
  class ItemEditFeature extends Feature {
    shouldExecute() {
      return /^\/items\/\d+\/edit(_pre)?$/.test(this.path);
    }
    async execute() {
      super.execute();
      this.addNumbers();
      this.addTagButtons();
    }
    // 变体序号功能
    addNumbers() {
      const allUlElements = document.querySelectorAll("ul.grid.gap-16");
      if (allUlElements.length === 0) {
        const observer = new MutationObserver((_, obs) => {
          if (document.querySelectorAll("ul.grid.gap-16").length > 0) {
            obs.disconnect();
            this.addNumbers();
          }
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        this.context.observers.set("variation-numbers-wait", observer);
        return;
      }
      allUlElements.forEach((variationList) => {
        const hasVariationItems = variationList.querySelector("li .variation-box-head") !== null;
        if (!hasVariationItems) {
          return;
        }
        const children = Array.from(variationList.children).filter((child) => child.tagName.toLowerCase() === "li");
        children.forEach((li, index) => {
          const existingNumberSpan = li.querySelector(".variation-number");
          if (existingNumberSpan) {
            existingNumberSpan.remove();
          }
          const titleContainer = li.querySelector(".variation-box-head .flex.items-center.gap-4");
          if (!titleContainer) {
            return;
          }
          const numberSpan = document.createElement("span");
          numberSpan.className = "variation-number typography-14 inline-block font-semibold";
          numberSpan.style.cssText = "margin-right: 8px; color: #666;";
          numberSpan.textContent = `#${index + 1}`;
          titleContainer.insertBefore(numberSpan, titleContainer.firstChild);
        });
      });
      allUlElements.forEach((ul) => {
        if (ul.querySelector("li .variation-box-head")) {
          const observer = new MutationObserver(() => {
            this.processUlNumbers(ul);
          });
          observer.observe(ul, {
            childList: true,
            // 监听子元素的添加和删除
            subtree: false
            // 不监听深层子元素的变化
          });
          const observerId = `ul-${Date.now()}`;
          this.context.observers.set(observerId, observer);
        }
      });
      const bodyObserver = new MutationObserver((mutations) => {
        let newUlAdded = false;
        for (const mutation of mutations) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement) {
              if (node.tagName === "UL" && node.classList.contains("grid") && node.classList.contains("gap-16") || node.querySelector("ul.grid.gap-16")) {
                newUlAdded = true;
                break;
              }
            }
          }
          if (newUlAdded) break;
        }
        if (newUlAdded) {
          Array.from(this.context.observers.entries()).filter(([key]) => key.startsWith("ul-")).forEach(([key, observer]) => {
            if (observer instanceof MutationObserver) {
              observer.disconnect();
              this.context.observers.delete(key);
            }
          });
          this.addNumbers();
        }
      });
      bodyObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.context.observers.set("body-observer", bodyObserver);
    }
    /**
     * 处理单个UL元素内的序号
     * @param ul 要处理的UL元素
     */
    processUlNumbers(ul) {
      const children = Array.from(ul.children).filter((child) => child.tagName.toLowerCase() === "li");
      children.forEach((li, index) => {
        const existingNumberSpan = li.querySelector(".variation-number");
        if (existingNumberSpan) {
          existingNumberSpan.remove();
        }
        const titleContainer = li.querySelector(".variation-box-head .flex.items-center.gap-4");
        if (!titleContainer) {
          return;
        }
        const numberSpan = document.createElement("span");
        numberSpan.className = "variation-number typography-14 inline-block font-semibold";
        numberSpan.style.cssText = "margin-right: 8px; color: #666;";
        numberSpan.textContent = `#${index + 1}`;
        titleContainer.insertBefore(numberSpan, titleContainer.firstChild);
      });
    }
    // 标签功能
    addTagButtons() {
      const observer = new MutationObserver((_, obs) => {
        const inputContainer = document.querySelector("#item_tag .item-search-input__container");
        if (inputContainer) {
          const buttonContainer = document.createElement("div");
          buttonContainer.className = "flex gap-2";
          buttonContainer.style.alignItems = "center";
          buttonContainer.style.position = "absolute";
          buttonContainer.style.right = "8px";
          buttonContainer.style.top = "50%";
          buttonContainer.style.transform = "translateY(-50%)";
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
          obs.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.context.observers.set("tag-buttons", observer);
    }
    copyTags() {
      try {
        const tags = Array.from(document.querySelectorAll("#item_tag .bg-secondary500 .font-bold")).map((tag) => {
          var _a;
          return (_a = tag.textContent) == null ? void 0 : _a.trim();
        }).filter(Boolean);
        if (tags.length === 0) {
          alert("没有找到标签");
          return;
        }
        navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
          const copyBtn = document.querySelector("#item_tag .btn:first-child");
          if (copyBtn instanceof HTMLElement) {
            Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
          }
        });
      } catch (error) {
        handleError(error);
      }
    }
    createProgressTip(container) {
      const tipContainer = document.createElement("div");
      tipContainer.style.cssText = "margin-bottom: 12px; background: #f5f7fa; border-radius: 4px; padding: 12px; position: relative;";
      const textElement = document.createElement("div");
      textElement.style.cssText = "color: #666; font-size: 14px; margin-bottom: 8px;";
      const progressBarContainer = document.createElement("div");
      progressBarContainer.style.cssText = "background: #e4e7ed; height: 6px; border-radius: 3px; overflow: hidden;";
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
    async pasteTags() {
      try {
        const text = await navigator.clipboard.readText();
        const newTags = JSON.parse(text);
        if (!Array.isArray(newTags) || newTags.length === 0) {
          throw new Error("无效的标签数据");
        }
        const input = document.querySelector(".js-item-tags-array");
        if (!input) throw new Error("找不到标签输入框");
        const container = document.querySelector("#item_tag");
        if (!container) throw new Error("找不到标签容器");
        const existingTags = Array.from(document.querySelectorAll("#item_tag .bg-secondary500 .font-bold")).map((tag) => {
          var _a;
          return (_a = tag.textContent) == null ? void 0 : _a.trim();
        }).filter(Boolean);
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
          progress.complete(`处理完成！已添加 ${tagsToAdd.length} 个新标签，跳过 ${newTags.length - tagsToAdd.length} 个已存在的标签。`);
          const pasteBtn = document.querySelector("#item_tag .btn:nth-child(2)");
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
    async clearTags() {
      try {
        if (!confirm("确定要清空所有标签吗？")) return;
        const container = document.querySelector("#item_tag");
        if (!container) throw new Error("找不到标签容器");
        const deleteButtons = Array.from(document.querySelectorAll('#item_tag .bg-secondary500 a.flex pixiv-icon[name="32/BoothClose"]'));
        if (deleteButtons.length === 0) {
          alert("没有找到需要清空的标签");
          return;
        }
        const progress = this.createProgressTip(container);
        try {
          for (let i = deleteButtons.length - 1; i >= 0; i--) {
            progress.updateProgress(deleteButtons.length - i, deleteButtons.length);
            const button = deleteButtons[i];
            const clickableAnchor = button.closest("a");
            if (clickableAnchor) {
              clickableAnchor.click();
              await Utils.sleep(1);
            }
          }
          progress.complete(`处理完成！已清空 ${deleteButtons.length} 个标签。`);
          const clearBtn = document.querySelector("#item_tag .btn:nth-child(3)");
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
    cleanup() {
      ["variation-numbers-wait", "body-observer", "tag-buttons"].forEach((observerName) => {
        const observer = this.context.observers.get(observerName);
        if (observer instanceof MutationObserver) {
          observer.disconnect();
          this.context.observers.delete(observerName);
        }
      });
      const buttons = document.querySelectorAll(".btn.calm.small");
      buttons.forEach((button) => {
        if (["复制标签", "粘贴标签", "清空标签"].includes(button.innerHTML)) {
          button.remove();
        }
      });
    }
  }
  class ItemActions {
    /**
     * 为商品添加操作按钮
     * @param item 商品元素
     */
    addToItem(item) {
      try {
        if (item.querySelector(".tag-copy-btn") || item.querySelector(".item-delete-btn")) return;
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
      const deleteBtn = document.createElement("a");
      deleteBtn.className = "btn danger small item-delete-btn";
      deleteBtn.style.cssText = "position: absolute; top: 20px; right: 20px; z-index: 10;";
      deleteBtn.innerHTML = "删除";
      deleteBtn.onclick = async (e) => {
        e.preventDefault();
        await this.handleDeleteItem(item, itemId);
      };
      if (getComputedStyle(item).position === "static") {
        item.style.position = "relative";
      }
      item.appendChild(deleteBtn);
    }
    /**
     * 添加复制标签按钮
     */
    addCopyTagsButton(item) {
      const tagList = item.querySelector(".dashboard-items-tags");
      const footerActions = item.querySelector(".dashboard-item-footer-actions");
      if (tagList && footerActions) {
        const copyBtn = document.createElement("a");
        copyBtn.className = "btn calm small tag-copy-btn mr-8";
        copyBtn.innerHTML = "复制标签";
        copyBtn.onclick = (e) => {
          e.preventDefault();
          this.copyItemTags(tagList);
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
    /**
     * 复制商品标签
     */
    copyItemTags(tagList) {
      try {
        const tags = Array.from(tagList.querySelectorAll(".tag-text")).map((tag) => tag.textContent).filter(Boolean);
        if (tags.length === 0) {
          alert("没有找到标签");
          return;
        }
        navigator.clipboard.writeText(JSON.stringify(tags)).then(() => {
          var _a;
          const copyBtn = (_a = tagList.closest(".item-wrapper")) == null ? void 0 : _a.querySelector(".tag-copy-btn");
          if (copyBtn instanceof HTMLElement) {
            Utils.updateButtonState(copyBtn, true, copyBtn.innerHTML);
          }
        });
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 清理操作按钮
     */
    cleanup() {
      document.querySelectorAll(".tag-copy-btn, .item-delete-btn").forEach((el) => el.remove());
    }
  }
  class ItemNavigation {
    constructor() {
      __publicField(this, "navigationContainer", null);
      __publicField(this, "items", []);
      __publicField(this, "isExpanded", false);
      __publicField(this, "searchInput", null);
      __publicField(this, "filteredItems", []);
      __publicField(this, "isScrolling", false);
      __publicField(this, "scrollTimeout", null);
    }
    /**
     * 创建商品导航栏
     */
    createNavigation() {
      try {
        if (document.querySelector(".item-navigation")) return;
        this.collectItems();
        if (this.items.length === 0) return;
        this.createNavigationContainer();
        this.createNavigationItems();
        this.setupScrollListener();
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 收集所有商品元素
     */
    collectItems() {
      this.items = Array.from(document.querySelectorAll(".item-wrapper"));
    }
    /**
     * 创建导航栏容器
     */
    createNavigationContainer() {
      this.navigationContainer = document.createElement("div");
      this.navigationContainer.className = "item-navigation";
      this.navigationContainer.style.cssText = `
            position: fixed;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            width: 400px;
            height: 80vh;
            max-height: 80vh;
            z-index: 1000;
            transition: transform 0.3s ease;
            transform: translateY(-50%) translateX(400px);
        `;
      this.createHoverArea();
      this.createContentContainer();
      document.body.appendChild(this.navigationContainer);
    }
    /**
     * 创建左侧按钮区域
     */
    createHoverArea() {
      const buttonArea = document.createElement("div");
      buttonArea.className = "navigation-button-area";
      buttonArea.style.cssText = `
            position: absolute;
            left: -30px;
            top: 0;
            width: 30px;
            height: 100%;
            background: transparent;
            cursor: pointer;
            z-index: 1001;
        `;
      const toggleButton = document.createElement("div");
      toggleButton.innerHTML = "◀";
      toggleButton.style.cssText = `
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 10px;
            color: #666;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e0e0e0;
            border-right: none;
            border-radius: 8px 0 0 8px;
            width: 16px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.2s ease;
        `;
      toggleButton.onmouseenter = () => {
        toggleButton.style.backgroundColor = "#f8f9fa";
        toggleButton.style.boxShadow = "-2px 0 6px rgba(0, 0, 0, 0.15)";
      };
      toggleButton.onmouseleave = () => {
        toggleButton.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
        toggleButton.style.boxShadow = "-2px 0 4px rgba(0, 0, 0, 0.1)";
      };
      buttonArea.appendChild(toggleButton);
      buttonArea.onclick = () => this.toggleNavigation();
      this.navigationContainer.appendChild(buttonArea);
    }
    /**
     * 创建内容容器
     */
    createContentContainer() {
      const contentContainer = document.createElement("div");
      contentContainer.className = "navigation-content";
      contentContainer.style.cssText = `
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid #e0e0e0;
            border-radius: 12px 0 0 12px;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;
      const header = document.createElement("div");
      header.className = "navigation-header";
      header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            flex-shrink: 0;
        `;
      const title = document.createElement("div");
      title.textContent = `商品导航 (${this.items.length})`;
      title.style.cssText = `
            font-weight: 600;
            color: #333;
            font-size: 14px;
        `;
      header.appendChild(title);
      const searchContainer = document.createElement("div");
      searchContainer.className = "navigation-search";
      searchContainer.style.cssText = `
            padding: 12px 16px;
            border-bottom: 1px solid #e0e0e0;
            background: #fff;
            flex-shrink: 0;
        `;
      this.searchInput = document.createElement("input");
      this.searchInput.type = "text";
      this.searchInput.placeholder = "搜索商品...";
      this.searchInput.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 12px;
            outline: none;
            transition: border-color 0.2s;
        `;
      this.searchInput.onfocus = () => this.searchInput.style.borderColor = "#2196f3";
      this.searchInput.onblur = () => this.searchInput.style.borderColor = "#ddd";
      this.searchInput.oninput = () => this.filterItems();
      searchContainer.appendChild(this.searchInput);
      const itemsContainer = document.createElement("div");
      itemsContainer.className = "navigation-items-container";
      itemsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 4px;
            min-height: 0;
            scrollbar-width: thin;
            scrollbar-color: #ccc #f5f5f5;
        `;
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
     * 切换导航栏状态
     */
    toggleNavigation() {
      if (!this.navigationContainer) return;
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.expandNavigation();
      } else {
        this.collapseNavigation();
      }
      this.updateButtonIcon();
    }
    /**
     * 展开导航栏
     */
    expandNavigation() {
      if (!this.navigationContainer) return;
      this.navigationContainer.style.transform = "translateY(-50%) translateX(0)";
    }
    /**
     * 收缩导航栏
     */
    collapseNavigation() {
      if (!this.navigationContainer) return;
      const currentWidth = this.navigationContainer.offsetWidth;
      this.navigationContainer.style.transform = `translateY(-50%) translateX(${currentWidth}px)`;
    }
    /**
     * 更新按钮图标
     */
    updateButtonIcon() {
      if (!this.navigationContainer) return;
      const toggleButton = this.navigationContainer.querySelector(".navigation-button-area div");
      if (toggleButton) {
        toggleButton.innerHTML = this.isExpanded ? "▶" : "◀";
      }
    }
    /**
     * 动态调整导航栏宽度
     */
    adjustNavigationWidth(items) {
      if (!this.navigationContainer || items.length === 0) return;
      const itemsContainer = this.navigationContainer.querySelector(".navigation-items-container");
      if (!itemsContainer) return;
      const originalTransform = this.navigationContainer.style.transform;
      this.navigationContainer.style.transform = "translateY(-50%) translateX(0)";
      this.navigationContainer.style.width = "auto";
      const tempItems = [];
      items.forEach((item, index) => {
        const itemId = item.getAttribute("data-id");
        const itemName = this.getItemName(item);
        const variationCount = item.querySelectorAll(".dashboard-items-variation .row").length;
        const salesCount = this.getTotalSales(item);
        const navItem = document.createElement("div");
        navItem.className = "navigation-item";
        navItem.setAttribute("data-item-id", itemId || "");
        navItem.style.cssText = `
                padding: 6px 8px;
                margin-bottom: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
                width: max-content;
            `;
        const itemInfo = document.createElement("div");
        itemInfo.style.cssText = "display: flex; flex-direction: column; gap: 2px;";
        const nameRow = document.createElement("div");
        nameRow.style.cssText = "display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;";
        const nameSpan = document.createElement("span");
        nameSpan.textContent = itemName;
        nameSpan.style.cssText = "flex: 1; margin-right: 6px; font-weight: 500; font-size: 11px; line-height: 1.3; word-wrap: break-word;";
        const countSpan = document.createElement("span");
        countSpan.textContent = `${variationCount}变体`;
        countSpan.style.cssText = "color: #666; font-size: 9px; flex-shrink: 0; background: #f0f0f0; padding: 1px 4px; border-radius: 8px;";
        nameRow.appendChild(nameSpan);
        nameRow.appendChild(countSpan);
        const salesRow = document.createElement("div");
        salesRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #666;";
        const salesSpan = document.createElement("span");
        salesSpan.textContent = `销量: ${salesCount}`;
        salesSpan.style.cssText = salesCount > 0 ? "color: #28a745; font-weight: 500;" : "color: #999; font-weight: 500;";
        const indexSpan = document.createElement("span");
        indexSpan.textContent = `#${index + 1}`;
        indexSpan.style.cssText = "color: #999; font-size: 9px;";
        salesRow.appendChild(salesSpan);
        salesRow.appendChild(indexSpan);
        itemInfo.appendChild(salesRow);
        itemInfo.appendChild(nameRow);
        navItem.appendChild(itemInfo);
        itemsContainer.appendChild(navItem);
        tempItems.push(navItem);
      });
      let maxWidth = 0;
      tempItems.forEach((navItem) => {
        const width = navItem.offsetWidth;
        maxWidth = Math.max(maxWidth, width);
      });
      tempItems.forEach((navItem) => navItem.remove());
      this.navigationContainer.style.transform = originalTransform;
      const searchWidth = 32;
      const padding = 16;
      const finalWidth = Math.min(Math.max(maxWidth + searchWidth + padding, 300), 500);
      this.navigationContainer.style.width = `${finalWidth}px`;
      this.navigationContainer.style.transform = this.isExpanded ? "translateY(-50%) translateX(0)" : `translateY(-50%) translateX(${finalWidth}px)`;
    }
    /**
     * 创建导航项
     */
    createNavigationItems() {
      var _a;
      if (!this.navigationContainer) return;
      const itemsContainer = this.navigationContainer.querySelector(".navigation-items-container");
      if (!itemsContainer) return;
      itemsContainer.innerHTML = "";
      const itemsToShow = this.filteredItems.length > 0 ? this.filteredItems : this.items;
      this.adjustNavigationWidth(itemsToShow);
      if (itemsToShow.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.textContent = ((_a = this.searchInput) == null ? void 0 : _a.value) ? "未找到匹配的商品" : "暂无商品";
        emptyState.style.cssText = `
                text-align: center;
                color: #666;
                padding: 20px;
                font-style: italic;
            `;
        itemsContainer.appendChild(emptyState);
        return;
      }
      itemsToShow.forEach((item, index) => {
        const itemId = item.getAttribute("data-id");
        const itemName = this.getItemName(item);
        const variationCount = item.querySelectorAll(".dashboard-items-variation .row").length;
        const salesCount = this.getTotalSales(item);
        const navItem = document.createElement("div");
        navItem.className = "navigation-item";
        navItem.setAttribute("data-item-id", itemId || "");
        navItem.style.cssText = `
                padding: 6px 8px;
                margin-bottom: 1px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 2px solid transparent;
                background: #fff;
                border: 1px solid transparent;
            `;
        const itemInfo = document.createElement("div");
        itemInfo.style.cssText = "display: flex; flex-direction: column; gap: 2px;";
        const nameRow = document.createElement("div");
        nameRow.style.cssText = "display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;";
        const nameSpan = document.createElement("span");
        nameSpan.textContent = itemName;
        nameSpan.style.cssText = "flex: 1; margin-right: 6px; font-weight: 500; font-size: 11px; line-height: 1.3; word-wrap: break-word;";
        const countSpan = document.createElement("span");
        countSpan.textContent = `${variationCount}变体`;
        countSpan.style.cssText = "color: #666; font-size: 9px; flex-shrink: 0; background: #f0f0f0; padding: 1px 4px; border-radius: 8px;";
        nameRow.appendChild(nameSpan);
        nameRow.appendChild(countSpan);
        const salesRow = document.createElement("div");
        salesRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #666;";
        const salesSpan = document.createElement("span");
        salesSpan.textContent = `销量: ${salesCount}`;
        salesSpan.style.cssText = salesCount > 0 ? "color: #28a745; font-weight: 500;" : "color: #999; font-weight: 500;";
        const indexSpan = document.createElement("span");
        indexSpan.textContent = `#${index + 1}`;
        indexSpan.style.cssText = "color: #999; font-size: 9px;";
        salesRow.appendChild(salesSpan);
        salesRow.appendChild(indexSpan);
        itemInfo.appendChild(salesRow);
        itemInfo.appendChild(nameRow);
        navItem.appendChild(itemInfo);
        navItem.onclick = () => this.scrollToItem(item, navItem);
        navItem.onmouseenter = () => {
          if (!navItem.classList.contains("active")) {
            navItem.style.backgroundColor = "#f8f9fa";
            navItem.style.borderColor = "#e9ecef";
          }
        };
        navItem.onmouseleave = () => {
          if (!navItem.classList.contains("active")) {
            navItem.style.backgroundColor = "#fff";
            navItem.style.borderColor = "transparent";
          }
        };
        itemsContainer.appendChild(navItem);
      });
    }
    /**
     * 获取商品名称
     */
    getItemName(item) {
      var _a;
      const nameElement = item.querySelector(".nav");
      if (nameElement) {
        return ((_a = nameElement.textContent) == null ? void 0 : _a.trim()) || `商品 #${item.getAttribute("data-id")}`;
      }
      return `商品 #${item.getAttribute("data-id")}`;
    }
    /**
     * 获取商品总销量
     */
    getTotalSales(item) {
      let totalSales = 0;
      item.querySelectorAll(".dashboard-items-variation .row").forEach((variation) => {
        var _a;
        const salesCount = (_a = variation.querySelector(".sales_quantity .count")) == null ? void 0 : _a.textContent;
        if (salesCount) {
          totalSales += parseInt(salesCount, 10) || 0;
        }
      });
      return totalSales;
    }
    /**
     * 过滤商品
     */
    filterItems() {
      if (!this.searchInput) return;
      const searchTerm = this.searchInput.value.toLowerCase().trim();
      if (searchTerm === "") {
        this.filteredItems = [];
      } else {
        this.filteredItems = this.items.filter((item) => {
          const itemName = this.getItemName(item).toLowerCase();
          const itemId = item.getAttribute("data-id") || "";
          return itemName.includes(searchTerm) || itemId.includes(searchTerm);
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
        if (!this.isExpanded) {
          this.expandNavigation();
          this.isExpanded = true;
          this.updateButtonIcon();
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
        el.style.backgroundColor = "#fff";
        el.style.borderLeftColor = "transparent";
        el.style.borderColor = "transparent";
      });
      activeNavItem.classList.add("active");
      activeNavItem.style.backgroundColor = "#e3f2fd";
      activeNavItem.style.borderLeftColor = "#2196f3";
      activeNavItem.style.borderColor = "#bbdefb";
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
      this.setupKeyboardShortcuts();
      this.scrollListener = onScroll;
    }
    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
      const onKeyDown = (e) => {
        var _a, _b;
        if (!this.navigationContainer || this.navigationContainer.style.display === "none") return;
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          (_a = this.searchInput) == null ? void 0 : _a.focus();
          return;
        }
        if (e.key === "Escape") {
          this.collapseNavigation();
          return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateWithKeyboard(e.key === "ArrowUp" ? -1 : 1);
        }
        if (e.key === "Enter") {
          const activeNavItem = (_b = this.navigationContainer) == null ? void 0 : _b.querySelector(".navigation-item.active");
          if (activeNavItem) {
            const itemId = activeNavItem.getAttribute("data-item-id");
            const item = this.items.find((item2) => item2.getAttribute("data-id") === itemId);
            if (item) {
              this.scrollToItem(item, activeNavItem);
            }
          }
        }
      };
      document.addEventListener("keydown", onKeyDown);
      this.keyboardListener = onKeyDown;
    }
    /**
     * 键盘导航
     */
    navigateWithKeyboard(direction) {
      var _a;
      const navItems = Array.from(((_a = this.navigationContainer) == null ? void 0 : _a.querySelectorAll(".navigation-item")) || []);
      const currentIndex = navItems.findIndex((item) => item.classList.contains("active"));
      let newIndex = currentIndex + direction;
      if (newIndex < 0) newIndex = navItems.length - 1;
      if (newIndex >= navItems.length) newIndex = 0;
      const newActiveItem = navItems[newIndex];
      if (newActiveItem) {
        this.setActiveItem(newActiveItem);
        newActiveItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    /**
     * 隐藏导航栏
     */
    hideNavigation() {
      if (this.navigationContainer) {
        this.navigationContainer.style.display = "none";
      }
    }
    /**
     * 显示导航栏
     */
    showNavigation() {
      if (this.navigationContainer) {
        this.navigationContainer.style.display = "block";
      }
    }
    /**
     * 更新导航栏（当商品列表变化时）
     */
    updateNavigation() {
      this.cleanup();
      this.createNavigation();
    }
    /**
     * 清理导航栏
     */
    cleanup() {
      if (this.navigationContainer) {
        this.navigationContainer.remove();
        this.navigationContainer = null;
      }
      const scrollListener = this.scrollListener;
      if (scrollListener) {
        window.removeEventListener("scroll", scrollListener);
        delete this.scrollListener;
      }
      const keyboardListener = this.keyboardListener;
      if (keyboardListener) {
        document.removeEventListener("keydown", keyboardListener);
        delete this.keyboardListener;
      }
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
      this.items = [];
      this.filteredItems = [];
      this.searchInput = null;
      this.isExpanded = false;
      this.isScrolling = false;
    }
  }
  class ItemObserver {
    constructor(context) {
      __publicField(this, "context");
      __publicField(this, "itemObserver");
      __publicField(this, "pageObserver", null);
      this.context = context;
      this.itemObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const item = entry.target;
              this.onItemIntersect(item);
              this.itemObserver.unobserve(item);
            }
          });
        },
        { threshold: 0.1 }
        // 当元素10%可见时触发
      );
    }
    /**
     * 设置页面观察器
     * @param onItemProcess 处理商品元素的回调函数
     */
    setupPageObserver(onItemProcess) {
      this.pageObserver = new MutationObserver(Utils.throttle((_mutations, _observer) => {
        _mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const items = node.matches(".item-wrapper") ? [node] : Array.from(node.querySelectorAll(".item-wrapper"));
              items.forEach((item) => {
                if (!item.hasAttribute("data-processed")) {
                  this.itemObserver.observe(item);
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
      this.context.observers.set("page", this.pageObserver);
      document.querySelectorAll(".item-wrapper").forEach((item) => {
        if (!item.hasAttribute("data-processed")) {
          this.itemObserver.observe(item);
        }
      });
      this.onItemProcess = onItemProcess;
    }
    /**
     * 商品元素进入视口时的处理
     */
    onItemIntersect(item) {
      const onItemProcess = this.onItemProcess;
      if (onItemProcess) {
        onItemProcess(item);
      }
    }
    /**
     * 清理观察器
     */
    cleanup() {
      if (this.pageObserver) {
        this.pageObserver.disconnect();
        this.context.observers.delete("page");
        this.pageObserver = null;
      }
      if (this.itemObserver) {
        this.itemObserver.disconnect();
      }
      document.querySelectorAll(".item-wrapper").forEach((item) => {
        const variationObserver = item.variationObserver;
        if (variationObserver instanceof MutationObserver) {
          variationObserver.disconnect();
          delete item.variationObserver;
        }
      });
    }
  }
  class ItemStats {
    /**
     * 为商品添加统计功能
     * @param item 商品元素
     */
    addToItem(item) {
      try {
        const variations = item.querySelectorAll(".dashboard-items-variation .row");
        if (!variations.length) return;
        this.addVariationCheckboxes(item, variations);
        this.createStatsElement(item);
        this.updateStats(item);
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 为变体添加复选框
     */
    addVariationCheckboxes(item, variations) {
      variations.forEach((variation) => {
        const labelArea = variation.querySelector(".dashboard-items-variation-label");
        if (!labelArea || labelArea.querySelector(".variation-checkbox")) return;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "variation-checkbox";
        checkbox.checked = true;
        checkbox.style.cssText = `
                margin: 0 4px;
                cursor: pointer;
                display: none;
            `;
        checkbox.onchange = () => this.updateStats(item);
        labelArea.insertBefore(checkbox, labelArea.firstChild);
      });
    }
    /**
     * 创建统计信息元素
     */
    createStatsElement(item) {
      const itemLabel = item.querySelector(".cell.item-label");
      if (!itemLabel) return;
      let statsElement = item.querySelector(".total-stats");
      if (statsElement) return;
      statsElement = document.createElement("div");
      statsElement.className = "total-stats";
      statsElement.style.cssText = `
            position: absolute;
            bottom: 8px;
            right: 8px;
            padding: 2px 6px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
      this.createToggleContainer(statsElement);
      this.createStatsInfo(statsElement);
      this.setupToggleEvents(item, statsElement);
      itemLabel.style.position = "relative";
      itemLabel.appendChild(statsElement);
    }
    /**
     * 创建开关容器
     */
    createToggleContainer(statsElement) {
      const toggleContainer = document.createElement("div");
      toggleContainer.className = "stats-toggle-container";
      toggleContainer.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 4px;
        `;
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "stats-toggle";
      toggle.style.cssText = `
            margin: 0;
            cursor: pointer;
            vertical-align: middle;
        `;
      const label = document.createElement("label");
      label.textContent = "过滤模式";
      label.style.cssText = `
            cursor: pointer;
            font-size: 12px;
            color: #666;
            user-select: none;
            vertical-align: middle;
        `;
      toggleContainer.appendChild(toggle);
      toggleContainer.appendChild(label);
      statsElement.appendChild(toggleContainer);
    }
    /**
     * 创建统计信息容器
     */
    createStatsInfo(statsElement) {
      const statsInfo = document.createElement("div");
      statsInfo.className = "stats-info";
      statsElement.appendChild(statsInfo);
    }
    /**
     * 设置开关事件
     */
    setupToggleEvents(item, statsElement) {
      const toggle = statsElement.querySelector(".stats-toggle");
      if (!toggle) return;
      toggle.onchange = () => {
        const checkboxes = item.querySelectorAll(".variation-checkbox");
        checkboxes.forEach((checkbox) => {
          checkbox.style.display = toggle.checked ? "inline-block" : "none";
          if (!toggle.checked) {
            checkbox.checked = true;
          }
        });
        this.updateStats(item);
      };
    }
    /**
     * 更新统计信息
     */
    updateStats(item) {
      let totalSales = 0;
      let totalRevenue = 0;
      item.querySelectorAll(".dashboard-items-variation .row").forEach((variation) => {
        var _a, _b;
        const checkbox = variation.querySelector(".variation-checkbox");
        if (!checkbox || !checkbox.checked) return;
        const salesCount = (_a = variation.querySelector(".sales_quantity .count")) == null ? void 0 : _a.textContent;
        if (salesCount) {
          totalSales += parseInt(salesCount, 10) || 0;
        }
        const revenue = (_b = variation.querySelector(".sales_subtotal")) == null ? void 0 : _b.textContent;
        if (revenue) {
          const revenueNum = parseInt(revenue.replace(/[^\d]/g, ""), 10) || 0;
          totalRevenue += revenueNum;
        }
      });
      const statsInfo = item.querySelector(".total-stats .stats-info");
      if (statsInfo) {
        statsInfo.innerHTML = `
                总销量: <strong>${totalSales}</strong> | 
                总收益: <strong>${totalRevenue.toLocaleString()}</strong> JPY
            `;
      }
    }
    /**
     * 清理统计功能
     */
    cleanup() {
      document.querySelectorAll(".variation-checkbox, .total-stats, .stats-toggle-container").forEach((el) => el.remove());
    }
  }
  class VariationNumbers {
    /**
     * 为商品添加变体序号
     * @param item 商品元素
     */
    addToItem(item) {
      try {
        const variationList = item.querySelector(".dashboard-items-variation");
        if (!variationList) return;
        this.addNumbersToVariations(variationList);
        this.setupVariationObserver(item, variationList);
      } catch (error) {
        handleError(error);
      }
    }
    /**
     * 为变体添加序号
     */
    addNumbersToVariations(variationList) {
      const variations = variationList.querySelectorAll(".row");
      variations.forEach((variation, index) => {
        const labelArea = variation.querySelector(".dashboard-items-variation-label");
        if (!labelArea) return;
        let numberSpan = variation.querySelector(".variation-number");
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
     * 设置变体列表观察器
     */
    setupVariationObserver(item, variationList) {
      const variations = variationList.querySelectorAll(".row");
      const observer = new MutationObserver(Utils.throttle((_mutations, _observer) => {
        const needsUpdate = Array.from(variations).some((variation, index) => {
          const numberSpan = variation.querySelector(".variation-number");
          return !numberSpan || numberSpan.textContent !== `#${index + 1}`;
        });
        if (needsUpdate) {
          requestAnimationFrame(() => this.addNumbersToVariations(variationList));
        }
      }, Config.throttleDelay));
      observer.observe(variationList, {
        childList: true,
        subtree: false
      });
      item.variationObserver = observer;
    }
    /**
     * 清理变体序号功能
     */
    cleanup() {
      document.querySelectorAll(".variation-number").forEach((el) => el.remove());
    }
  }
  class ItemManageFeature extends Feature {
    constructor(context) {
      super(context);
      __publicField(this, "variationNumbers");
      __publicField(this, "itemActions");
      __publicField(this, "itemStats");
      __publicField(this, "itemNavigation");
      __publicField(this, "itemObserver");
      this.variationNumbers = new VariationNumbers();
      this.itemActions = new ItemActions();
      this.itemStats = new ItemStats();
      this.itemNavigation = new ItemNavigation();
      this.itemObserver = new ItemObserver(context);
    }
    shouldExecute() {
      return this.path === "/items" || this.path === "/items/";
    }
    async execute() {
      await super.execute();
      this.itemObserver.setupPageObserver((item) => this.processItem(item));
      setTimeout(() => {
        this.itemNavigation.createNavigation();
      }, 1e3);
    }
    // 处理单个商品卡片
    processItem(item) {
      try {
        this.variationNumbers.addToItem(item);
        this.itemActions.addToItem(item);
        this.itemStats.addToItem(item);
        item.setAttribute("data-processed", "true");
      } catch (error) {
        handleError(error);
      }
    }
    cleanup() {
      this.variationNumbers.cleanup();
      this.itemActions.cleanup();
      this.itemStats.cleanup();
      this.itemNavigation.cleanup();
      this.itemObserver.cleanup();
    }
  }
  var _GM_notification = /* @__PURE__ */ (() => typeof GM_notification != "undefined" ? GM_notification : void 0)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_setClipboard = /* @__PURE__ */ (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  class SessionFeature extends Feature {
    shouldExecute() {
      return true;
    }
    async execute() {
      await super.execute();
      _GM_registerMenuCommand("获取Booth Session", () => this.getSession());
    }
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
    getSession() {
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
            const cookieData = {
              _plaza_session_nktz7u: cookieInfo.value,
              updated_at: (/* @__PURE__ */ new Date()).toISOString(),
              expires_at: cookieInfo.expires
            };
            _GM_setClipboard(JSON.stringify(cookieData, null, 2), "Booth Session");
            _GM_notification({
              text: cookieInfo.expires ? `Session已复制
过期时间: ${new Date(cookieInfo.expires).toLocaleString()}` : "Session已复制到剪贴板",
              title: "获取成功",
              timeout: 3e3
            });
          } else {
            _GM_notification({
              text: "未找到有效的 Session",
              title: "获取失败",
              timeout: 3e3
            });
          }
        },
        onerror: () => {
          _GM_notification({
            text: "请求出错，请检查网络连接",
            title: "错误",
            timeout: 3e3
          });
        }
      });
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
        await Utils.waitForDOMReady();
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
    destroy() {
      try {
        this.features.forEach((feature) => feature.cleanup());
        this.context.observers.clear();
        this.context.cachedElements.clear();
      } catch (error) {
        handleError(error);
      }
    }
  }
  new BoothEnhancer().init();

})();