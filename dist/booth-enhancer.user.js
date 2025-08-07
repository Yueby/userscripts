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
  class ItemManageFeature extends Feature {
    constructor(context) {
      super(context);
      __publicField(this, "itemObserver");
      this.itemObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const item = entry.target;
              this.processItem(item);
              this.itemObserver.unobserve(item);
            }
          });
        },
        { threshold: 0.1 }
        // 当元素10%可见时触发
      );
    }
    shouldExecute() {
      return this.path === "/items" || this.path === "/items/";
    }
    async execute() {
      await super.execute();
      this.setupItemsObserver();
    }
    // 处理单个商品卡片
    processItem(item) {
      try {
        this.addButtonToItem(item);
        this.addVariationNumbersToItem(item);
        this.addTotalStats(item);
        item.setAttribute("data-processed", "true");
      } catch (error) {
        handleError(error);
      }
    }
    // 为单个商品添加变体序号
    addVariationNumbersToItem(item) {
      const variationList = item.querySelector(".dashboard-items-variation");
      if (!variationList) return;
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
      const observer = new MutationObserver(Utils.throttle((_mutations, _observer) => {
        const needsUpdate = Array.from(variations).some((variation, index) => {
          const numberSpan = variation.querySelector(".variation-number");
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
      item.variationObserver = observer;
    }
    setupItemsObserver() {
      const pageObserver = new MutationObserver(Utils.throttle((_mutations, _observer) => {
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
      pageObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.context.observers.set("page", pageObserver);
      document.querySelectorAll(".item-wrapper").forEach((item) => {
        if (!item.hasAttribute("data-processed")) {
          this.itemObserver.observe(item);
        }
      });
    }
    addButtonToItem(item) {
      if (item.querySelector(".tag-copy-btn") || item.querySelector(".item-delete-btn")) return;
      const itemId = item.getAttribute("data-id");
      if (!itemId) return;
      const deleteBtn = document.createElement("a");
      deleteBtn.className = "btn danger small item-delete-btn";
      deleteBtn.style.cssText = "position: absolute; top: 20px; right: 20px; z-index: 10;";
      deleteBtn.innerHTML = "删除";
      deleteBtn.onclick = async (e) => {
        var _a, _b, _c;
        e.preventDefault();
        if (!confirm("确定要删除这个商品吗？此操作不可恢复。")) return;
        const itemName = ((_b = (_a = item.querySelector(".nav")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "未知商品";
        if (!confirm(`再次确认删除商品：
${itemName}
ID: ${itemId}`)) return;
        try {
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
      };
      if (getComputedStyle(item).position === "static") {
        item.style.position = "relative";
      }
      item.appendChild(deleteBtn);
      const tagList = item.querySelector(".dashboard-items-tags");
      const footerActions = item.querySelector(".dashboard-item-footer-actions");
      if (tagList && footerActions) {
        const copyBtn = document.createElement("a");
        copyBtn.className = "btn calm small tag-copy-btn mr-8";
        copyBtn.innerHTML = "复制标签";
        copyBtn.onclick = (e) => {
          e.preventDefault();
          this.copyItemManageTags(tagList);
        };
        footerActions.insertBefore(copyBtn, footerActions.firstChild);
      }
    }
    copyItemManageTags(tagList) {
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
    // 新增方法：添加总销量和总收益统计
    addTotalStats(item) {
      const variations = item.querySelectorAll(".dashboard-items-variation .row");
      if (!variations.length) return;
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
      const itemLabel = item.querySelector(".cell.item-label");
      if (!itemLabel) return;
      let statsElement = item.querySelector(".total-stats");
      if (!statsElement) {
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
        const statsInfo = document.createElement("div");
        statsInfo.className = "stats-info";
        statsElement.appendChild(toggleContainer);
        statsElement.appendChild(statsInfo);
        if (itemLabel) {
          itemLabel.style.position = "relative";
          itemLabel.appendChild(statsElement);
        }
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
      this.updateStats(item);
    }
    // 更新统计信息
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
    cleanup() {
      const observer = this.context.observers.get("page");
      if (observer instanceof MutationObserver) {
        observer.disconnect();
        this.context.observers.delete("page");
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
      document.querySelectorAll(".tag-copy-btn, .variation-number, .variation-checkbox, .total-stats, .stats-toggle-container").forEach((el) => el.remove());
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