/**
 * DOM 操作工具类
 */

import { CONFIG } from '../config/selectors';

export class DOMUtils {
  /**
   * 等待元素稳定出现
   */
  static async waitForElement<T extends Element>(selector: string, timeout: number = CONFIG.timeout.element): Promise<T | null> {
    return new Promise((resolve) => {
      let foundElement: T | null = null;
      let stableCount = 0;

      const checkElement = (): void => {
        const element = document.querySelector<T>(selector);
        if (element) {
          if (foundElement === element) {
            stableCount++;
            if (stableCount >= CONFIG.stability.checks) {
              observer.disconnect();
              clearTimeout(timeoutId);
              resolve(element);
            }
          } else {
            foundElement = element;
            stableCount = 1;
          }
        } else {
          foundElement = null;
          stableCount = 0;
        }
      };

      const observer = new MutationObserver(checkElement);
      observer.observe(document.body, { childList: true, subtree: true });

      const timeoutId = setTimeout(() => {
        observer.disconnect();
        resolve(foundElement);
      }, timeout);

      checkElement();
    });
  }

  /**
   * 检查元素是否可点击
   */
  static isElementVisible(element: HTMLElement): boolean {
    return !!element && document.body.contains(element) && element.style.display !== 'none';
  }

  /**
   * 安全点击元素
   */
  static safeClick(element: HTMLElement | null): boolean {
    if (!element || !this.isElementVisible(element)) return false;
    element.click();
    return true;
  }

  /**
   * 获取元素的文本内容
   */
  static getTextContent(element: Element | null): string {
    return element?.textContent?.trim() || '';
  }

  /**
   * 查询元素并获取文本内容
   */
  static queryText(parent: Element, selector: string): string {
    return this.getTextContent(parent.querySelector(selector));
  }
}

