const PREFIX = '[Character Replace]';

export class Logger {
  static info(message: string, ...args: unknown[]): void {
    console.log(`${PREFIX} ${message}`, ...args);
  }

  static warn(message: string, ...args: unknown[]): void {
    console.warn(`${PREFIX} ${message}`, ...args);
  }

  static error(message: string, ...args: unknown[]): void {
    console.error(`${PREFIX} ${message}`, ...args);
  }

  static success(message: string, ...args: unknown[]): void {
    console.log(`${PREFIX} ✓ ${message}`, ...args);
  }
}

