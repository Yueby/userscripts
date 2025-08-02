import { logger } from '../core/logger';

/**
 * Booth图标获取工具
 */
export class BoothIconHelper {
  /**
   * 从商品ID生成图标URL
   * @param itemId 商品ID
   * @param size 图标尺寸 (默认: 72x72)
   * @returns 图标URL
   */
  static getIconUrl(itemId: string, size: string = '72x72'): string {
    // Booth图标URL格式: https://booth.pximg.net/c/{size}_a2_g5/{hash}/i/{itemId}/{imageId}_base_resized.jpg
    // 由于无法直接获取hash和imageId，这里提供一个通用的占位符方案
    return `https://booth.pximg.net/c/${size}_a2_g5/placeholder/i/${itemId}/icon_base_resized.jpg`;
  }

  /**
   * 从订单商品信息中提取图标URL
   * @param items 订单商品列表
   * @returns 第一个商品的图标URL，如果没有则返回默认图标
   */
  static getIconFromOrderItems(items: any[]): string {
    if (!items || items.length === 0) {
      return this.getDefaultIcon();
    }

    const firstItem = items[0];
    if (firstItem.itemId) {
      return this.getIconUrl(firstItem.itemId);
    }

    return this.getDefaultIcon();
  }

  /**
   * 获取默认图标URL
   * @returns 默认图标URL
   */
  static getDefaultIcon(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjcyIiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMzYgMjRDMzAuNDc3MiAyNCAyNiAyOC40NzcyIDI2IDM0QzI2IDM5LjUyMjggMzAuNDc3MiA0NCAzNiA0NEM0MS41MjI4IDQ0IDQ2IDM5LjUyMjggNDYgMzRDNDYgMjguNDc3MiA0MS41MjI4IDI0IDM2IDI0Wk0zNiA0MEMzMi42ODYzIDQwIDMwIDM3LjMxMzcgMzAgMzRDMzAgMzAuNjg2MyAzMi42ODYzIDI4IDM2IDI4QzM5LjMxMzcgMjggNDIgMzAuNjg2MyA0MiAzNEM0MiAzNy4zMTM3IDM5LjMxMzcgNDAgMzYgNDBaIiBmaWxsPSIjNkI3MjgwIi8+CjxwYXRoIGQ9Ik0yNCA0OEg0OFY1MkgyNFY0OFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+';
  }

  /**
   * 尝试从Booth管理页面获取商品图标
   * @param itemId 商品ID
   * @returns Promise<string> 图标URL
   */
  static async fetchIconFromBooth(itemId: string): Promise<string> {
    try {
      // 构建Booth管理页面URL
      const boothManageUrl = 'https://manage.booth.pm/items';
      
      // 使用GM_xmlhttpRequest获取页面内容
      const response = await new Promise<string>((resolve, reject) => {
        if (typeof GM_xmlhttpRequest !== 'undefined') {
          GM_xmlhttpRequest({
            method: 'GET',
            url: boothManageUrl,
            onload: function(response) {
              if (response.status === 200) {
                resolve(response.responseText);
              } else {
                reject(new Error(`HTTP ${response.status}`));
              }
            },
            onerror: function(error) {
              reject(error);
            }
          });
        } else {
          reject(new Error('GM_xmlhttpRequest not available'));
        }
      });

      // 解析页面中的商品信息
      const iconUrl = this.parseIconFromManagePage(response, itemId);
      if (iconUrl) {
        return iconUrl;
      }

      return this.getDefaultIcon();
    } catch (error) {
      logger.error(`获取商品 ${itemId} 图标失败:`, error);
      return this.getDefaultIcon();
    }
  }

  /**
   * 从管理页面HTML中解析商品图标
   * @param html 页面HTML内容
   * @param itemId 商品ID
   * @returns 图标URL或null
   */
  private static parseIconFromManagePage(html: string, itemId: string): string | null {
    try {
      // 创建临时DOM元素来解析HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 查找所有商品列表项
      const items = doc.querySelectorAll('#items > li');
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // 查找商品链接，提取商品ID
        const itemLink = item.querySelector('a[href*="/items/"]');
        if (itemLink) {
          const href = itemLink.getAttribute('href');
          if (href && href.includes(itemId)) {
            // 找到匹配的商品，提取图标
            // 使用精确的CSS选择器: .cell.thumbnail img
            const iconImg = item.querySelector('.cell.thumbnail img');
            if (iconImg) {
              const src = iconImg.getAttribute('src');
              if (src) {
                return src;
              }
            }
            
            // 备用选择器，以防上面的选择器不匹配
            const altIconImg = item.querySelector('.thumbnail img');
            if (altIconImg) {
              const src = altIconImg.getAttribute('src');
              if (src) {
                return src;
              }
            }
          }
        }
      }
      
      // 如果没找到，尝试使用正则表达式匹配
      const iconMatch = html.match(new RegExp(`href="[^"]*${itemId}[^"]*"[^>]*>[^<]*<[^>]*<img[^>]*src="([^"]*)"`, 'i'));
      if (iconMatch && iconMatch[1]) {
        return iconMatch[1];
      }
      
      return null;
    } catch (error) {
      logger.error('解析管理页面HTML失败:', error);
      return null;
    }
  }

  /**
   * 批量获取商品图标
   * @param itemIds 商品ID列表
   * @returns Promise<Map<string, string>> 商品ID到图标URL的映射
   */
  static async batchFetchIcons(itemIds: string[]): Promise<Map<string, string>> {
    const iconMap = new Map<string, string>();
    
    try {
      // 一次性获取管理页面，然后解析所有商品
      const allIcons = await this.fetchAllIconsFromManagePage();
      
      // 为每个请求的商品ID分配图标
      itemIds.forEach(itemId => {
        const iconUrl = allIcons.get(itemId);
        if (iconUrl) {
          iconMap.set(itemId, iconUrl);
        } else {
          iconMap.set(itemId, this.getDefaultIcon());
        }
      });
    } catch (error) {
      logger.error('批量获取商品图标失败:', error);
      // 如果批量获取失败，回退到单个获取
      const promises = itemIds.map(async (itemId) => {
        try {
          const iconUrl = await this.fetchIconFromBooth(itemId);
          iconMap.set(itemId, iconUrl);
        } catch (error) {
          logger.error(`获取商品 ${itemId} 图标失败:`, error);
          iconMap.set(itemId, this.getDefaultIcon());
        }
      });

      await Promise.all(promises);
    }
    
    return iconMap;
  }

  /**
   * 从管理页面获取所有商品图标
   * @returns Promise<Map<string, string>> 所有商品ID到图标URL的映射
   */
  static async fetchAllIconsFromManagePage(): Promise<Map<string, string>> {
    try {
      const boothManageUrl = 'https://manage.booth.pm/items';
      
      const response = await new Promise<string>((resolve, reject) => {
        if (typeof GM_xmlhttpRequest !== 'undefined') {
          GM_xmlhttpRequest({
            method: 'GET',
            url: boothManageUrl,
            onload: function(response) {
              if (response.status === 200) {
                resolve(response.responseText);
              } else {
                reject(new Error(`HTTP ${response.status}`));
              }
            },
            onerror: function(error) {
              reject(error);
            }
          });
        } else {
          reject(new Error('GM_xmlhttpRequest not available'));
        }
      });

      return this.parseAllIconsFromManagePage(response);
    } catch (error) {
      logger.error('获取管理页面失败:', error);
      return new Map();
    }
  }

  /**
   * 从管理页面HTML中解析所有商品图标
   * @param html 页面HTML内容
   * @returns Map<string, string> 商品ID到图标URL的映射
   */
  private static parseAllIconsFromManagePage(html: string): Map<string, string> {
    const iconMap = new Map<string, string>();
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 查找所有商品列表项
      const items = doc.querySelectorAll('#items > li');
      
      items.forEach((item, index) => {
        // 查找商品链接，提取商品ID
        const itemLink = item.querySelector('a[href*="/items/"]');
        if (itemLink) {
          const href = itemLink.getAttribute('href');
          if (href) {
            // 从href中提取商品ID
            const itemIdMatch = href.match(/\/items\/([^\/\?]+)/);
            if (itemIdMatch && itemIdMatch[1]) {
              const itemId = itemIdMatch[1];
              
              // 提取图标
              const iconImg = item.querySelector('.cell.thumbnail img, .thumbnail img');
              if (iconImg) {
                const src = iconImg.getAttribute('src');
                if (src) {
                  iconMap.set(itemId, src);
                }
              }
            }
          }
        }
      });
    } catch (error) {
      logger.error('解析管理页面HTML失败:', error);
    }
    
    return iconMap;
  }

  /**
   * 缓存图标URL
   * @param itemId 商品ID
   * @param iconUrl 图标URL
   */
  static cacheIcon(itemId: string, iconUrl: string): void {
    try {
      if (typeof GM_setValue !== 'undefined') {
        const cacheKey = `booth_icon_${itemId}`;
        const cacheData = {
          url: iconUrl,
          timestamp: Date.now()
        };
        GM_setValue(cacheKey, JSON.stringify(cacheData));
      }
    } catch (error) {
      logger.error(`缓存商品 ${itemId} 图标失败:`, error);
    }
  }

  /**
   * 获取缓存的图标URL
   * @param itemId 商品ID
   * @param maxAge 最大缓存时间（毫秒，默认24小时）
   * @returns 缓存的图标URL，如果不存在或已过期则返回null
   */
  static getCachedIcon(itemId: string, maxAge: number = 24 * 60 * 60 * 1000): string | null {
    try {
      if (typeof GM_getValue !== 'undefined') {
        const cacheKey = `booth_icon_${itemId}`;
        const cachedData = GM_getValue(cacheKey, null);
        
        if (cachedData) {
          const data = JSON.parse(cachedData);
          const age = Date.now() - data.timestamp;
          
          if (age < maxAge) {
            return data.url;
          }
        }
      }
    } catch (error) {
      logger.error(`获取商品 ${itemId} 缓存图标失败:`, error);
    }
    
    return null;
  }

  /**
   * 获取商品图标（优先使用缓存）
   * @param itemId 商品ID
   * @returns Promise<string> 图标URL
   */
  static async getIcon(itemId: string): Promise<string> {
    // 首先尝试从缓存获取
    const cachedIcon = this.getCachedIcon(itemId);
    if (cachedIcon) {
      return cachedIcon;
    }

    // 如果缓存中没有，则从Booth获取
    try {
      const iconUrl = await this.fetchIconFromBooth(itemId);
      this.cacheIcon(itemId, iconUrl);
      return iconUrl;
    } catch (error) {
      logger.error(`获取商品 ${itemId} 图标失败:`, error);
      return this.getDefaultIcon();
    }
  }
} 