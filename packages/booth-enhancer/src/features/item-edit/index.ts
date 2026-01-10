import { App, createApp } from "vue";
import { ItemEditAPI } from "../../api/item-edit";
import { FeatureContext } from "../base";
import { PageFeature } from "../PageFeature";
import { PageModule } from "../PageModule";
import AppVue from "./App.vue";
import { icons, withSize } from "./components/ui/icons";
import { ItemNumbers, TagManager } from "./modules";
import { ConfigStorage } from "./modules/ConfigStorage";
import { FileManager } from "./modules/FileManager";

/**
 * Booth网站商品编辑页面
 * 提供变体序号显示和标签管理功能
 */
export class ItemEditFeature extends PageFeature<ItemEditAPI> {
    private modules: Array<PageModule<ItemEditAPI>> = [];
    private app: App | null = null;
    private container: HTMLElement | null = null;
    private toggleBtn: HTMLElement | null = null;

    constructor(context: FeatureContext) {
        super(context);
    }

    shouldExecute(): boolean {
        const path = window.location.pathname;
        return /^\/items\/\d+\/edit(_pre)?$/.test(path);
    }

    protected createAPI(): ItemEditAPI | undefined {
        return new ItemEditAPI();
    }

    protected async initialize(): Promise<void> {
        if (this.api) {
            // 注册子模块
            this.modules.push(
                new ItemNumbers(this.api),
                new TagManager(this.api),
                new FileManager(this.api)
            );

            // 注入样式
            this.injectStyles();

            // 初始化 Vue 面板
            this.createToggleButton();
            this.createPanelContainer();
            this.mountVueApp();
        }
            }

    /**
     * 注入样式表
     */
    private injectStyles(): void {
        if (document.querySelector('#booth-enhancer-styles')) return;

        const style = document.createElement('style');
        style.id = 'booth-enhancer-styles';
        style.textContent = `
            .booth-enhancer-toggle {
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
                user-select: none;
            }

            .booth-enhancer-toggle:hover {
                background: #f8f9fa;
                box-shadow: -2px 0 6px rgba(0, 0, 0, 0.15);
            }

            #booth-enhancer-panel-root {
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

            #booth-enhancer-panel-root.panel-open {
                transform: translateY(-50%) translateX(0);
                pointer-events: auto;
            }

            @media (max-width: 768px) {
                #booth-enhancer-panel-root {
                    width: 100%;
                    max-width: 400px;
                    height: 70vh;
                    max-height: 70vh;
                }
                
                .booth-enhancer-toggle {
                    width: 40px;
                    height: 60px;
    }
            }

            @media (max-width: 480px) {
                #booth-enhancer-panel-root {
                    width: 100%;
                    height: 85vh;
                    max-height: 85vh;
                }
            }
        `;
        document.head.appendChild(style);
                }

    /**
     * 更新侧边栏状态
     */
    private updateSidebarState(isOpen: boolean, chevronRight: string, chevronLeft: string): void {
        if (this.toggleBtn) {
            this.toggleBtn.innerHTML = isOpen ? chevronRight : chevronLeft;
        }
        if (this.container) {
            this.container.classList.toggle('panel-open', isOpen);
        }
    }

    /**
     * 创建侧边栏触发按钮
     */
    private createToggleButton() {
        this.toggleBtn = document.createElement('div');
        this.toggleBtn.className = 'booth-enhancer-toggle';
        this.toggleBtn.title = '配置面板';

        // 使用 SVG 图标
        const chevronLeft = withSize(icons.chevronLeft, 20, 2.5);
        const chevronRight = withSize(icons.chevronRight, 20, 2.5);
        
        this.toggleBtn.innerHTML = chevronLeft;

        this.toggleBtn.addEventListener('click', () => {
            const storage = ConfigStorage.getInstance();
            const isOpen = !storage.data.value.ui.sidebarOpen;
            storage.data.value.ui.sidebarOpen = isOpen;
            this.updateSidebarState(isOpen, chevronRight, chevronLeft);
        });

        document.body.appendChild(this.toggleBtn);
            }

    /**
     * 创建面板容器
     */
    private createPanelContainer() {
        this.container = document.createElement('div');
        this.container.id = 'booth-enhancer-panel-root';

        // 根据初始状态设置面板
        const storage = ConfigStorage.getInstance();
        const sidebarOpen = storage.data.value.ui.sidebarOpen;
        
        if (sidebarOpen) {
            const chevronRight = withSize(icons.chevronRight, 20, 2.5);
            const chevronLeft = withSize(icons.chevronLeft, 20, 2.5);
            this.updateSidebarState(sidebarOpen, chevronRight, chevronLeft);
        }
        
        document.body.appendChild(this.container);
    }

    /**
     * 挂载 Vue 应用
     */
    private mountVueApp() {
        if (!this.container || !this.api) return;

        // 从URL提取商品ID
        const match = window.location.pathname.match(/\/items\/(\d+)\/edit/);
        const itemId = match ? match[1] : '';

        this.app = createApp(AppVue, {
            api: this.api,
            itemId
        });

        this.app.mount(this.container);
    }
}
