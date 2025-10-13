/**
 * 日志工具类
 * 统一管理控制台输出，便于调试和日志追踪
 */

const PREFIX = '[AboutCG]';

export class Logger {
  /**
   * 普通信息日志
   */
  static info(message: string, ...args: any[]): void {
    console.log(`${PREFIX} ${message}`, ...args);
  }

  /**
   * 成功日志（带 ✅ 标记）
   */
  static success(message: string, ...args: any[]): void {
    console.log(`${PREFIX} ✅ ${message}`, ...args);
  }

  /**
   * 错误日志（带 ❌ 标记）
   */
  static error(message: string, ...args: any[]): void {
    console.error(`${PREFIX} ❌ ${message}`, ...args);
  }

  /**
   * 警告日志（带 ⚠️ 标记）
   */
  static warn(message: string, ...args: any[]): void {
    console.warn(`${PREFIX} ⚠️ ${message}`, ...args);
  }

  /**
   * 调试日志
   */
  static debug(message: string, ...args: any[]): void {
    console.debug(`${PREFIX} 🔍 ${message}`, ...args);
  }

  /**
   * 特殊标记日志（带自定义 emoji）
   */
  static special(emoji: string, message: string, ...args: any[]): void {
    console.log(`${PREFIX} ${emoji} ${message}`, ...args);
  }
}

