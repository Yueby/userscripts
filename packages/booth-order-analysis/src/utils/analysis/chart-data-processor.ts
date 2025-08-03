import type { Order } from '../../types/order';
import { logger } from '../core/logger';
import { ItemManager } from '../booth/item-manager';

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  percentage: number;
}

export interface ProductSalesData {
  itemId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  averagePrice: number;
}

export class ChartDataProcessor {
  /**
   * 生成收入走势图数据
   */
  static generateRevenueTrendData(orders: Order[]): ChartDataPoint[] {

    if (!orders || orders.length === 0) {
      return [];
    }

    // 按日期分组
    const dailyData = new Map<string, { revenue: number; orders: number; }>();

    orders.forEach(order => {
      const dateStr = this.extractDateFromOrder(order.createdAt);
      if (!dateStr) return;

      const existing = dailyData.get(dateStr) || { revenue: 0, orders: 0 };
      existing.revenue += order.totalPrice;
      existing.orders += 1;
      dailyData.set(dateStr, existing);
    });

    // 转换为数组并排序
    const result: ChartDataPoint[] = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  /**
   * 生成支付方式统计数据
   */
  static generatePaymentMethodData(orders: Order[]): PaymentMethodData[] {

    if (!orders || orders.length === 0) {
      return [];
    }

    // 统计支付方式
    const methodCount = new Map<string, number>();
    const totalOrders = orders.length;

    orders.forEach(order => {
      const method = order.paymentMethod || '未知';
      methodCount.set(method, (methodCount.get(method) || 0) + 1);
    });

    // 转换为数组并计算百分比
    const result: PaymentMethodData[] = Array.from(methodCount.entries())
      .map(([method, count]) => ({
        method,
        count,
        percentage: Math.round((count / totalOrders) * 100)
      }))
      .sort((a, b) => b.count - a.count); // 按数量降序排列

    return result;
  }

  /**
   * 生成商品销量排行榜数据
   */
  static generateProductSalesRanking(orders: Order[]): ProductSalesData[] {
    if (!orders || orders.length === 0) {
      return [];
    }

    const itemManager = ItemManager.getInstance();

    // 统计每个商品的销量数据
    const productStats = new Map<string, {
      name: string;
      totalQuantity: number;
      totalRevenue: number;
      orderCount: number;
    }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productStats.get(item.itemId) || {
          name: item.name, // 默认使用订单中的名称
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0
        };

        existing.totalQuantity += item.quantity;
        // 按商品数量比例分配订单总收入
        const itemRatio = item.quantity / order.items.reduce((sum, i) => sum + i.quantity, 0);
        existing.totalRevenue += order.totalPrice * itemRatio;
        existing.orderCount += 1;

        productStats.set(item.itemId, existing);
      });
    });

    // 转换为数组并计算平均价格，使用 ItemManager 中的商品名称
    const result: ProductSalesData[] = Array.from(productStats.entries())
      .map(([itemId, stats]) => {
        // 优先使用 ItemManager 中的商品名称，如果没有则使用订单中的名称
        const itemName = itemManager.getItemName(itemId) || stats.name;
        
        return {
          itemId,
          name: itemName,
          totalQuantity: stats.totalQuantity,
          totalRevenue: Math.round(stats.totalRevenue),
          orderCount: stats.orderCount,
          averagePrice: stats.totalQuantity > 0 ? Math.round(stats.totalRevenue / stats.totalQuantity) : 0
        };
      })
      .sort((a, b) => b.totalQuantity - a.totalQuantity); // 按销量降序排列

    return result;
  }

  /**
   * 从订单时间中提取日期
   */
  private static extractDateFromOrder(createdAt: string): string | null {
    if (!createdAt) return null;

    // 解析 YYYY-MM-DD HH:mm:ss 格式
    const parts = createdAt.split(' ');
    if (parts.length !== 2) return null;

    return parts[0]; // 返回日期部分 YYYY-MM-DD
  }

  /**
   * 格式化日期显示
   */
  static formatDateForDisplay(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  }

  /**
   * 获取图表颜色配置
   */
  static getChartColors(count: number): string[] {
    const colors = [
      '#3b82f6', // 蓝色
      '#ef4444', // 红色
      '#10b981', // 绿色
      '#f59e0b', // 橙色
      '#8b5cf6', // 紫色
      '#06b6d4', // 青色
      '#f97316', // 橙红色
      '#84cc16', // 黄绿色
      '#ec4899', // 粉色
      '#6366f1'  // 靛蓝色
    ];

    // 如果颜色不够，循环使用
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }

    return result;
  }
} 