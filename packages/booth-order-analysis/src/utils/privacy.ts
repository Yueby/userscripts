/**
 * 隐私模式工具函数
 * 用于处理敏感信息的隐藏
 */

/**
 * 隐藏敏感信息
 * @param text 原始文本
 * @param privacyMode 是否开启隐私模式
 * @returns 处理后的文本
 */
export function maskSensitiveInfo(text: string | number, privacyMode: boolean): string {
  if (!privacyMode) {
    return String(text);
  }
  
  // 如果是数字，根据长度决定隐藏程度
  if (typeof text === 'number') {
    const numStr = String(text);
    if (numStr.length <= 2) {
      return '**';
    } else if (numStr.length <= 4) {
      return '****';
    } else {
      return '******';
    }
  }
  
  // 如果是字符串，根据长度决定隐藏程度
  const str = String(text);
  if (str.length <= 2) {
    return '**';
  } else if (str.length <= 4) {
    return '****';
  } else {
    return '******';
  }
}

/**
 * 隐藏订单编号
 * @param orderNumber 订单编号
 * @param privacyMode 是否开启隐私模式
 * @returns 处理后的订单编号
 */
export function maskOrderNumber(orderNumber: string, privacyMode: boolean): string {
  if (!privacyMode) {
    return orderNumber;
  }
  
  // 保留前两位和后两位，中间用星号替代
  if (orderNumber.length <= 4) {
    return '****';
  }
  
  const prefix = orderNumber.substring(0, 2);
  const suffix = orderNumber.substring(orderNumber.length - 2);
  const middle = '*'.repeat(orderNumber.length - 4);
  
  return `${prefix}${middle}${suffix}`;
}

/**
 * 隐藏金额信息
 * @param amount 金额
 * @param privacyMode 是否开启隐私模式
 * @returns 处理后的金额
 */
export function maskAmount(amount: number, privacyMode: boolean): string {
  if (!privacyMode) {
    return String(amount);
  }
  
  return '******';
}

/**
 * 隐藏数量信息
 * @param quantity 数量
 * @param privacyMode 是否开启隐私模式
 * @returns 处理后的数量
 */
export function maskQuantity(quantity: number, privacyMode: boolean): string {
  if (!privacyMode) {
    return String(quantity);
  }
  
  return '**';
} 