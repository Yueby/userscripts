import { TextReplacer } from '../core/TextReplacer';
import { fancyCharMap } from '../data/fancyCharMap';
import type { ReplacerConfig } from '../types';
import { Logger } from '../utils/logger';

export class FancyTextReplacer extends TextReplacer {
  constructor(config?: ReplacerConfig) {
    super(fancyCharMap, config);
  }

  replaceInDocument(): number {
    Logger.info('开始替换花体字符...');
    const count = super.replaceInDocument();
    if (count === 0) {
      Logger.info('未发现需要替换的花体字符');
    } else {
      Logger.success(`替换完成！共替换 ${count} 个字符`);
    }
    return count;
  }

  static create(config?: ReplacerConfig): FancyTextReplacer {
    return new FancyTextReplacer(config);
  }
}

