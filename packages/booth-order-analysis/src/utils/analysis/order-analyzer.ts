import type { Order, OrderStats } from '../../types/order';

import { calculateNetAmount } from '../booth/booth-fee-calculator';

export class OrderAnalyzer {
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
} 