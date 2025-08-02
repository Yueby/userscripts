
import type { Order } from '../../types/order';
import { logger } from '../core/logger';
import { TimezoneConverter } from '../timezone-converter';

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

// 数据过滤器
export class DataFilter {

  /**
   * 根据时间周期过滤订单数据
   */
  static filterOrdersByPeriod(orders: Order[], options: FilterOptions): Order[] {
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
        filteredOrders = this.filterByThisWeek(completedOrders);
        break;
      case 'lastWeek':
        filteredOrders = this.filterByLastWeek(completedOrders);
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
   * 过滤今日订单
   */
  private static filterByToday(orders: Order[]): Order[] {
    const jstToday = TimezoneConverter.getCurrentJSTDate();
    
    const filtered = orders.filter(order => {
      const orderDateStr = TimezoneConverter.parseOrderDate(order.createdAt);
      return orderDateStr === jstToday;
    });

    return filtered;
  }

    /**
   * 过滤昨日订单
   */
  private static filterByYesterday(orders: Order[]): Order[] {
    const jstYesterday = TimezoneConverter.getJSTDateWithOffset(-1);
    
    const filtered = orders.filter(order => {
      const orderDateStr = TimezoneConverter.parseOrderDate(order.createdAt);
      return orderDateStr === jstYesterday;
    });

    return filtered;
  }

    /**
   * 过滤本周订单（周一到周日）
   */
  private static filterByThisWeek(orders: Order[]): Order[] {
    const weekRange = TimezoneConverter.getThisWeekJSTRange();
    
    const filtered = orders.filter(order => {
      const orderDateStr = TimezoneConverter.parseOrderDate(order.createdAt);
      return orderDateStr >= weekRange.start && orderDateStr <= weekRange.end;
    });

    return filtered;
  }

    /**
   * 过滤上周订单
   */
  private static filterByLastWeek(orders: Order[]): Order[] {
    const weekRange = TimezoneConverter.getLastWeekJSTRange();
    
    const filtered = orders.filter(order => {
      const orderDateStr = TimezoneConverter.parseOrderDate(order.createdAt);
      return orderDateStr >= weekRange.start && orderDateStr <= weekRange.end;
    });

    return filtered;
  }

    /**
   * 过滤本月订单
   */
  private static filterByThisMonth(orders: Order[]): Order[] {
    const jstThisMonth = TimezoneConverter.getCurrentJSTMonth();
    
    const filtered = orders.filter(order => {
      const orderDateStr = TimezoneConverter.parseOrderDate(order.createdAt);
      const orderMonth = orderDateStr.substring(0, 7); // 提取年月部分 "2025-08"
      return orderMonth === jstThisMonth;
    });

    return filtered;
  }

    /**
   * 过滤上月订单
   */
  private static filterByLastMonth(orders: Order[]): Order[] {
    const jstLastMonth = TimezoneConverter.getJSTMonthWithOffset(-1);
    
    const filtered = orders.filter(order => {
      const orderDateStr = TimezoneConverter.parseOrderDate(order.createdAt);
      const orderMonth = orderDateStr.substring(0, 7); // 提取年月部分 "2025-08"
      return orderMonth === jstLastMonth;
    });

    return filtered;
  }

  /**
   * 过滤自定义时间范围
   */
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
  static formatDateRange(period: TimePeriod, customRange?: CustomDateRange): string {
    switch (period) {
      case 'all':
        return '全部';
      case 'today':
        return TimezoneConverter.getCurrentJSTDate();
      case 'yesterday':
        return TimezoneConverter.getJSTDateWithOffset(-1);
      case 'thisWeek':
        const thisWeekRange = TimezoneConverter.getThisWeekJSTRange();
        return `${thisWeekRange.start.substring(5)} 至 ${thisWeekRange.end.substring(5)}`;
      case 'lastWeek':
        const lastWeekRange = TimezoneConverter.getLastWeekJSTRange();
        return `${lastWeekRange.start.substring(5)} 至 ${lastWeekRange.end.substring(5)}`;
      case 'thisMonth':
        return TimezoneConverter.getCurrentJSTMonth().replace('-', '年') + '月';
      case 'lastMonth':
        return TimezoneConverter.getJSTMonthWithOffset(-1).replace('-', '年') + '月';
      case 'custom':
        if (customRange) {
          return `${customRange.startDate} 至 ${customRange.endDate}`;
        }
        return '自定义';
      default:
        return '全部';
    }
  }

} 