import type { DiscountConfig, DiscountPeriod, PriceConfig, VariationData } from '../config-types';

/**
 * 获取当前生效的折扣时段
 * 优先匹配 now 在 [startDate, endDate] 范围内的时段
 * 如果没有匹配，兜底返回第一条（用于预览/默认价格计算）
 */
export function getActiveDiscount(config: DiscountConfig): DiscountPeriod | null {
  if (!config.enabled || config.periods.length === 0) return null;
  
  const now = Date.now();
  const active = config.periods.find(p => {
    const start = p.startDate ? new Date(p.startDate).getTime() : 0;
    const end = p.endDate ? new Date(p.endDate).getTime() : Infinity;
    return now >= start && now <= end;
  });
  
  return active || config.periods[0];
}

/**
 * 计算单个价格的折后价
 * @param originalPrice 原价
 * @param discountPercent 折扣百分比（0-100）
 */
export function applyDiscountPercent(
  originalPrice: number,
  discountPercent: number
): number {
  if (discountPercent === 0) return originalPrice;
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

/**
 * 根据 DiscountConfig 计算折后价（使用当前生效时段）
 */
export function applyDiscount(
  originalPrice: number,
  discount: DiscountConfig
): number {
  const period = getActiveDiscount(discount);
  if (!period) return originalPrice;
  return applyDiscountPercent(originalPrice, period.discountPercent);
}

// 计算所有 Variation 的价格（使用当前生效时段）
export function calculateVariationPrices(
  variations: VariationData[],
  pricing: PriceConfig,
  discount: DiscountConfig
): void {
  variations.forEach(variation => {
    const basePrice = variation.isFullset 
      ? pricing.fullsetPrice 
      : pricing.normalVariationPrice;
    variation.price = applyDiscount(basePrice, discount);
  });
}

// 计算建议的 Fullset 价格
export function suggestFullsetPrice(
  normalPrice: number,
  totalSupport: number,
  discount: DiscountConfig
): number {
  const baseFullsetPrice = normalPrice * totalSupport;
  return applyDiscount(baseFullsetPrice, discount);
}
