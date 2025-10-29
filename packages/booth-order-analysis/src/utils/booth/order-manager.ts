import type { BoothItem } from '../../types/item';
import type { Order, OrderItem, VariantSalesStats } from '../../types/order';
import { calculateBoothFee } from './booth-fee-calculator';
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
            const orderBoothFee = calculateBoothFee(order.totalPrice, order.createdAt);
            const itemBoothFee = (quantity / totalItemsInOrder) * orderBoothFee;
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
    const allItems = this.itemManager.getAllBoothItems();
    allItems.forEach((_item, itemId) => {
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
            const orderBoothFee = calculateBoothFee(order.totalPrice, order.createdAt);
            const itemBoothFee = (quantity / totalItemsInOrder) * orderBoothFee;

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
      return cachedVariants;
    }

    // 如果缓存中没有，则实时分析（这种情况应该很少发生）
    const currentItem = this.itemManager.getBoothItem(itemId);
    if (!currentItem) {
      return [];
    }

    const variantStats = this.analyzeVariantsFromOrders(itemId, currentItem.name, orders);
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
    const currentItemIds = new Set(this.itemManager.getAllBoothItemIds());
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
   * 从BoothItem的HTML数据中获取变体信息
   * 直接从variants中获取变体名称，然后从订单中统计销售数据
   */
  private analyzeVariantsFromOrders(itemId: string, mainItemName: string, orders: Order[]): VariantSalesStats[] {
    const boothItem = this.itemManager.getBoothItem(itemId);
    if (!boothItem || !boothItem.variants) {
      return [];
    }

    const variantStats: VariantSalesStats[] = [];
    const htmlVariants = boothItem.variants;

    // 为每个HTML变体计算销售统计
    htmlVariants.forEach(htmlVariant => {
      const stats = this.calculateVariantStatsFromOrders(itemId, htmlVariant.name, mainItemName, orders);
      if (stats.totalQuantity > 0) {
        variantStats.push(stats);
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
   * 从订单数据中计算变体的销售统计
   * 匹配HTML变体名称和订单中的商品名称
   * 订单格式: "商品名 (变体名)"
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

    const expectedVariantName = `${mainItemName} (${variantName})`;

    orders.forEach(order => {
      order.items?.forEach((item: OrderItem) => {
        // 检查是否匹配变体
        if (this.isVariantOfMainItem(item, itemId, mainItemName)) {
          // 检查订单项名称是否匹配变体格式: "商品名 (变体名)"
          const orderItemName = item.name;
          
          if (orderItemName === expectedVariantName) {
            const quantity = item.quantity || 0;
            totalQuantity += quantity;

            // 按数量比例分配订单金额
            const totalItemsInOrder = order.items.reduce((sum, orderItem) => sum + (orderItem.quantity || 0), 0);
            if (totalItemsInOrder > 0) {
              const itemValue = (quantity / totalItemsInOrder) * order.totalPrice;
              const orderBoothFee = calculateBoothFee(order.totalPrice, order.createdAt);
              const itemBoothFee = (quantity / totalItemsInOrder) * orderBoothFee;
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
    const boothItem = this.itemManager.getBoothItem(itemId);
    if (!boothItem) return null;

    const salesStats = this.getItemSalesStats(itemId, orders);
    const variantStats = this.getItemVariantStats(itemId, orders);

    return {
      item: boothItem,
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
    const allItems = this.itemManager.getAllBoothItems();

    allItems.forEach((boothItem, itemId) => {
      const variantStats = this.analyzeVariantsFromOrders(itemId, boothItem.name, orders);
      if (variantStats.length > 0) {
        allVariantsMap.set(itemId, variantStats);
        // 同时更新缓存
        this.variantCache.set(itemId, variantStats);
      }
    });
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

    // 预处理所有商品的变体数据（一次性处理，避免重复计算）
    if (this.shouldReprocessOrders(orders)) {
      this.preprocessAllItemVariants(orders);
      this.lastProcessedOrders = [...orders];
    }

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

    // 获取所有BoothItem
    const allBoothItems = this.itemManager.getAllBoothItems();

    // 使用预计算的销售统计，避免重复计算
    // 保持item数组的原始顺序，不进行排序
    allBoothItems.forEach((boothItem, itemId) => {
      const salesStats = allSalesStats.get(itemId) || {
        totalQuantity: 0,
        totalRevenue: 0,
        totalBoothFee: 0,
        totalNetRevenue: 0,
        orderCount: 0
      };

      // 使用预处理的变体数据
      const variantStats = this.variantCache.get(itemId) || [];

      result.push({
        itemId,
        item: boothItem,
        salesStats,
        variantStats
      });
    });

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
      const orderBoothFee = calculateBoothFee(order.totalPrice, order.createdAt);
      totalNetRevenue += order.totalPrice - orderBoothFee;

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