import { Config } from './config';

export class Utils {
    private static throttleCache = new Map<string, Function>();

    // 优化的节流函数，使用Map缓存
    static throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
        const key = func.toString();
        if (!this.throttleCache.has(key)) {
            let inThrottle: boolean;
            const throttled = function (this: any, ...args: any[]) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
            this.throttleCache.set(key, throttled);
        }
        return this.throttleCache.get(key) as T;
    }

    // 等待指定时间
    static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 等待DOM加载完成
    static async waitForDOMReady() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
    }

    // 检查当前页面是否需要特定功能
    static shouldEnableFeature(feature: 'variations' | 'tags' | 'dashboard' | 'session') {
        const path = window.location.pathname;
        switch (feature) {
            case 'variations':
            case 'tags':
                // 商品编辑页面 https://manage.booth.pm/items/***/edit_pre
                return /^\/items\/\d+\/edit(_pre)?$/.test(path);
            case 'dashboard':
                // 商品管理页面 https://manage.booth.pm/items
                return path === '/items' || path === '/items/';
            case 'session':
                // 所有页面都可以获取session
                return true;
            default:
                return false;
        }
    }

    // 获取当前页面类型
    static getCurrentPageType(): 'itemEdit' | 'dashboard' | 'other' {
        const path = window.location.pathname;
        if (/^\/items\/\d+\/edit(_pre)?$/.test(path)) {
            return 'itemEdit';
        }
        if (path === '/items' || path === '/items/') {
            return 'dashboard';
        }
        return 'other';
    }

    // 优化的按钮状态更新
    static updateButtonState(button: HTMLElement, success = true, originalHtml: string) {
        if (!button) return;

        const newHtml = success ?
            '<i class="icon-check"></i><span class="cmd-label">已完成</span>' :
            originalHtml;

        button.innerHTML = newHtml;
        button.classList.toggle('calm', !success);
        button.classList.toggle('primary', success);

        if (success) {
            setTimeout(() => {
                button.innerHTML = originalHtml;
                button.classList.add('calm');
                button.classList.remove('primary');
            }, Config.animationDelay);
        }
    }
} 