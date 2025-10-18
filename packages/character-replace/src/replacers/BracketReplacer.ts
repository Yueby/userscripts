import { TextReplacer } from '../core/TextReplacer';
import { bracketMap } from '../data/maps/bracketMap';
import type { ReplacerConfig } from '../types';
import { Logger } from '../utils/logger';

export class BracketReplacer extends TextReplacer {
  constructor(config?: ReplacerConfig) {
    super(bracketMap, config);
  }

  replaceInDocument(): number {
    Logger.info('开始替换中日文括号...');
    const count = super.replaceInDocument();
    if (count === 0) {
      Logger.info('未发现需要替换的括号');
    } else {
      Logger.success(`替换完成！共替换 ${count} 个括号`);
    }
    return count;
  }

  static create(config?: ReplacerConfig): BracketReplacer {
    return new BracketReplacer(config);
  }
}

