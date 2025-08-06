import { formatInTimeZone } from 'date-fns-tz';
import type { Order, OrderStats } from '../../types/order';
import type { UserSettings } from '../../types/settings';
import { calculateNetAmount } from '../booth/booth-fee-calculator';
import { ItemManager } from '../booth/item-manager';
import { logger } from '../core/logger';

// 图表数据接口
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

// 时间周期类型
export type TimePeriod = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

// 自定义时间范围
export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD 格式
  endDate: string;   // YYYY-MM-DD 格式
}

// 过滤选项
export interface FilterOptions {
  period: TimePeriod;
  customRange?: CustomDateRange;
}

/**
 * 数据分析器
 * 整合图表数据处理、订单分析和数据过滤功能
 */
export class DataAnalyzer {
  /**
   * 计算订单统计信息
   */
  static calculateStats(orders: Order[]): OrderStats {
    // 只统计已完成的订单
    const completedOrders = orders.filter(order => order.state === 'Completed');

    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // 计算到手金额
    const totalNetRevenue = completedOrders.reduce((sum, order) => {
      return sum + calculateNetAmount(order.totalPrice, order.createdAt);
    }, 0);

    const stats = {
      totalOrders,
      totalRevenue,
      totalNetRevenue
    };

    return stats;
  }

  /**
   * 根据时间周期过滤订单数据
   */
  static filterOrdersByPeriod(orders: Order[], options: FilterOptions, userSettings?: UserSettings): Order[] {
    const { period, customRange } = options;

    // 首先过滤出已完成的订单
    const completedOrders = orders.filter(order => order.state === 'Completed');

    let filteredOrders: Order[];

    switch (period) {
      case 'all':
        filteredOrders = completedOrders;
        break;
      case 'today':
        filteredOrders = this.filterByToday(completedOrders);
        break;
      case 'yesterday':
        filteredOrders = this.filterByYesterday(completedOrders);
        break;
      case 'thisWeek':
        filteredOrders = this.filterByThisWeek(completedOrders, userSettings);
        break;
      case 'lastWeek':
        filteredOrders = this.filterByLastWeek(completedOrders, userSettings);
        break;
      case 'thisMonth':
        filteredOrders = this.filterByThisMonth(completedOrders);
        break;
      case 'lastMonth':
        filteredOrders = this.filterByLastMonth(completedOrders);
        break;
      case 'custom':
        if (customRange) {
          filteredOrders = this.filterByCustomRange(completedOrders, customRange);
        } else {
          filteredOrders = completedOrders;
        }
        break;
      default:
        filteredOrders = completedOrders;
    }

    return filteredOrders;
  }

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
   * 获取时间周期的显示名称
   */
  static getPeriodDisplayName(period: TimePeriod): string {
    const periodNames: Record<TimePeriod, string> = {
      all: '全部',
      today: '今日',
      yesterday: '昨日',
      thisWeek: '本周',
      lastWeek: '上周',
      thisMonth: '本月',
      lastMonth: '上月',
      custom: '自定义'
    };
    return periodNames[period];
  }

  /**
   * 获取所有可用的时间周期选项
   */
  static getAvailablePeriods(): Array<{ value: TimePeriod; label: string; }> {
    return [
      { value: 'all', label: '全部' },
      { value: 'today', label: '今日' },
      { value: 'yesterday', label: '昨日' },
      { value: 'thisWeek', label: '本周' },
      { value: 'lastWeek', label: '上周' },
      { value: 'thisMonth', label: '本月' },
      { value: 'lastMonth', label: '上月' },
      { value: 'custom', label: '自定义' }
    ];
  }

  /**
   * 格式化日期为显示格式
   */
  static formatDateRange(period: TimePeriod, customRange?: CustomDateRange, userSettings?: UserSettings): string {
    switch (period) {
      case 'all':
        return '全部';
      case 'today':
        return this.getCurrentJSTDate();
      case 'yesterday':
        return this.getJSTDateWithOffset(-1);
      case 'thisWeek':
        const thisWeekRange = this.getThisWeekJSTRange(userSettings);
        return `${thisWeekRange.start.substring(5)} 至 ${thisWeekRange.end.substring(5)}`;
      case 'lastWeek':
        const lastWeekRange = this.getLastWeekJSTRange(userSettings);
        return `${lastWeekRange.start.substring(5)} 至 ${lastWeekRange.end.substring(5)}`;
      case 'thisMonth':
        return this.getCurrentJSTMonth().replace('-', '年') + '月';
      case 'lastMonth':
        return this.getJSTMonthWithOffset(-1).replace('-', '年') + '月';
      case 'custom':
        if (customRange) {
          return `${customRange.startDate} 至 ${customRange.endDate}`;
        }
        return '自定义';
      default:
        return '全部';
    }
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

  /**
   * 格式化日期用于图表显示
   */
  static formatDateForDisplay(dateString: string): string {
    try {
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    } catch (error) {
      logger.error('日期格式化失败:', dateString, error);
      return dateString;
    }
  }

  // 私有方法：时间过滤
  private static filterByToday(orders: Order[]): Order[] {
    const jstToday = this.getCurrentJSTDate();
    
    const filtered = orders.filter(order => {
      const orderDateStr = this.parseOrderDate(order.createdAt);
      return orderDateStr === jstToday;
    });

    return filtered;
  }

  private static filterByYesterday(orders: Order[]): Order[] {
    const jstYesterday = this.getJSTDateWithOffset(-1);
    
    const filtered = orders.filter(order => {
      const orderDateStr = this.parseOrderDate(order.createdAt);
      return orderDateStr === jstYesterday;
    });

    return filtered;
  }

  private static filterByThisWeek(orders: Order[], userSettings?: UserSettings): Order[] {
    const weekRange = this.getThisWeekJSTRange(userSettings);
    
    const filtered = orders.filter(order => {
      const orderDateStr = this.parseOrderDate(order.createdAt);
      return orderDateStr >= weekRange.start && orderDateStr <= weekRange.end;
    });

    return filtered;
  }

  private static filterByLastWeek(orders: Order[], userSettings?: UserSettings): Order[] {
    const weekRange = this.getLastWeekJSTRange(userSettings);
    
    const filtered = orders.filter(order => {
      const orderDateStr = this.parseOrderDate(order.createdAt);
      return orderDateStr >= weekRange.start && orderDateStr <= weekRange.end;
    });

    return filtered;
  }

  private static filterByThisMonth(orders: Order[]): Order[] {
    const jstThisMonth = this.getCurrentJSTMonth();
    
    const filtered = orders.filter(order => {
      const orderDateStr = this.parseOrderDate(order.createdAt);
      const orderMonth = orderDateStr.substring(0, 7); // 提取年月部分 "2025-08"
      return orderMonth === jstThisMonth;
    });

    return filtered;
  }

  private static filterByLastMonth(orders: Order[]): Order[] {
    const jstLastMonth = this.getJSTMonthWithOffset(-1);
    
    const filtered = orders.filter(order => {
      const orderDateStr = this.parseOrderDate(order.createdAt);
      const orderMonth = orderDateStr.substring(0, 7); // 提取年月部分 "2025-08"
      return orderMonth === jstLastMonth;
    });

    return filtered;
  }

  private static filterByCustomRange(orders: Order[], range: CustomDateRange): Order[] {
    try {
      const filtered = orders.filter(order => {
        try {
          const orderDateStr = order.createdAt.split(' ')[0]; // 提取日期部分 YYYY-MM-DD
          return orderDateStr >= range.startDate && orderDateStr <= range.endDate;
        } catch {
          return false;
        }
      });

      return filtered;
    } catch (error) {
      logger.error('自定义日期范围解析失败:', error);
      return [];
    }
  }

  // 私有方法：日期处理
  private static extractDateFromOrder(createdAt: string): string | null {
    if (!createdAt) return null;

    // 解析 YYYY-MM-DD HH:mm:ss 格式
    const parts = createdAt.split(' ');
    if (parts.length !== 2) return null;

    return parts[0]; // 返回日期部分 YYYY-MM-DD
  }

  // 时区转换相关方法
  private static getCurrentJSTDate(): string {
    const now = new Date();
    return formatInTimeZone(now, 'Asia/Tokyo', 'yyyy-MM-dd');
  }

  private static getJSTDateWithOffset(offsetDays: number): string {
    const now = new Date();
    const targetDate = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return formatInTimeZone(targetDate, 'Asia/Tokyo', 'yyyy-MM-dd');
  }

  private static getCurrentJSTMonth(): string {
    const now = new Date();
    return formatInTimeZone(now, 'Asia/Tokyo', 'yyyy-MM');
  }

  private static getJSTMonthWithOffset(offsetMonths: number): string {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
    return formatInTimeZone(targetDate, 'Asia/Tokyo', 'yyyy-MM');
  }

  private static getThisWeekJSTRange(userSettings?: UserSettings): { start: string; end: string } {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
    
    // 根据用户设置决定一周的第一天
    const mondayAsFirstDay = userSettings?.mondayAsFirstDay ?? true;
    
    let mondayOffset: number;
    if (mondayAsFirstDay) {
      // 以周一作为一周第一天
      // 如果今天是周日(0)，需要往前推6天到本周一
      // 如果今天是周一(1)，需要往前推0天
      // 如果今天是周二(2)，需要往前推1天
      // 以此类推...
      mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    } else {
      // 以周日作为一周第一天
      // 如果今天是周日(0)，需要往前推0天
      // 如果今天是周一(1)，需要往前推1天
      // 如果今天是周二(2)，需要往前推2天
      // 以此类推...
      mondayOffset = dayOfWeek;
    }
    
    const monday = new Date(today.getTime() - mondayOffset * 24 * 60 * 60 * 1000);
    const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      start: formatInTimeZone(monday, 'Asia/Tokyo', 'yyyy-MM-dd'),
      end: formatInTimeZone(sunday, 'Asia/Tokyo', 'yyyy-MM-dd')
    };
  }

  private static getLastWeekJSTRange(userSettings?: UserSettings): { start: string; end: string } {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
    
    // 根据用户设置决定一周的第一天
    const mondayAsFirstDay = userSettings?.mondayAsFirstDay ?? true;
    
    let mondayOffset: number;
    if (mondayAsFirstDay) {
      // 以周一作为一周第一天
      mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    } else {
      // 以周日作为一周第一天
      mondayOffset = dayOfWeek;
    }
    
    // 先找到本周一
    const thisMonday = new Date(today.getTime() - mondayOffset * 24 * 60 * 60 * 1000);
    // 再往前推7天找到上周一
    const lastMonday = new Date(thisMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
    // 上周日就是上周一加6天
    const lastSunday = new Date(lastMonday.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      start: formatInTimeZone(lastMonday, 'Asia/Tokyo', 'yyyy-MM-dd'),
      end: formatInTimeZone(lastSunday, 'Asia/Tokyo', 'yyyy-MM-dd')
    };
  }

  private static parseOrderDate(orderDateStr: string): string {
    try {
      // 解析订单时间格式: "2025-08-02 16:57:21"
      return orderDateStr.split(' ')[0]; // 提取日期部分 "2025-08-02"
    } catch {
      return '';
    }
  }
}

