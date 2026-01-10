import type { DiscountConfig, PriceConfig, VariationData } from '../config-types';

// 计算单个价格的折后价
export function applyDiscount(
  originalPrice: number,
  discount: DiscountConfig
): number {
  if (!discount.enabled || discount.discountPercent === 0) {
    return originalPrice;
  }
  return Math.round(originalPrice * (1 - discount.discountPercent / 100));
}

// 计算所有 Variation 的价格
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
