/**
 * 日期格式化工具类
 * 提供日期时间格式化相关的工具函数
 */

import { formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';
import { logger } from './logger';
import type { UserSettings } from '../../types/settings';

/**
 * 将JST时间转换为目标时区
 */
export const convertJSTToTargetTimezone = (jstDateTime: string, targetTimezone: string): string => {
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
};

/**
 * 格式化原始日期时间字符串
 * @param dateString 日期时间字符串，格式为 'YYYY-MM-DD HH:mm'
 * @returns 格式化后的日期时间字符串，格式为 'MM/DD HH:mm'
 */
export const formatOriginalDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split(' ');
  if (parts.length !== 2) return dateString;
  const [datePart, timePart] = parts;
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  return `${month}/${day} ${hour}:${minute}`;
};

/**
 * 格式化转换后的日期时间字符串
 * @param dateString 原始日期时间字符串
 * @param userSettings 用户设置
 * @returns 格式化后的转换日期时间字符串，如果时区是东京则返回空字符串
 */
export const formatConvertedDateTime = (dateString: string, userSettings: UserSettings): string => {
  if (!dateString || !userSettings) return '';
  if (userSettings.timezone === 'Asia/Tokyo') return '';

  try {
    const convertedTime = convertJSTToTargetTimezone(dateString, userSettings.timezone);
    const [datePart, timePart] = convertedTime.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    return `${month}/${day} ${hour}:${minute} (${userSettings.displayName})`;
  } catch (error) {
    return '';
  }
};

/**
 * 格式化日期字符串
 * @param dateString 日期字符串，格式为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串，格式为 'MM/DD'
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}`;
};

/**
 * 格式化时间字符串
 * @param timeString 时间字符串，格式为 'HH:mm'
 * @returns 格式化后的时间字符串
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  return timeString;
};

/**
 * 获取相对时间描述
 * @param dateString 日期时间字符串
 * @returns 相对时间描述，如 '刚刚'、'5分钟前'、'1小时前' 等
 */
export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  const now = new Date();
  const target = new Date(dateString.replace(' ', 'T'));
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  
  return formatOriginalDateTime(dateString);
}; 