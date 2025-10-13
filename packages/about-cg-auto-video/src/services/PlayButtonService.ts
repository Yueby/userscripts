/**
 * 播放按钮服务
 * 负责处理各种播放按钮的点击逻辑
 */

import { CONFIG, SELECTORS } from '../config/selectors';
import { DOMUtils } from '../utils/domUtils';
import { Logger } from '../utils/logger';

export class PlayButtonService {
  /**
   * 智能点击播放按钮
   */
  async smartClick(): Promise<boolean> {
    // 等待并点击封面播放按钮
    const coverBtn = await DOMUtils.waitForElement<HTMLElement>(SELECTORS.player.coverPlayBtn, CONFIG.timeout.element);
    if (coverBtn && DOMUtils.isElementVisible(coverBtn)) {
      const freshBtn = document.querySelector<HTMLElement>(SELECTORS.player.coverPlayBtn);
      if (freshBtn && DOMUtils.safeClick(freshBtn)) {
        Logger.success('已点击封面播放按钮');
        return true;
      }
    }

    // 等待后尝试控制栏播放按钮
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const playBtn = document.querySelector<HTMLElement>(SELECTORS.player.playPauseBtn);
    
    if (playBtn?.classList.contains(SELECTORS.player.playBtnClass) && DOMUtils.safeClick(playBtn)) {
      Logger.success('已点击控制栏播放按钮');
      return true;
    }

    Logger.error('自动播放失败');
    return false;
  }

  /**
   * 检查是否正在播放
   */
  isPlaying(): boolean {
    const playPauseBtn = document.querySelector<HTMLElement>(
      SELECTORS.player.playPauseBtn
    );
    return playPauseBtn?.classList.contains(SELECTORS.player.pauseBtnClass) || false;
  }
}

