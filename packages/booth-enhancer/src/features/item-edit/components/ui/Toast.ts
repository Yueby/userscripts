/**
 * Toast 通知系统
 * 用于替代 alert()，提供非阻塞的消息提示
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

class ToastManager {
  private container: HTMLElement | null = null;
  private toasts: Set<HTMLElement> = new Set();
  private targetContainer: HTMLElement | null = null;

  /**
   * 设置 Toast 显示的目标容器
   * @param container 目标容器元素，如果为 null 则使用 body
   */
  setContainer(container: HTMLElement | null) {
    this.targetContainer = container;
    // 如果已经有容器了，需要移除并重新创建
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'booth-toast-container';
      // 根据父容器设置不同的数据属性
      if (this.targetContainer) {
        this.container.setAttribute('data-position', 'relative');
      } else {
        this.container.setAttribute('data-position', 'fixed');
      }
      this.injectStyles();
      const parent = this.targetContainer || document.body;
      parent.appendChild(this.container);
    }
    return this.container;
  }

  private injectStyles() {
    if (document.getElementById('booth-toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'booth-toast-styles';
    style.textContent = `
      /* Toast 容器基础样式 */
      .booth-toast-container {
        display: flex;
        gap: 8px;
        pointer-events: none;
        z-index: 1000;
      }

      /* Toast 容器在 body 中时 - 固定在右上角 */
      .booth-toast-container[data-position="fixed"] {
        position: fixed;
        top: 20px;
        right: 20px;
        flex-direction: column;
        z-index: 10001;
      }

      /* Toast 容器在其他元素中时 - 绝对定位在底部 */
      .booth-toast-container[data-position="relative"] {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        flex-direction: column-reverse;
      }

      .booth-toast {
        min-width: 200px;
        max-width: 400px;
        padding: 14px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        font-size: 14px;
        line-height: 1.5;
        pointer-events: auto;
        opacity: 0;
        transition: all 0.3s ease;
        word-wrap: break-word;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-icon svg {
        width: 100%;
        height: 100%;
      }

      .toast-message {
        flex: 1;
        padding-top: 1px;
        color: #333;
      }

      /* Toast 在固定容器中时从右侧滑入 */
      .booth-toast-container[data-position="fixed"] .booth-toast {
        transform: translateX(20px);
      }

      .booth-toast-container[data-position="fixed"] .booth-toast.show {
        opacity: 1;
        transform: translateX(0);
      }

      /* Toast 在相对容器中时从下往上滑入 */
      .booth-toast-container[data-position="relative"] .booth-toast {
        transform: translateY(20px);
      }

      .booth-toast-container[data-position="relative"] .booth-toast.show {
        opacity: 1;
        transform: translateY(0);
      }

      .booth-toast-success {
        background: #f0fdf4;
        border: 1px solid #86efac;
      }
      
      .booth-toast-success .toast-icon {
        color: #22c55e;
      }

      .booth-toast-error {
        background: #fef2f2;
        border: 1px solid #fecaca;
      }
      
      .booth-toast-error .toast-icon {
        color: #ef4444;
      }

      .booth-toast-warning {
        background: #fffbeb;
        border: 1px solid #fde68a;
      }
      
      .booth-toast-warning .toast-icon {
        color: #f59e0b;
      }

      .booth-toast-info {
        background: #eff6ff;
        border: 1px solid #93c5fd;
      }
      
      .booth-toast-info .toast-icon {
        color: #3b82f6;
      }

      @media (max-width: 768px) {
        .booth-toast-container[data-position="fixed"] {
          top: 10px;
          left: 10px;
          right: 10px;
        }

        .booth-toast {
          min-width: 0;
          max-width: none;
          width: 100%;
          padding: 10px 14px;
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(options: ToastOptions): void {
    const {
      message,
      type = 'info',
      duration = 3000,
      onClose
    } = options;

    const container = this.ensureContainer();
    const toast = document.createElement('div');
    toast.className = `booth-toast booth-toast-${type}`;
    
    // 图标
    const iconMap = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };
    
    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type]}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    this.toasts.add(toast);

    // 触发动画
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 自动关闭
    setTimeout(() => {
      this.remove(toast, onClose);
    }, duration);
  }

  private remove(toast: HTMLElement, onClose?: () => void): void {
    toast.classList.remove('show');
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
      this.toasts.delete(toast);
      
      if (onClose) {
        onClose();
      }

      // 如果没有 toast 了，移除容器
      if (this.toasts.size === 0 && this.container) {
        this.container.remove();
        this.container = null;
      }
    }, 300);
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }
}

// 单例
export const toast = new ToastManager();
