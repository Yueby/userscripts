import type { OrderStatus } from '../../types/order';
import { logger } from '../core/logger';

/**
 * 订单状态映射配置
 */
export const ORDER_STATUS_MAPPING: Record<string, OrderStatus> = {
  // 日语状态映射
  '発送完了': 'Completed',    // 发货完成
  'キャンセル': 'Cancelled',   // 已取消
  '支払待ち': 'Pending',      // 待支付
  
  // 英文状态（保持原样）
  'Completed': 'Completed',
  'Cancelled': 'Cancelled', 
  'Pending': 'Pending'
};

/**
 * 标准化订单状态
 * @param rawState 原始订单状态字符串
 * @returns 标准化的订单状态
 */
export function normalizeOrderState(rawState: string): OrderStatus {
  const state = rawState.trim();
  
  // 查找映射
  const normalizedState = ORDER_STATUS_MAPPING[state];
  
  if (normalizedState) {
    return normalizedState;
  }
  
        // 未知状态，返回默认值
      return 'Pending';
}

/**
 * 获取所有支持的订单状态
 */
export function getSupportedOrderStates(): string[] {
  return Object.keys(ORDER_STATUS_MAPPING);
}

/**
 * 检查是否为有效的订单状态
 */
export function isValidOrderState(state: string): boolean {
  return state in ORDER_STATUS_MAPPING;
} 