// ==UserScript==
// @name               Booth Enhancer
// @name:zh-CN         Booth 网站功能增强
// @namespace          yueby.booth
// @version            0.1.0
// @author             Yueby
// @description        A userscript for enhancing Booth experience
// @description:zh-CN  增强 Booth 网站的功能体验，包括变体序号、标签管理、自动翻译等功能
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
    // 检查当前页面是否需要特定功能
    static shouldEnableFeature(feature) {
      const path = window.location.pathname;
      switch (feature) {
        case "variations":
        case "tags":
          return /^\/items\/\d+\/edit(_pre)?$/.test(path);
        case "dashboard":
          return path === "/items" || path === "/items/";
        case "session":
          return true;
        default:
          return false;
      }
    }
    // 获取当前页面类型
    static getCurrentPageType() {
      const path = window.location.pathname;
      if (/^\/items\/\d+\/edit(_pre)?$/.test(path)) {
        return "itemEdit";
      }
      if (path === "/items" || path === "/items/") {
        return "dashboard";
      }
      return "other";
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
  class PageCommand {
    constructor(context) {
      __publicField(this, "context");
      __publicField(this, "path");
      this.context = context;
      this.path = window.location.pathname;
    }
    shouldExecute() {
      return false;
    }
    execute() {
      console.log(`${this.constructor.name} 执行`);
    }
    cleanup() {
    }
  }
  var _GM_notification = /* @__PURE__ */ (() => typeof GM_notification != "undefined" ? GM_notification : void 0)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_setClipboard = /* @__PURE__ */ (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  class SessionCommand extends PageCommand {
    shouldExecute() {
      return true;
    }
    execute() {
      super.execute();
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
  class ItemEditCommand extends PageCommand {
    shouldExecute() {
      return /^\/items\/\d+\/edit(_pre)?$/.test(this.path);
    }
    execute() {
      super.execute();
      this.addVariationNumbers();
      this.setupVariationObserver();
      this.addTagButtons();
    }
    // 变体序号功能
    addVariationNumbers() {
      const variations = document.querySelectorAll(".js-variation");
      variations.forEach((variation, index) => {
        let numberSpan = variation.querySelector(".variation-number");
        const titleArea = variation.querySelector(".u-flex-1.handle");
        if (!titleArea) return;
        if (!numberSpan) {
          numberSpan = document.createElement("span");
          numberSpan.className = "variation-number";
          numberSpan.style.cssText = "margin-right: 8px; color: #666;";
          titleArea.insertBefore(numberSpan, titleArea.firstChild);
        }
        numberSpan.textContent = `#${index + 1}`;
      });
    }
    setupVariationObserver() {
      const pageObserver = new MutationObserver(Utils.throttle((_mutations, _observer) => {
        const variations2 = document.querySelector(".js-variations");
        const hasObserver = this.context.observers.has("variation");
        if (variations2 && !hasObserver) {
          this.setupVariationsObserver(variations2);
          this.addVariationNumbers();
        } else if (!variations2 && hasObserver) {
          const observer = this.context.observers.get("variation");
          if (observer instanceof MutationObserver) {
            observer.disconnect();
          }
          this.context.observers.delete("variation");
          document.querySelectorAll(".variation-number").forEach((span) => span.remove());
        }
      }, Config.throttleDelay));
      pageObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.context.observers.set("page", pageObserver);
      const variations = document.querySelector(".js-variations");
      if (variations) {
        this.setupVariationsObserver(variations);
        this.addVariationNumbers();
      }
    }
    setupVariationsObserver(variations) {
      const observer = new MutationObserver(Utils.throttle(() => {
        const needsUpdate = Array.from(variations.children).some((variation, index) => {
          const numberSpan = variation.querySelector(".variation-number");
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
      this.context.observers.set("variation", observer);
    }
    // 标签功能
    addTagButtons() {
      var _a;
      const tagLabel = document.querySelector("#item_tag .u-tpg-label");
      if (!tagLabel) return;
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "u-d-inline-block u-ml-300";
      buttonContainer.style.display = "inline-flex";
      buttonContainer.style.gap = "8px";
      buttonContainer.style.verticalAlign = "middle";
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
      (_a = tagLabel.parentNode) == null ? void 0 : _a.insertBefore(buttonContainer, tagLabel.nextSibling);
    }
    copyTags() {
      try {
        const tags = Array.from(document.querySelectorAll(".selectize-input .item")).map((item) => item.getAttribute("data-value")).filter(Boolean);
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
    async pasteTags() {
      try {
        const text = await navigator.clipboard.readText();
        const tags = JSON.parse(text);
        if (!Array.isArray(tags)) {
          throw new Error("无效的标签数据");
        }
        const select = document.querySelector(".js-item-tags-array");
        if (!select || !select.selectize) {
          throw new Error("找不到标签输入框");
        }
        select.selectize.clear();
        tags.forEach((tag) => {
          select.selectize.addOption({ value: tag, text: tag });
          select.selectize.addItem(tag);
        });
        const pasteBtn = document.querySelector("#item_tag .btn:nth-child(2)");
        if (pasteBtn instanceof HTMLElement) {
          Utils.updateButtonState(pasteBtn, true, pasteBtn.innerHTML);
        }
      } catch (error) {
        handleError(error, () => {
          alert("粘贴标签失败：" + (error instanceof Error ? error.message : String(error)));
        });
      }
    }
    clearTags() {
      try {
        if (!confirm("确定要清空所有标签吗？")) return;
        const select = document.querySelector(".js-item-tags-array");
        if (!select || !select.selectize) {
          throw new Error("找不到标签输入框");
        }
        select.selectize.clear();
        const clearBtn = document.querySelector("#item_tag .btn:nth-child(3)");
        if (clearBtn instanceof HTMLElement) {
          Utils.updateButtonState(clearBtn, true, clearBtn.innerHTML);
        }
      } catch (error) {
        handleError(error);
      }
    }
    cleanup() {
      ["variation", "page"].forEach((observerName) => {
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
  class ItemManageCommand extends PageCommand {
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
    execute() {
      super.execute();
      this.setupItemsObserver();
    }
    // 处理单个商品卡片
    processItem(item) {
      try {
        this.addButtonToItem(item);
        this.addVariationNumbersToItem(item);
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
        let numberSpan = variation.querySelector(".variation-number");
        const labelArea = variation.querySelector(".dashboard-items-variation-label");
        if (!labelArea) return;
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
      document.querySelectorAll(".tag-copy-btn, .variation-number").forEach((el) => el.remove());
    }
  }
  class TranslatorCommand extends PageCommand {
    constructor(context) {
      super(context);
      __publicField(this, "config", {
        translations: {},
        specialRules: [],
        selectors: {
          static: [],
          dynamic: [],
          exclude: [],
          attributes: {
            translate: [],
            observe: []
          }
        }
      });
      __publicField(this, "settings", {
        checkInterval: 600,
        throttleDelay: 100,
        maxLanguageSelectorAttempts: 10,
        languageSelectorInterval: 500,
        batchSize: 10
      });
      __publicField(this, "visibilityObserver");
      __publicField(this, "processing", false);
      this.visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target;
            if (entry.isIntersecting && !target.dataset.translated) {
              this.translateNode(target);
              target.dataset.translated = "true";
              this.visibilityObserver.unobserve(target);
            }
          });
        },
        {
          threshold: 0.1,
          // 元素10%可见时触发
          rootMargin: "100px"
          // 提前100px开始加载，提供更平滑的体验
        }
      );
    }
    shouldExecute() {
      return true;
    }
    async execute() {
      super.execute();
      try {
        const isChineseUI = await this.detectLanguage();
        if (!isChineseUI) {
          console.log("当前不是简体中文界面，跳过翻译功能");
          return;
        }
        await this.loadConfig();
        this.startObserver();
      } catch (error) {
        handleError(error);
      }
    }
    async detectLanguage() {
      var _a;
      for (let i = 0; i < this.settings.maxLanguageSelectorAttempts; i++) {
        const languageSwitcher = document.querySelector(".js-locale-switcher");
        const currentLanguage = languageSwitcher == null ? void 0 : languageSwitcher.querySelector(".bg-ui-background200");
        if (currentLanguage) {
          const text = ((_a = currentLanguage.textContent) == null ? void 0 : _a.trim()) || "";
          console.log("检测到的语言:", text);
          return text.includes("简体中文");
        }
        console.log(`等待语言选择器加载... (${i + 1}/${this.settings.maxLanguageSelectorAttempts})`);
        await Utils.sleep(this.settings.languageSelectorInterval);
      }
      console.log("语言选择器加载超时");
      return false;
    }
    async loadConfig() {
      return new Promise((resolve, reject) => {
        _GM_xmlhttpRequest({
          method: "GET",
          url: "https://raw.githubusercontent.com/Yueby/tampermonkey-scripts/refs/heads/booth-scripts/booth-translate-config.json",
          onload: (response) => {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
              const config = JSON.parse(response.responseText);
              this.config = {
                translations: config.translations || {},
                specialRules: config.specialRules || [],
                selectors: {
                  static: ((_a = config.selectors) == null ? void 0 : _a.static) || [],
                  dynamic: ((_b = config.selectors) == null ? void 0 : _b.dynamic) || [],
                  exclude: ((_c = config.selectors) == null ? void 0 : _c.exclude) || [],
                  attributes: {
                    translate: ((_e = (_d = config.selectors) == null ? void 0 : _d.attributes) == null ? void 0 : _e.translate) || [],
                    observe: ((_g = (_f = config.selectors) == null ? void 0 : _f.attributes) == null ? void 0 : _g.observe) || []
                  }
                }
              };
              resolve();
            } catch (error) {
              console.error("解析配置文件失败:", error);
              reject(error);
            }
          },
          onerror: (error) => {
            console.error("加载配置文件失败:", error);
            reject(error);
          }
        });
      });
    }
    startObserver() {
      const pageObserver = new MutationObserver(Utils.throttle(this.handleMutations.bind(this), this.settings.throttleDelay));
      pageObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [...this.config.selectors.attributes.translate, ...this.config.selectors.attributes.observe],
        characterData: true,
        attributeOldValue: true
      });
      this.context.observers.set("translate", pageObserver);
      this.observeVisibleElements();
    }
    observeVisibleElements() {
      const allSelectors = [...this.config.selectors.static, ...this.config.selectors.dynamic];
      allSelectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((element) => {
            const htmlElement = element;
            if (!htmlElement.dataset.translated && this.shouldTranslate(htmlElement)) {
              this.visibilityObserver.observe(htmlElement);
            }
          });
        } catch (error) {
          console.error(`选择器 ${selector} 查询失败:`, error);
        }
      });
    }
    handleMutations(mutations) {
      if (this.processing) return;
      this.processing = true;
      try {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                if (this.shouldTranslate(element)) {
                  this.visibilityObserver.observe(element);
                }
                const allSelectors = [...this.config.selectors.static, ...this.config.selectors.dynamic];
                allSelectors.forEach((selector) => {
                  try {
                    element.querySelectorAll(selector).forEach((el) => {
                      const htmlElement = el;
                      if (!htmlElement.dataset.translated && this.shouldTranslate(htmlElement)) {
                        this.visibilityObserver.observe(htmlElement);
                      }
                    });
                  } catch (error) {
                    console.error(`选择器 ${selector} 查询失败:`, error);
                  }
                });
              }
            });
          } else if (mutation.type === "attributes") {
            const target = mutation.target;
            if (!target.dataset.translated && this.shouldTranslate(target)) {
              this.visibilityObserver.observe(target);
            }
          }
        });
      } catch (error) {
        console.error("处理DOM变化时出错:", error);
      } finally {
        this.processing = false;
      }
    }
    shouldTranslate(element) {
      var _a, _b;
      if (element instanceof HTMLElement && element.dataset.translated === "true") {
        return false;
      }
      const isExcluded = (el) => {
        if (!el) return false;
        return this.config.selectors.exclude.some((selector) => {
          return el.matches(selector) || el.closest(selector);
        });
      };
      if (element.nodeType === Node.TEXT_NODE) {
        const parent = element.parentElement;
        if (!parent || isExcluded(parent)) {
          return false;
        }
        return ((_a = element.textContent) == null ? void 0 : _a.trim()) !== "";
      }
      if (element.nodeType === Node.ELEMENT_NODE && element instanceof HTMLElement) {
        if (element.tagName === "SCRIPT" || element.tagName === "STYLE") {
          return false;
        }
        if (isExcluded(element)) {
          return element.hasAttribute("title") || element.hasAttribute("placeholder");
        }
        if (element.dataset.translated) {
          return ((_b = element.textContent) == null ? void 0 : _b.trim()) !== "";
        }
      }
      return true;
    }
    translateNode(node) {
      if (node.nodeType === Node.TEXT_NODE && node instanceof Text) {
        this.translateTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLElement) {
        this.translateElement(node);
      }
    }
    translateTextNode(node) {
      var _a;
      const text = (_a = node.textContent) == null ? void 0 : _a.trim();
      if (!text) return;
      const translated = this.translate(text, node.parentElement);
      if (translated !== text && node.textContent) {
        node.textContent = node.textContent.replace(text, translated);
      }
    }
    translateElement(element) {
      let hasTranslation = false;
      this.config.selectors.attributes.translate.forEach((attr) => {
        if (element.hasAttribute(attr)) {
          const value = element.getAttribute(attr);
          if (value) {
            const translated = this.translate(value, element);
            if (translated !== value) {
              element.setAttribute(attr, translated);
              element.dataset[`translated${attr}`] = "true";
              hasTranslation = true;
            }
          }
        }
      });
      const isExcluded = this.config.selectors.exclude.some((selector) => {
        return element.matches(selector) || element.closest(selector);
      });
      if (!isExcluded || element.hasAttribute("title") || element.hasAttribute("placeholder")) {
        element.childNodes.forEach((node) => {
          var _a;
          if (this.shouldTranslate(node)) {
            const text = (_a = node.textContent) == null ? void 0 : _a.trim();
            if (text && node.textContent) {
              const translated = this.translate(text, element);
              if (translated !== text) {
                if (node.nodeType === Node.TEXT_NODE && node instanceof Text) {
                  node.textContent = node.textContent.replace(text, translated);
                } else {
                  this.translateNode(node);
                }
                hasTranslation = true;
              }
            }
          }
        });
      }
      if (hasTranslation) {
        element.dataset.translated = "true";
      }
    }
    translate(text, element) {
      if (!text) return text;
      let result = text;
      let currentRule;
      if (element) {
        currentRule = this.config.specialRules.find((rule) => element.matches(rule.selector));
      }
      const sortedTranslations = Object.entries(this.config.translations).sort((a, b) => b[0].length - a[0].length);
      for (const [source, target] of sortedTranslations) {
        if (result.includes(source)) {
          const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(escapedSource, "g");
          let replacement = target;
          if (currentRule) {
            if (currentRule.prepend) {
              replacement = currentRule.prepend + replacement;
            }
            if (currentRule.append) {
              replacement = replacement + currentRule.append;
            }
          }
          result = result.replace(regex, replacement);
        }
      }
      return result;
    }
    cleanup() {
      const observer = this.context.observers.get("translate");
      if (observer instanceof MutationObserver) {
        observer.disconnect();
        this.context.observers.delete("translate");
      }
      if (this.visibilityObserver) {
        this.visibilityObserver.disconnect();
      }
      document.querySelectorAll("[data-translated]").forEach((el) => {
        const htmlElement = el;
        delete htmlElement.dataset.translated;
      });
    }
  }
  class BoothEnhancer {
    constructor() {
      __publicField(this, "context", {
        observers: /* @__PURE__ */ new Map(),
        cachedElements: /* @__PURE__ */ new Map()
      });
      __publicField(this, "commands", [
        new SessionCommand(this.context),
        new ItemEditCommand(this.context),
        new ItemManageCommand(this.context),
        new TranslatorCommand(this.context)
      ]);
    }
    async init() {
      try {
        await Utils.waitForDOMReady();
        for (const command of this.commands) {
          try {
            if (command.shouldExecute()) {
              await command.execute();
            }
          } catch (error) {
            handleError(error);
          }
        }
        console.log("Booth功能增强已启动");
      } catch (error) {
        handleError(error, () => {
          console.error("Booth功能增强启动失败");
        });
      }
    }
    destroy() {
      try {
        this.commands.forEach((command) => command.cleanup());
        this.context.observers.clear();
        this.context.cachedElements.clear();
      } catch (error) {
        handleError(error);
      }
    }
  }
  new BoothEnhancer().init();

})();