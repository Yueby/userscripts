import currency from 'currency.js';
import type { Currency } from '../../types/settings';
import { ExchangeRateAPI } from './exchange-rate-api';
import { logger } from '../core/logger';

// 默认汇率配置（作为备用）
const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  JPY: 1,        // 基准货币（日元）
  CNY: 0.048,    // 1 JPY = 0.048 CNY
  USD: 0.0067,   // 1 JPY = 0.0067 USD
  EUR: 0.0062,   // 1 JPY = 0.0062 EUR
  GBP: 0.0053,   // 1 JPY = 0.0053 GBP
  KRW: 8.9,      // 1 JPY = 8.9 KRW
  HKD: 0.052,    // 1 JPY = 0.052 HKD
  TWD: 0.21      // 1 JPY = 0.21 TWD
};

// 当前汇率缓存
let currentRates: Record<Currency, number> = { ...DEFAULT_EXCHANGE_RATES };

// 货币格式化配置
const CURRENCY_FORMATS: Record<Currency, any> = {
  JPY: { symbol: '¥', precision: 0 },
  CNY: { symbol: '¥', precision: 2 },
  USD: { symbol: '$', precision: 2 },
  EUR: { symbol: '€', precision: 2 },
  GBP: { symbol: '£', precision: 2 },
  KRW: { symbol: '₩', precision: 0 },
  HKD: { symbol: 'HK$', precision: 2 },
  TWD: { symbol: 'NT$', precision: 0 }
};

/**
 * 汇率转换器
 */
export class CurrencyConverter {
  /**
   * 将日元转换为目标货币
   * @param jpyAmount 日元金额
   * @param targetCurrency 目标货币
   * @returns 转换后的金额
   */
  static async convertFromJPY(jpyAmount: number, targetCurrency: Currency): Promise<number> {
    if (targetCurrency === 'JPY') {
      return jpyAmount;
    }
    
    // 尝试获取实时汇率
    try {
      const rates = await ExchangeRateAPI.getExchangeRates();
      const rate = rates[targetCurrency];
      if (rate) {
        currentRates = rates;
        return currency(jpyAmount).multiply(rate).value;
      }
    } catch (error) {
      logger.warn('实时汇率获取失败，使用缓存汇率');
      logger.exchange(`汇率转换错误: ${error}`);
    }
    
    // 使用缓存或默认汇率
    const rate = currentRates[targetCurrency];
    if (!rate) {
      logger.warn(`未找到 ${targetCurrency} 的汇率，使用默认值`);
      return jpyAmount;
    }
    
    return currency(jpyAmount).multiply(rate).value;
  }

  /**
   * 同步版本的货币转换（使用缓存汇率）
   */
  static convertFromJPYSync(jpyAmount: number, targetCurrency: Currency): number {
    if (targetCurrency === 'JPY') {
      return jpyAmount;
    }
    
    const rate = currentRates[targetCurrency];
    if (!rate) {
      logger.warn(`未找到 ${targetCurrency} 的汇率，使用默认值`);
      return jpyAmount;
    }
    
    return currency(jpyAmount).multiply(rate).value;
  }

  /**
   * 格式化货币显示
   * @param amount 金额
   * @param currency 货币类型
   * @returns 格式化后的货币字符串
   */
  static formatCurrency(amount: number, currencyType: Currency): string {
    const format = CURRENCY_FORMATS[currencyType];
    if (!format) {
      return `${amount.toFixed(2)}`;
    }
    
    return currency(amount, {
      symbol: format.symbol,
      precision: format.precision,
      separator: ',',
      decimal: '.'
    }).format();
  }

  /**
   * 格式化货币显示（带货币代码后缀）
   * @param amount 金额
   * @param currency 货币类型
   * @returns 格式化后的货币字符串（包含货币代码）
   */
  static formatCurrencyWithCode(amount: number, currencyType: Currency): string {
    const formatted = this.formatCurrency(amount, currencyType);
    return `${formatted} ${currencyType}`;
  }

  /**
   * 获取货币符号
   * @param currency 货币类型
   * @returns 货币符号
   */
  static getCurrencySymbol(currency: Currency): string {
    return CURRENCY_FORMATS[currency]?.symbol || currency;
  }

  /**
   * 更新汇率（用于从API获取实时汇率）
   * @param rates 新的汇率数据
   */
  static updateExchangeRates(rates: Partial<Record<Currency, number>>): void {
    Object.assign(currentRates, rates);
  }

  /**
   * 获取当前汇率
   * @param targetCurrency 目标货币
   * @returns 汇率值
   */
  static getExchangeRate(targetCurrency: Currency): number {
    return currentRates[targetCurrency] || 1;
  }

  /**
   * 初始化汇率（在应用启动时调用）
   */
  static async initializeRates(): Promise<void> {
    try {
      const rates = await ExchangeRateAPI.getExchangeRates();
      currentRates = rates;
    } catch (error) {
      logger.warn('汇率初始化失败，使用默认汇率');
      currentRates = { ...DEFAULT_EXCHANGE_RATES };
    }
  }
} 