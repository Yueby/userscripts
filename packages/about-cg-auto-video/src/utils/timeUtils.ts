/**
 * 时间处理工具类
 */

export class TimeUtils {
  /**
   * 将时间字符串转换为秒数
   * @param timeStr 时间字符串，格式：HH:MM:SS 或 MM:SS
   * @returns 总秒数
   * @example
   * parseTimeToSeconds('01:23:45') // 5025
   * parseTimeToSeconds('23:45') // 1425
   */
  static parseTimeToSeconds(timeStr: string): number {
    const parts = timeStr.split(':').map(Number);
    
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }
    
    return 0;
  }

  /**
   * 将秒数格式化为时间字符串
   * @param seconds 秒数
   * @returns 格式化的时间字符串
   * @example
   * formatSeconds(5025) // '01:23:45'
   * formatSeconds(1425) // '23:45'
   */
  static formatSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  }

  /**
   * 计算播放进度百分比
   * @param current 当前时间（秒）
   * @param total 总时长（秒）
   * @returns 百分比（保留两位小数）
   */
  static calculatePercentage(current: number, total: number): string {
    if (total <= 0) return '0.00';
    return ((current / total) * 100).toFixed(2);
  }

  /**
   * 检查两个时间是否接近（在误差范围内）
   * @param time1 时间1（秒）
   * @param time2 时间2（秒）
   * @param tolerance 误差范围（秒）
   * @returns 是否接近
   */
  static isTimeClose(time1: number, time2: number, tolerance: number): boolean {
    return Math.abs(time1 - time2) <= tolerance;
  }
}

