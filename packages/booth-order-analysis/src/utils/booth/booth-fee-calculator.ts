/**
 * Booth平台手续费计算器
 */

// 手续费计算基准时间
const FEE_CHANGE_DATE = new Date('2025-10-28T13:00:00+09:00'); // 日本时间

// 手续费率
const FEE_RATE = 0.056; // 5.6%

// 手续费固定金额
const FEE_FIXED_AMOUNT_BEFORE = 22; // 改定前
const FEE_FIXED_AMOUNT_AFTER = 45; // 改定后

/**
 * 计算Booth平台手续费
 * @param price 商品价格（日元）
 * @param orderDateStr 订单日期字符串 (格式: "2025-08-02 16:57:21")
 * @returns 手续费金额
 */
export function calculateBoothFee(price: number, orderDateStr: string): number {
  // 直接解析日期字符串
  const orderDate = new Date(orderDateStr + '+09:00'); // 明确指定为JST时间
  const isAfterChange = orderDate >= FEE_CHANGE_DATE;
  const fixedAmount = isAfterChange ? FEE_FIXED_AMOUNT_AFTER : FEE_FIXED_AMOUNT_BEFORE;

  // 手续费 = 商品价格 × 5.6% + 固定金额
  const fee = Math.ceil(price * FEE_RATE) + fixedAmount;

  return fee;
}

/**
 * 计算到手金额
 * @param price 商品价格（日元）
 * @param orderDateStr 订单日期字符串 (格式: "2025-08-02 16:57:21")
 * @returns 到手金额
 */
export function calculateNetAmount(price: number, orderDateStr: string): number {
  const fee = calculateBoothFee(price, orderDateStr);
  return price - fee;
}

/**
 * 格式化手续费显示
 * @param price 商品价格（日元）
 * @param orderDateStr 订单日期字符串
 * @returns 格式化的手续费字符串
 */
export function formatBoothFee(price: number, orderDateStr: string): string {
  const fee = calculateBoothFee(price, orderDateStr);
  return `¥${fee.toLocaleString()}`;
}

/**
 * 格式化到手金额显示
 * @param price 商品价格（日元）
 * @param orderDateStr 订单日期字符串
 * @returns 格式化的到手金额字符串
 */
export function formatNetAmount(price: number, orderDateStr: string): string {
  const netAmount = calculateNetAmount(price, orderDateStr);
  return `¥${netAmount.toLocaleString()}`;
}

/**
 * 获取手续费说明
 * @param orderDateStr 订单日期字符串
 * @returns 手续费说明文本
 */
export function getFeeDescription(orderDateStr: string): string {
  const orderDate = new Date(orderDateStr + '+09:00');
  const isAfterChange = orderDate >= FEE_CHANGE_DATE;
  const fixedAmount = isAfterChange ? FEE_FIXED_AMOUNT_AFTER : FEE_FIXED_AMOUNT_BEFORE;

  if (isAfterChange) {
    return `5.6% + ¥${fixedAmount} (2025年10月28日改定后)`;
  } else {
    return `5.6% + ¥${fixedAmount} (改定前)`;
  }
} 