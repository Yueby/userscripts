/**
 * API 基类
 * 提供通用的初始化、ready 回调等功能
 */
export abstract class BaseAPI<T = any> {
    protected _isReady: boolean = false;
    protected _readyCallbacks: Array<(api: T) => void> = [];

    constructor() {
        // 检查是否应该在当前页面激活
        if (this.shouldActivate()) {
            this.initialize();
        }
    }

    /**
     * 判断是否应该在当前页面激活（子类实现）
     */
    protected abstract shouldActivate(): boolean;

    /**
     * 异步初始化
     */
    private async initialize(): Promise<void> {
        try {
            // 等待DOM加载
            await this.waitForDOMReady();

            // 执行子类的加载逻辑（子类可以在这里等待元素）
            await this.load();

            // 标记就绪
            this._isReady = true;

            // 触发所有回调
            this.triggerReadyCallbacks();
        } catch (error) {
            console.error(`${this.constructor.name} 初始化失败:`, error);
        }
    }

    /**
     * 等待页面完全加载（包括所有资源和脚本）
     */
    protected waitForDOMReady(): Promise<void> {
        // document.readyState:
        // - 'loading': 文档正在加载
        // - 'interactive': 文档已解析，DOMContentLoaded 触发
        // - 'complete': 文档和所有资源加载完成，load 事件触发
        if (document.readyState === 'complete') {
            return Promise.resolve();
        }
        
        return new Promise(resolve => 
            window.addEventListener('load', () => resolve(), { once: true })
        );
    }

    /**
     * 加载数据（子类实现）
     * 可以是同步或异步
     * 如果需要等待特定元素，在此方法中实现
     */
    protected abstract load(): void | Promise<void>;

    /**
     * 触发 ready 回调
     */
    private triggerReadyCallbacks(): void {
        this._readyCallbacks.forEach(callback => {
            try {
                callback(this as any);
            } catch (error) {
                console.error('Ready callback error:', error);
            }
        });
        this._readyCallbacks = [];
    }

    /**
     * 监听就绪事件
     * 如果已经就绪，立即调用回调
     * 否则等待就绪后调用
     */
    public onReady(callback: (api: T) => void): void {
        if (this._isReady) {
            callback(this as any);
        } else {
            this._readyCallbacks.push(callback);
        }
    }

    /**
     * 检查是否就绪
     */
    public ready(): boolean {
        return this._isReady;
    }

    /**
     * 检查是否已激活（是否在正确的页面上）
     */
    public isActivated(): boolean {
        return this.shouldActivate();
    }
}

