import { GM_xmlhttpRequest } from '$';
import { PageCommand } from './base';
import { Utils } from '../utils/utils';
import { handleError } from '../utils/error';
import type { CommandContext, TranslationConfig, TranslationRule } from '../types';

export class TranslatorCommand extends PageCommand {
    private config: TranslationConfig = {
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
    };

    private settings = {
        checkInterval: 600,
        throttleDelay: 100,
        maxLanguageSelectorAttempts: 10,
        languageSelectorInterval: 500,
        batchSize: 10
    };

    private visibilityObserver: IntersectionObserver;
    private processing = false;

    constructor(context: CommandContext) {
        super(context);
        // 创建 IntersectionObserver 用于监控元素可见性
        this.visibilityObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const target = entry.target as HTMLElement;
                    if (entry.isIntersecting && !target.dataset.translated) {
                        // 元素可见且未翻译时进行翻译
                        this.translateNode(target);
                        // 标记已翻译
                        target.dataset.translated = 'true';
                        // 停止观察已翻译的元素
                        this.visibilityObserver.unobserve(target);
                    }
                });
            },
            { 
                threshold: 0.1,  // 元素10%可见时触发
                rootMargin: '100px'  // 提前100px开始加载，提供更平滑的体验
            }
        );
    }

    shouldExecute(): boolean {
        return true;
    }

    async execute(): Promise<void> {
        super.execute();
        try {
            const isChineseUI = await this.detectLanguage();
            if (!isChineseUI) {
                console.log('当前不是简体中文界面，跳过翻译功能');
                return;
            }

            await this.loadConfig();
            this.startObserver();
           
        } catch (error) {
            handleError(error);
        }
    }

    private async detectLanguage(): Promise<boolean> {
        for (let i = 0; i < this.settings.maxLanguageSelectorAttempts; i++) {
            const languageSwitcher = document.querySelector('.js-locale-switcher');
            const currentLanguage = languageSwitcher?.querySelector('.bg-ui-background200');

            if (currentLanguage) {
                const text = currentLanguage.textContent?.trim() || '';
                console.log('检测到的语言:', text);
                return text.includes('简体中文');
            }

            console.log(`等待语言选择器加载... (${i + 1}/${this.settings.maxLanguageSelectorAttempts})`);
            await Utils.sleep(this.settings.languageSelectorInterval);
        }

        console.log('语言选择器加载超时');
        return false;
    }

    private async loadConfig(): Promise<void> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://raw.githubusercontent.com/Yueby/tampermonkey-scripts/refs/heads/booth-scripts/booth-translate-config.json',
                onload: (response) => {
                    try {
                        const config = JSON.parse(response.responseText);
                        this.config = {
                            translations: config.translations || {},
                            specialRules: config.specialRules || [],
                            selectors: {
                                static: config.selectors?.static || [],
                                dynamic: config.selectors?.dynamic || [],
                                exclude: config.selectors?.exclude || [],
                                attributes: {
                                    translate: config.selectors?.attributes?.translate || [],
                                    observe: config.selectors?.attributes?.observe || []
                                }
                            }
                        };
                        resolve();
                    } catch (error) {
                        console.error('解析配置文件失败:', error);
                        reject(error);
                    }
                },
                onerror: (error) => {
                    console.error('加载配置文件失败:', error);
                    reject(error);
                }
            });
        });
    }

    private startObserver(): void {
        const pageObserver = new MutationObserver(Utils.throttle(this.handleMutations.bind(this), this.settings.throttleDelay));

        pageObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [...this.config.selectors.attributes.translate, ...this.config.selectors.attributes.observe],
            characterData: true,
            attributeOldValue: true
        });

        this.context.observers.set('translate', pageObserver);
        this.observeVisibleElements();
    }

    private observeVisibleElements(): void {
        const allSelectors = [...this.config.selectors.static, ...this.config.selectors.dynamic];
        allSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    const htmlElement = element as HTMLElement;
                    if (!htmlElement.dataset.translated && this.shouldTranslate(htmlElement)) {
                        this.visibilityObserver.observe(htmlElement);
                    }
                });
            } catch (error) {
                console.error(`选择器 ${selector} 查询失败:`, error);
            }
        });
    }

    private handleMutations(mutations: MutationRecord[]): void {
        if (this.processing) return;
        this.processing = true;

        try {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node as HTMLElement;
                            if (this.shouldTranslate(element)) {
                                this.visibilityObserver.observe(element);
                            }
                            const allSelectors = [...this.config.selectors.static, ...this.config.selectors.dynamic];
                            allSelectors.forEach(selector => {
                                try {
                                    element.querySelectorAll(selector).forEach(el => {
                                        const htmlElement = el as HTMLElement;
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
                }
                else if (mutation.type === 'attributes') {
                    const target = mutation.target as HTMLElement;
                    if (!target.dataset.translated && this.shouldTranslate(target)) {
                        this.visibilityObserver.observe(target);
                    }
                }
            });
        } catch (error) {
            console.error('处理DOM变化时出错:', error);
        } finally {
            this.processing = false;
        }
    }

    private shouldTranslate(element: Node): boolean {
        // 如果元素已经被翻译，不需要重复翻译
        if (element instanceof HTMLElement && element.dataset.translated === 'true') {
            return false;
        }

        // 检查是否在排除列表中
        const isExcluded = (el: HTMLElement | null) => {
            if (!el) return false;
            return this.config.selectors.exclude.some(selector => {
                return el.matches(selector) || el.closest(selector);
            });
        };

        // 跳过空文本节点
        if (element.nodeType === Node.TEXT_NODE) {
            const parent = element.parentElement;
            if (!parent || isExcluded(parent)) {
                return false;
            }
            return element.textContent?.trim() !== '';
        }

        // 以下检查仅适用于元素节点
        if (element.nodeType === Node.ELEMENT_NODE && element instanceof HTMLElement) {
            // 跳过脚本和样式标签
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                return false;
            }
            // 如果元素在排除列表中，但有title或placeholder属性，仍然允许翻译
            if (isExcluded(element)) {
                return element.hasAttribute('title') || element.hasAttribute('placeholder');
            }
            // 即使已翻译，也允许继续模糊匹配
            if (element.dataset.translated) {
                return element.textContent?.trim() !== '';
            }
        }

        return true;
    }

    private translateNode(node: Node): void {
        if (node.nodeType === Node.TEXT_NODE && node instanceof Text) {
            this.translateTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLElement) {
            this.translateElement(node);
        }
    }

    private translateTextNode(node: Text): void {
        const text = node.textContent?.trim();
        if (!text) return;

        // 传入节点的父元素以检查特殊规则
        const translated = this.translate(text, node.parentElement as HTMLElement);
        if (translated !== text && node.textContent) {
            node.textContent = node.textContent.replace(text, translated);
        }
    }

    private translateElement(element: HTMLElement): void {
        let hasTranslation = false;

        // 翻译属性
        this.config.selectors.attributes.translate.forEach(attr => {
            if (element.hasAttribute(attr)) {
                const value = element.getAttribute(attr);
                if (value) {  // 确保属性值存在
                    const translated = this.translate(value, element);
                    if (translated !== value) {
                        element.setAttribute(attr, translated);
                        // 为每个翻译过的属性添加标记
                        element.dataset[`translated${attr}`] = 'true';
                        hasTranslation = true;
                    }
                }
            }
        });

        // 检查是否在排除列表中
        const isExcluded = this.config.selectors.exclude.some(selector => {
            return element.matches(selector) || element.closest(selector);
        });

        // 如果不在排除列表中，或者有特殊属性需要翻译
        if (!isExcluded || element.hasAttribute('title') || element.hasAttribute('placeholder')) {
            // 翻译子节点
            element.childNodes.forEach(node => {
                if (this.shouldTranslate(node)) {
                    const text = node.textContent?.trim();
                    if (text && node.textContent) {
                        const translated = this.translate(text, element);
                        if (translated !== text) {
                            if (node.nodeType === Node.TEXT_NODE && node instanceof Text) {
                                node.textContent = node.textContent.replace(text, translated);
                            } else {
                                this.translateNode(node);
                            }
                            hasTranslation = true;  // 标记已进行翻译
                        }
                    }
                }
            });
        }

        // 只有在实际进行了翻译时才标记元素
        if (hasTranslation) {
            element.dataset.translated = 'true';
        }
    }

    private translate(text: string, element: HTMLElement | null): string {
        if (!text) return text;
        let result = text;

        // 获取特殊规则
        let currentRule: TranslationRule | undefined;
        if (element) {
            currentRule = this.config.specialRules.find(rule => element.matches(rule.selector));
        }

        // 按源文本长度降序排序翻译规则,确保优先匹配较长的文本
        const sortedTranslations = Object.entries(this.config.translations)
            .sort((a, b) => b[0].length - a[0].length);

        // 遍历所有翻译规则进行替换
        for (const [source, target] of sortedTranslations) {
            if (result.includes(source)) {
                // 转义正则表达式特殊字符
                const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // 创建全局替换的正则表达式
                const regex = new RegExp(escapedSource, 'g');
                // 替换并应用特殊规则
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

    cleanup(): void {
        const observer = this.context.observers.get('translate');
        if (observer instanceof MutationObserver) {
            observer.disconnect();
            this.context.observers.delete('translate');
        }

        if (this.visibilityObserver) {
            this.visibilityObserver.disconnect();
        }

        // 移除所有翻译标记
        document.querySelectorAll('[data-translated]').forEach(el => {
            const htmlElement = el as HTMLElement;
            delete htmlElement.dataset.translated;
        });
    }
} 