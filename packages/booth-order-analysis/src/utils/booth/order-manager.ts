import type { BoothItem, Order, OrderItem, VariantSalesStats } from '../../types/order';
import { logger } from '../core/logger';
import { ItemManager } from './item-manager';

/**
 * 订单管理器
 * 专门用于处理订单数据的分析和统计
 * 符合Booth的设计：一个商品ID对应多个变体
 */
export class OrderManager {
  private static instance: OrderManager;
  private itemManager: ItemManager;
  private variantCache: Map<string, VariantSalesStats[]> = new Map();
  private lastProcessedOrders: Order[] = [];
  private cachedItemsWithStats: Array<{
    itemId: string;
    item: BoothItem;
    salesStats: {
      totalQuantity: number;
      totalRevenue: number;
      totalBoothFee: number;
      totalNetRevenue: number;
      orderCount: number;
    };
    variantStats: VariantSalesStats[];
  }> | null = null;
  private cachedSalesStats: Map<string, {
    totalQuantity: number;
    totalRevenue: number;
    totalBoothFee: number;
    totalNetRevenue: number;
    orderCount: number;
  }> | null = null;

  private constructor() {
    this.itemManager = ItemManager.getInstance();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): OrderManager {
    if (!OrderManager.instance) {
      OrderManager.instance = new OrderManager();
    }
    return OrderManager.instance;
  }

  /**
   * 获取商品的销售统计
   */
  getItemSalesStats(itemId: string, orders: Order[]): {
    totalQuantity: number;
    totalRevenue: number;
    totalBoothFee: number;
    totalNetRevenue: number;
    orderCount: number;
  } {
    let totalQuantity = 0;
    let totalRevenue = 0;
    let totalBoothFee = 0;
    let orderCount = 0;

    orders.forEach(order => {
      order.items?.forEach((item: OrderItem) => {
        if (item.itemId === itemId) {
          const quantity = item.quantity || 0;
          totalQuantity += quantity;

          // 按数量比例分配订单金额
          const totalItemsInOrder = order.items.reduce((sum, orderItem) => sum + (orderItem.quantity || 0), 0);
          if (totalItemsInOrder > 0) {
            const itemValue = (quantity / totalItemsInOrder) * order.totalPrice;
            const itemBoothFee = (quantity / totalItemsInOrder) * (order.totalPrice * 0.1);
            totalRevenue += itemValue;
            totalBoothFee += itemBoothFee;
          }
          orderCount += 1;
        }
      });
    });

    const totalNetRevenue = totalRevenue - totalBoothFee;

    return {
      totalQuantity,
      totalRevenue,
      totalBoothFee,
      totalNetRevenue,
      orderCount
    };
  }

  /**
   * 获取所有商品的销售统计（带缓存优化）
   */
  getAllItemSalesStats(orders: Order[]): Map<string, {
    totalQuantity: number;
    totalRevenue: number;
    totalBoothFee: number;
    totalNetRevenue: number;
    orderCount: number;
  }> {
    // 检查缓存
    if (this.lastProcessedOrders.length === orders.length && this.cachedSalesStats) {
      return this.cachedSalesStats;
    }

    const stats = new Map<string, {
      totalQuantity: number;
      totalRevenue: number;
      totalBoothFee: number;
      totalNetRevenue: number;
      orderCount: number;
    }>();

    // 初始化所有商品的统计
    const allItems = this.itemManager.getAllItems();
    allItems.forEach((item, itemId) => {
      stats.set(itemId, {
        totalQuantity: 0,
        totalRevenue: 0,
        totalBoothFee: 0,
        totalNetRevenue: 0,
        orderCount: 0
      });
    });

    // 统计订单数据
    orders.forEach(order => {
      order.items?.forEach((item: OrderItem) => {
        const itemId = item.itemId;
        const currentStats = stats.get(itemId);

        if (currentStats) {
          const quantity = item.quantity || 0;

          // 按数量比例分配订单金额
          const totalItemsInOrder = order.items.reduce((sum, orderItem) => sum + (orderItem.quantity || 0), 0);
          if (totalItemsInOrder > 0) {
            const itemValue = (quantity / totalItemsInOrder) * order.totalPrice;
            const itemBoothFee = (quantity / totalItemsInOrder) * (order.totalPrice * 0.1);

            currentStats.totalQuantity += quantity;
            currentStats.totalRevenue += itemValue;
            currentStats.totalBoothFee += itemBoothFee;
            currentStats.orderCount += 1;
          }
        }
      });
    });

    // 计算净收入
    stats.forEach(stat => {
      stat.totalNetRevenue = stat.totalRevenue - stat.totalBoothFee;
    });

    // 更新缓存
    this.lastProcessedOrders = [...orders];
    this.cachedSalesStats = stats;

    return stats;
  }

  /**
   * 获取商品的变体销售统计（优化版本，使用缓存）
   */
  getItemVariantStats(itemId: string, orders: Order[]): VariantSalesStats[] {
    // 检查是否需要重新处理订单数据
    if (this.shouldReprocessOrders(orders)) {
      this.preprocessAllItemVariants(orders);
      this.lastProcessedOrders = [...orders];
    }

    // 从缓存中获取变体数据
    const cachedVariants = this.variantCache.get(itemId);
    if (cachedVariants) {
      logger.debug(`从缓存获取商品 ${itemId} 的变体数据，共 ${cachedVariants.length} 个变体`);
      return cachedVariants;
    }

    // 如果缓存中没有，则实时分析（这种情况应该很少发生）
    const currentItem = this.itemManager.getItem(itemId);
    if (!currentItem) {
      logger.warn(`未找到商品: ${itemId}`);
      return [];
    }

    logger.debug(`实时分析商品 ${itemId} (${currentItem.name}) 的变体数据`);
    const variantStats = this.analyzeVariantsFromOrders(itemId, currentItem.name, orders);

    logger.debug(`找到 ${variantStats.length} 个变体`);
    return variantStats;
  }

  /**
   * 检查是否需要重新处理订单数据
   */
  private shouldReprocessOrders(orders: Order[]): boolean {
    // 如果订单数据发生变化，需要重新处理
    if (this.lastProcessedOrders.length !== orders.length) {
      return true;
    }

    // 如果缓存为空，需要重新处理
    if (this.variantCache.size === 0) {
      return true;
    }

    // 如果订单数量为0，不需要重新处理
    if (orders.length === 0) {
      return false;
    }

    // 检查是否有新的商品ID（这种情况很少发生）
    const currentItemIds = new Set(this.itemManager.getAllItemIds());
    const cachedItemIds = new Set(this.variantCache.keys());

    // 如果有新的商品ID，需要重新处理
    for (const itemId of currentItemIds) {
      if (!cachedItemIds.has(itemId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 从订单数据中分析变体
   * 主要逻辑：找到所有包含主商品名称但不等于主商品名称的订单项
   */
  private analyzeVariantsFromOrders(itemId: string, mainItemName: string, orders: Order[]): VariantSalesStats[] {
    const variantStats: VariantSalesStats[] = [];
    const variantNames = new Set<string>();

    // 1. 从订单中提取所有可能的变体名称
    orders.forEach(order => {
      order.items?.forEach((item: OrderItem) => {
        // 检查是否是当前商品的变体
        if (this.isVariantOfMainItem(item, itemId, mainItemName)) {
          const variantName = this.extractVariantName(item.name, mainItemName);
          if (variantName && variantName !== mainItemName) {
            variantNames.add(variantName);
            logger.debug(`发现变体: ${variantName} (来自订单项: ${item.name})`);
          }
        }
      });
    });

    // 2. 为每个变体计算销售统计
    variantNames.forEach(variantName => {
      const stats = this.calculateVariantStatsFromOrders(itemId, variantName, mainItemName, orders);
      if (stats.totalQuantity > 0) {
        variantStats.push(stats);
        logger.debug(`变体 ${variantName} 统计: 销量=${stats.totalQuantity}, 收入=${stats.totalRevenue}`);
      }
    });

    return variantStats;
  }

  /**
   * 判断订单项是否是主商品的变体
   */
  private isVariantOfMainItem(item: OrderItem, mainItemId: string, mainItemName: string): boolean {
    // 如果商品ID相同，直接认为是变体
    if (item.itemId === mainItemId) {
      return true;
    }

    // 如果商品名称包含主商品名称但不等于主商品名称，认为是变体
    if (item.name.includes(mainItemName) && item.name !== mainItemName) {
      return true;
    }

    return false;
  }

  /**
   * 从订单项名称中提取变体名称
   */
  private extractVariantName(itemName: string, mainItemName: string): string {
    // 如果名称包含主商品名称，提取变体部分
    if (itemName.includes(mainItemName)) {
      // 尝试提取变体信息，比如 "商品名 - 红色" 中的 "红色"
      const parts = itemName.split(mainItemName);
      if (parts.length > 1) {
        const variantPart = parts[1].trim();
        if (variantPart && !variantPart.match(/^[-\s]+$/)) {
          // 去掉括号和多余的空格
          let cleanVariantName = variantPart
            .replace(/^[-\s]+/, '')  // 去掉开头的连字符和空格
            .replace(/[-\s]+$/, '')  // 去掉结尾的连字符和空格
            .replace(/^[\(（]/, '')  // 去掉开头的括号
            .replace(/[\)）]$/, ''); // 去掉结尾的括号

          // 如果清理后的名称不为空且不等于主商品名称，则返回
          if (cleanVariantName && cleanVariantName !== mainItemName) {
            return cleanVariantName;
          }
        }
      }
    }

    // 如果无法提取或提取失败，返回完整名称（去掉括号）
    return itemName
      .replace(/^[\(（]/, '')
      .replace(/[\)）]$/, '');
  }

  /**
   * 从订单数据中计算变体的销售统计
   */
  private calculateVariantStatsFromOrders(
    itemId: string,
    variantName: string,
    mainItemName: string,
    orders: Order[]
  ): VariantSalesStats {
    let totalQuantity = 0;
    let totalRevenue = 0;
    let totalBoothFee = 0;
    let orderCount = 0;

    orders.forEach(order => {
      order.items?.forEach((item: OrderItem) => {
        // 检查是否匹配变体
        if (this.isVariantOfMainItem(item, itemId, mainItemName)) {
          const extractedVariantName = this.extractVariantName(item.name, mainItemName);

          // 如果提取的变体名称匹配，或者订单项名称包含变体名称
          if (extractedVariantName === variantName || item.name.includes(variantName)) {
            const quantity = item.quantity || 0;
            totalQuantity += quantity;

            // 按数量比例分配订单金额
            const totalItemsInOrder = order.items.reduce((sum, orderItem) => sum + (orderItem.quantity || 0), 0);
            if (totalItemsInOrder > 0) {
              const itemValue = (quantity / totalItemsInOrder) * order.totalPrice;
              const itemBoothFee = (quantity / totalItemsInOrder) * (order.totalPrice * 0.1);
              totalRevenue += itemValue;
              totalBoothFee += itemBoothFee;
            }
            orderCount += 1;
          }
        }
      });
    });

    const totalNetRevenue = totalRevenue - totalBoothFee;

    return {
      itemId,
      variantName,
      totalQuantity,
      totalRevenue,
      totalBoothFee,
      totalNetRevenue,
      orderCount
    };
  }

  /**
   * 获取商品的完整信息（包括销售统计和变体信息）
   */
  getItemWithStats(itemId: string, orders: Order[]): {
    item: BoothItem;
    salesStats: {
      totalQuantity: number;
      totalRevenue: number;
      totalBoothFee: number;
      totalNetRevenue: number;
      orderCount: number;
    };
    variantStats: VariantSalesStats[];
  } | null {
    const item = this.itemManager.getItem(itemId);
    if (!item) return null;

    const salesStats = this.getItemSalesStats(itemId, orders);
    const variantStats = this.getItemVariantStats(itemId, orders);

    return {
      item,
      salesStats,
      variantStats
    };
  }

  /**
   * 预处理所有商品的变体数据
   * 在订单分析阶段就完成变体数据的填充，提高后续使用效率
   */
  preprocessAllItemVariants(orders: Order[]): Map<string, VariantSalesStats[]> {
    // 清空之前的缓存
    this.variantCache.clear();

    const allVariantsMap = new Map<string, VariantSalesStats[]>();
    const allItems = this.itemManager.getAllItems();

    logger.debug(`开始预处理 ${allItems.size} 个商品的变体数据`);

    let processedCount = 0;
    let totalVariants = 0;

    allItems.forEach((item, itemId) => {
      const variantStats = this.analyzeVariantsFromOrders(itemId, item.name, orders);
      if (variantStats.length > 0) {
        allVariantsMap.set(itemId, variantStats);
        // 同时更新缓存
        this.variantCache.set(itemId, variantStats);
        processedCount++;
        totalVariants += variantStats.length;
        logger.debug(`商品 ${itemId} (${item.name}) 预处理完成，找到 ${variantStats.length} 个变体`);
      }
    });

    logger.debug(`变体数据预处理完成，共处理 ${processedCount} 个商品，总计 ${totalVariants} 个变体`);
    return allVariantsMap;
  }

  /**
   * 获取所有商品的销售统计（优化版本）
   */
  getAllItemsWithStats(orders: Order[]): Array<{
    itemId: string;
    item: BoothItem;
    salesStats: {
      totalQuantity: number;
      totalRevenue: number;
      totalBoothFee: number;
      totalNetRevenue: number;
      orderCount: number;
    };
    variantStats: VariantSalesStats[];
  }> {
    // 使用订单数量作为缓存键，更智能的缓存机制
    const cacheKey = orders.length;

    // 检查缓存
    if (this.lastProcessedOrders.length === orders.length && this.cachedItemsWithStats) {
      return this.cachedItemsWithStats;
    }

    // 如果没有订单数据，返回空数组
    if (!orders || orders.length === 0) {
      return [];
    }

    // 预计算所有商品的销售统计，避免重复计算
    const allSalesStats = this.getAllItemSalesStats(orders);

    const result: Array<{
      itemId: string;
      item: BoothItem;
      salesStats: {
        totalQuantity: number;
        totalRevenue: number;
        totalBoothFee: number;
        totalNetRevenue: number;
        orderCount: number;
      };
      variantStats: VariantSalesStats[];
    }> = [];

    // 获取所有商品
    const allItems = this.itemManager.getAllItems();

    // 使用预计算的销售统计，避免重复计算
    // 保持item数组的原始顺序，不进行排序
    allItems.forEach((item, itemId) => {
      const salesStats = allSalesStats.get(itemId) || {
        totalQuantity: 0,
        totalRevenue: 0,
        totalBoothFee: 0,
        totalNetRevenue: 0,
        orderCount: 0
      };

      // 使用缓存的变体数据
      const variantStats = this.variantCache.get(itemId) || [];

      result.push({
        itemId,
        item,
        salesStats,
        variantStats
      });
    });

    // 移除按销量排序，保持item数组的原始顺序

    // 更新缓存
    this.lastProcessedOrders = [...orders];
    this.cachedItemsWithStats = result;

    return result;
  }

  /**
   * 分析订单中的商品变体关系
   */
  analyzeOrderVariants(orders: Order[]): Map<string, string[]> {
    const relationships = new Map<string, string[]>();

    orders.forEach(order => {
      order.items?.forEach((item: OrderItem) => {
        if (item.variants && item.variants.length > 0) {
          const itemId = item.itemId;
          const variantNames = item.variants.map(v => v.variantName);

          if (!relationships.has(itemId)) {
            relationships.set(itemId, []);
          }

          const existingVariants = relationships.get(itemId)!;
          variantNames.forEach(variantName => {
            if (!existingVariants.includes(variantName)) {
              existingVariants.push(variantName);
            }
          });
        }
      });
    });

    return relationships;
  }

  /**
   * 获取订单统计摘要
   */
  getOrderSummary(orders: Order[]): {
    totalOrders: number;
    totalItems: number;
    totalRevenue: number;
    totalNetRevenue: number;
    uniqueItems: number;
  } {
    const uniqueItems = new Set<string>();
    let totalItems = 0;
    let totalRevenue = 0;
    let totalNetRevenue = 0;

    orders.forEach(order => {
      totalRevenue += order.totalPrice;
      totalNetRevenue += order.totalPrice * 0.9; // 假设10%手续费

      order.items?.forEach((item: OrderItem) => {
        uniqueItems.add(item.itemId);
        totalItems += item.quantity || 0;
      });
    });

    return {
      totalOrders: orders.length,
      totalItems,
      totalRevenue,
      totalNetRevenue,
      uniqueItems: uniqueItems.size
    };
  }

  /**
   * 获取变体统计摘要
   */
  getVariantSummary(itemId: string, orders: Order[]): {
    totalVariants: number;
    totalVariantQuantity: number;
    totalVariantRevenue: number;
    totalVariantNetRevenue: number;
  } {
    const variants = this.getItemVariantStats(itemId, orders);

    const summary = {
      totalVariants: variants.length,
      totalVariantQuantity: 0,
      totalVariantRevenue: 0,
      totalVariantNetRevenue: 0
    };

    variants.forEach(variant => {
      summary.totalVariantQuantity += variant.totalQuantity;
      summary.totalVariantRevenue += variant.totalRevenue;
      summary.totalVariantNetRevenue += variant.totalNetRevenue;
    });

    return summary;
  }

  /**
   * 分析所有商品的变体关系
   */
  analyzeAllVariantRelationships(orders: Order[]): Map<string, VariantSalesStats[]> {
    const relationships = new Map<string, VariantSalesStats[]>();
    const allItemIds = this.itemManager.getAllItemIds();

    allItemIds.forEach(itemId => {
      const variantStats = this.getItemVariantStats(itemId, orders);
      if (variantStats.length > 0) {
        relationships.set(itemId, variantStats);
      }
    });

    return relationships;
  }
} 