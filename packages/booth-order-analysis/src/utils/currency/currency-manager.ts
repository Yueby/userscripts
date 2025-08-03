import type { Currency } from '../../types/settings';

// 汇率缓存
let exchangeRates: Partial<Record<Currency, number>> = {};
let lastUpdateTime: number = 0;
let updateTime: string | null = null;

// 汇率API接口
interface RatesResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

/**
 * 货币管理器
 * 整合货币转换、格式化和汇率API功能
 */
export class CurrencyManager {
  /**
   * 从JPY转换到目标货币
   */
  static async convertFromJPY(jpyAmount: number, targetCurrency: Currency): Promise<number> {
    if (targetCurrency === 'JPY') {
      return jpyAmount;
    }

    const rate = await this.getExchangeRate(targetCurrency);
    if (!rate) {
      throw new Error(`无法获取 ${targetCurrency} 的汇率`);
    }

    return jpyAmount * rate;
  }

  /**
   * 同步转换（使用缓存汇率）
   */
  static convertFromJPYSync(jpyAmount: number, targetCurrency: Currency): number {
    if (targetCurrency === 'JPY') {
      return jpyAmount;
    }

    const rate = this.getExchangeRateSync(targetCurrency);
    if (!rate) {
      throw new Error(`无法获取 ${targetCurrency} 的汇率`);
    }

    return jpyAmount * rate;
  }

  /**
   * 格式化货币显示
   */
  static formatCurrency(amount: number, currencyType: Currency): string {
    const formatters: Record<Currency, Intl.NumberFormat> = {
      JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
      CNY: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
      KRW: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }),
      HKD: new Intl.NumberFormat('zh-HK', { style: 'currency', currency: 'HKD' }),
      TWD: new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' })
    };

    return formatters[currencyType].format(amount);
  }

  /**
   * 格式化货币显示（带货币代码）
   */
  static formatCurrencyWithCode(amount: number, currencyType: Currency): string {
    const symbol = this.getCurrencySymbol(currencyType);
    return `${symbol}${amount.toLocaleString()}`;
  }

  /**
   * 获取货币符号
   */
  static getCurrencySymbol(currency: Currency): string {
    const symbols: Record<Currency, string> = {
      JPY: '¥',
      CNY: '¥',
      USD: '$',
      EUR: '€',
      GBP: '£',
      KRW: '₩',
      HKD: 'HK$',
      TWD: 'NT$'
    };
    return symbols[currency];
  }

  /**
   * 格式化JPY显示
   */
  static formatJPY(price: number): string {
    return `¥${price.toLocaleString()}`;
  }

  /**
   * 格式化转换后的货币显示
   */
  static formatConverted(price: number, targetCurrency: Currency): string | null {
    if (targetCurrency === 'JPY') {
      return null;
    }

    try {
      const converted = this.convertFromJPYSync(price, targetCurrency);
      return this.formatCurrencyWithCode(converted, targetCurrency);
    } catch {
      return null;
    }
  }

  /**
   * 更新汇率缓存
   */
  static updateExchangeRates(rates: Partial<Record<Currency, number>>): void {
    exchangeRates = { ...exchangeRates, ...rates };
    lastUpdateTime = Date.now();
  }

  /**
   * 获取缓存的汇率
   */
  static getExchangeRateSync(targetCurrency: Currency): number | null {
    return exchangeRates[targetCurrency] || null;
  }

  /**
   * 获取汇率（异步）
   */
  static async getExchangeRate(targetCurrency: Currency): Promise<number> {
    // 检查缓存是否有效（1小时）
    const cacheAge = Date.now() - lastUpdateTime;
    if (cacheAge < 60 * 60 * 1000 && exchangeRates[targetCurrency]) {
      return exchangeRates[targetCurrency]!;
    }

    // 从API获取最新汇率
    const rates = await this.fetchExchangeRates();
    this.updateExchangeRates(rates);
    
    return rates[targetCurrency] || 0;
  }

  /**
   * 初始化汇率
   */
  static async initializeRates(): Promise<void> {
    try {
      const rates = await this.fetchExchangeRates();
      this.updateExchangeRates(rates);
    } catch (error) {
      console.error('初始化汇率失败:', error);
    }
  }

  /**
   * 从API获取汇率
   */
  private static async fetchExchangeRates(): Promise<Record<Currency, number>> {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
      const data: RatesResponse = await response.json();

      if (!data.rates) {
        throw new Error('无效的汇率响应');
      }

      const rates: Record<Currency, number> = {
        JPY: 1, // 基准货币
        CNY: data.rates.CNY || 0,
        USD: data.rates.USD || 0,
        EUR: data.rates.EUR || 0,
        GBP: data.rates.GBP || 0,
        KRW: data.rates.KRW || 0,
        HKD: data.rates.HKD || 0,
        TWD: data.rates.TWD || 0
      };

      updateTime = data.date;
      return rates;
    } catch (error) {
      console.error('获取汇率失败:', error);
      // 返回默认汇率
      return {
        JPY: 1,
        CNY: 0.048,
        USD: 0.0067,
        EUR: 0.0062,
        GBP: 0.0053,
        KRW: 8.5,
        HKD: 0.052,
        TWD: 0.21
      };
    }
  }

  /**
   * 获取缓存状态
   */
  static getCacheStatus(): {
    hasCache: boolean;
    age: number;
    isValid: boolean;
    updateTime: string | null;
  } {
    const age = Date.now() - lastUpdateTime;
    const isValid = age < 60 * 60 * 1000; // 1小时有效期

    return {
      hasCache: Object.keys(exchangeRates).length > 0,
      age,
      isValid,
      updateTime
    };
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    exchangeRates = {};
    lastUpdateTime = 0;
    updateTime = null;
  }
}

 