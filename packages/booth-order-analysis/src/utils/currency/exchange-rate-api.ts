import type { Currency } from '../../types/settings';
import { logger } from '../core/logger';

// 汇率API配置
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/JPY';
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

interface RatesResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

class ExchangeRateAPI {
  private static cache: {
    rates: Record<Currency, number> | null;
    timestamp: number;
    updateTime: string | null;
  } = {
    rates: null,
    timestamp: 0,
    updateTime: null
  };

  /**
   * 获取实时汇率
   * @returns 汇率数据
   */
  static async getExchangeRates(): Promise<Record<Currency, number>> {
    // 检查缓存是否有效
    const now = Date.now();
    if (this.cache.rates && (now - this.cache.timestamp) < CACHE_DURATION) {
      return this.cache.rates;
    }

    try {
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data: RatesResponse = await response.json();
      
      // 转换汇率数据格式
      const rates: Record<Currency, number> = {
        JPY: 1, // 基准货币
        CNY: data.rates.CNY || 0.048,
        USD: data.rates.USD || 0.0067,
        EUR: data.rates.EUR || 0.0062,
        GBP: data.rates.GBP || 0.0053,
        KRW: data.rates.KRW || 8.9,
        HKD: data.rates.HKD || 0.052,
        TWD: data.rates.TWD || 0.21
      };

      // 更新缓存
      this.cache.rates = rates;
      this.cache.timestamp = now;
      this.cache.updateTime = new Date().toLocaleString('zh-CN');

      return rates;

    } catch (error) {
      logger.warn('实时汇率获取失败，使用默认汇率');
      
      // 返回默认汇率
      return {
        JPY: 1,
        CNY: 0.048,
        USD: 0.0067,
        EUR: 0.0062,
        GBP: 0.0053,
        KRW: 8.9,
        HKD: 0.052,
        TWD: 0.21
      };
    }
  }

  /**
   * 获取特定货币的汇率
   * @param targetCurrency 目标货币
   * @returns 汇率值
   */
  static async getExchangeRate(targetCurrency: Currency): Promise<number> {
    const rates = await this.getExchangeRates();
    return rates[targetCurrency] || 1;
  }

  /**
   * 清除缓存，强制重新获取汇率
   */
  static clearCache(): void {
    this.cache.rates = null;
    this.cache.timestamp = 0;
  }

  /**
   * 检查缓存状态
   */
  static getCacheStatus(): {
    hasCache: boolean;
    age: number;
    isValid: boolean;
    updateTime: string | null;
  } {
    const now = Date.now();
    const age = now - this.cache.timestamp;
    const isValid = age < CACHE_DURATION;

    return {
      hasCache: this.cache.rates !== null,
      age: Math.floor(age / 1000), // 秒
      isValid,
      updateTime: this.cache.updateTime
    };
  }
}

export { ExchangeRateAPI }; 