// 日志级别
export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

// 日志配置
export interface LoggerConfig {
	level: LogLevel;
	enableTimestamp: boolean;
	enablePrefix: boolean;
	prefix: string;
}

// 默认配置
const DEFAULT_CONFIG: LoggerConfig = {
	level: LogLevel.INFO,
	enableTimestamp: true,
	enablePrefix: true,
	prefix: '[Booth Analysis]'
};

// Logger类
export class Logger {
	private static instance: Logger;
	private config: LoggerConfig;

	private constructor() {
		this.config = { ...DEFAULT_CONFIG };
	}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	/**
	 * 设置日志级别
	 */
	setLevel(level: LogLevel): void {
		this.config.level = level;
	}

	/**
	 * 设置配置
	 */
	setConfig(config: Partial<LoggerConfig>): void {
		this.config = { ...this.config, ...config };
	}

	/**
	 * 获取当前时间戳
	 */
	private getTimestamp(): string {
		if (!this.config.enableTimestamp) return '';
		return new Date().toLocaleString('zh-CN');
	}

	/**
	 * 格式化日志消息
	 */
	private formatMessage(level: string, message: string, ...args: any[]): string {
		const parts: string[] = [];

		if (this.config.enableTimestamp) {
			parts.push(`[${this.getTimestamp()}]`);
		}

		if (this.config.enablePrefix) {
			parts.push(this.config.prefix);
		}

		parts.push(`[${level}]`);
		parts.push(message);

		return parts.join(' ');
	}

	/**
	 * 输出日志
	 */
	private log(level: LogLevel, levelName: string, message: string, ...args: any[]): void {
		if (level < this.config.level) return;

		const formattedMessage = this.formatMessage(levelName, message);

		switch (level) {
			case LogLevel.DEBUG:
				console.debug(formattedMessage, ...args);
				break;
			case LogLevel.INFO:
				console.info(formattedMessage, ...args);
				break;
			case LogLevel.WARN:
				console.warn(formattedMessage, ...args);
				break;
			case LogLevel.ERROR:
				console.error(formattedMessage, ...args);
				break;
		}
	}

	/**
	 * Info日志
	 */
	info(message: string, ...args: any[]): void {
		this.log(LogLevel.INFO, 'INFO', message, ...args);
	}

	/**
	 * Warn日志
	 */
	warn(message: string, ...args: any[]): void {
		this.log(LogLevel.WARN, 'WARN', message, ...args);
	}

	/**
	 * Error日志
	 */
	error(message: string, ...args: any[]): void {
		this.log(LogLevel.ERROR, 'ERROR', message, ...args);
	}
}

// 导出默认Logger实例
export const logger = Logger.getInstance();
