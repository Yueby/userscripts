import { formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';
import { logger } from './core/logger';

// 时区转换器
export class TimezoneConverter {
  /**
   * 将JST时间转换为目标时区
   */
  static convertJSTToTargetTimezone(jstDateTime: string, targetTimezone: string): string {
    try {
      // 先解析JST时间，明确指定为JST时区
      const jstDate = parseISO(jstDateTime + '+09:00');
      
      if (!isValid(jstDate)) {
        logger.error('无效的JST时间格式:', jstDateTime);
        return jstDateTime;
      }

      // 使用date-fns-tz进行时区转换，从JST转换到目标时区
      const result = formatInTimeZone(jstDate, targetTimezone, 'yyyy-MM-dd HH:mm:ss');
      
      logger.timezone(`时区转换: ${jstDateTime} -> ${result} (目标时区: ${targetTimezone})`);
      return result;
    } catch (error) {
      logger.error('时区转换失败:', error);
      return jstDateTime; // 转换失败时返回原时间
    }
  }

  /**
   * 获取当前JST日期字符串
   */
  static getCurrentJSTDate(): string {
    const now = new Date();
    return formatInTimeZone(now, 'Asia/Tokyo', 'yyyy-MM-dd');
  }

  /**
   * 获取指定偏移天数的JST日期字符串
   */
  static getJSTDateWithOffset(offsetDays: number): string {
    const now = new Date();
    const targetDate = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return formatInTimeZone(targetDate, 'Asia/Tokyo', 'yyyy-MM-dd');
  }

  /**
   * 获取当前JST年月字符串
   */
  static getCurrentJSTMonth(): string {
    const now = new Date();
    return formatInTimeZone(now, 'Asia/Tokyo', 'yyyy-MM');
  }

  /**
   * 获取指定偏移月数的JST年月字符串
   */
  static getJSTMonthWithOffset(offsetMonths: number): string {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
    return formatInTimeZone(targetDate, 'Asia/Tokyo', 'yyyy-MM');
  }

  /**
   * 获取本周JST时间范围
   */
  static getThisWeekJSTRange(): { start: string; end: string } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today.getTime() - mondayOffset * 24 * 60 * 60 * 1000);
    const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      start: formatInTimeZone(monday, 'Asia/Tokyo', 'yyyy-MM-dd'),
      end: formatInTimeZone(sunday, 'Asia/Tokyo', 'yyyy-MM-dd')
    };
  }

  /**
   * 获取上周JST时间范围
   */
  static getLastWeekJSTRange(): { start: string; end: string } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisMonday = new Date(today.getTime() - mondayOffset * 24 * 60 * 60 * 1000);
    const lastMonday = new Date(thisMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastSunday = new Date(lastMonday.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      start: formatInTimeZone(lastMonday, 'Asia/Tokyo', 'yyyy-MM-dd'),
      end: formatInTimeZone(lastSunday, 'Asia/Tokyo', 'yyyy-MM-dd')
    };
  }

  /**
   * 解析订单日期字符串
   */
  static parseOrderDate(orderDateStr: string): string {
    try {
      // 解析订单时间格式: "2025-08-02 16:57:21"
      return orderDateStr.split(' ')[0]; // 提取日期部分 "2025-08-02"
    } catch {
      return '';
    }
  }
} 