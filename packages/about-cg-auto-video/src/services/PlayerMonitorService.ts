/**
 * 播放器监控服务
 * 专注于监控播放器控件的状态、进度和事件
 */

import { CONFIG, SELECTORS } from '../config/selectors';
import type { PlayerEventCallbacks, PlayerState } from '../types';
import { Logger } from '../utils/logger';
import { TimeUtils } from '../utils/timeUtils';

export class PlayerMonitorService {
  private observers: MutationObserver[] = [];
  private callbacks: PlayerEventCallbacks = {};
  private lastTime: string = '';
  private hasEnded: boolean = false;
  private boundTimeElement: HTMLElement | null = null;
  private checkInterval: number | null = null;

  /**
   * 设置事件回调
   */
  setCallbacks(callbacks: PlayerEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 开始监控播放器
   */
  start(): void {
    this.bindObservers();
    this.startContainerObserver();
    this.startPeriodicCheck();
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.cleanup();
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 强制重新绑定监听器
   */
  rebind(): void {
    this.boundTimeElement = null;
    this.bindObservers();
  }

  /**
   * 绑定监听器到播放器控件
   */
  private bindObservers(): void {
    const currentTimeEl = document.querySelector<HTMLElement>(SELECTORS.player.timeCurrent);
    const durationEl = document.querySelector<HTMLElement>(SELECTORS.player.timeDuration);
    const playPauseBtn = document.querySelector<HTMLElement>(SELECTORS.player.playPauseBtn);

    if (!currentTimeEl || !durationEl || this.boundTimeElement === currentTimeEl) {
      return;
    }

    this.cleanup();
    this.boundTimeElement = currentTimeEl;
    this.hasEnded = false;
    this.lastTime = '';

    // 监听时间文本变化
    const timeObserver = new MutationObserver(() => this.handleTimeUpdate(currentTimeEl, durationEl));
    timeObserver.observe(currentTimeEl, { childList: true, characterData: true, subtree: true });
    this.observers.push(timeObserver);

    // 监听播放/暂停按钮状态变化
    if (playPauseBtn) {
      const btnObserver = new MutationObserver(() => this.handleStateChange(playPauseBtn));
      btnObserver.observe(playPauseBtn, { attributes: true, attributeFilter: ['class'] });
      this.observers.push(btnObserver);
    }
  }

  /**
   * 处理时间更新
   */
  private handleTimeUpdate(currentTimeEl: HTMLElement, durationEl: HTMLElement): void {
    const currentTime = currentTimeEl.textContent?.trim() || '00:00';
    const duration = durationEl.textContent?.trim() || '00:00';

    if (currentTime === this.lastTime) return;
    this.lastTime = currentTime;

    const currentSeconds = TimeUtils.parseTimeToSeconds(currentTime);
    const durationSeconds = TimeUtils.parseTimeToSeconds(duration);
    const percentage = parseFloat(TimeUtils.calculatePercentage(currentSeconds, durationSeconds));

    Logger.info(`播放时间: ${currentTime} / ${duration} (${percentage.toFixed(2)}%)`);
    this.callbacks.onTimeUpdate?.(currentTime, duration, percentage);

    // 检查是否播放完成
    if (!this.hasEnded && durationSeconds > 0 && TimeUtils.isTimeClose(currentSeconds, durationSeconds, CONFIG.playEnd.tolerance)) {
      this.hasEnded = true;
      Logger.special('🎉', '视频播放完成！');
      this.callbacks.onPlayEnd?.();
    }

    // 重置完成标志
    if (this.hasEnded && currentSeconds < durationSeconds - CONFIG.playEnd.resetThreshold) {
      this.hasEnded = false;
    }
  }

  /**
   * 处理播放器状态变化
   */
  private handleStateChange(playPauseBtn: HTMLElement): void {
    if (playPauseBtn.classList.contains(SELECTORS.player.playBtnClass)) {
      Logger.info('视频已暂停');
      this.callbacks.onStateChange?.('paused' as PlayerState);
    } else if (playPauseBtn.classList.contains(SELECTORS.player.pauseBtnClass)) {
      this.callbacks.onStateChange?.('playing' as PlayerState);
    }
  }

  /**
   * 启动容器监听器
   */
  private startContainerObserver(): void {
    const playerContainer = document.querySelector(SELECTORS.player.container);
    if (!playerContainer) return;

    const containerObserver = new MutationObserver(() => {
      const currentTimeEl = document.querySelector<HTMLElement>(SELECTORS.player.timeCurrent);
      if (currentTimeEl && this.boundTimeElement !== currentTimeEl) {
        this.bindObservers();
      }
    });

    containerObserver.observe(playerContainer, { childList: true, subtree: true });
    this.observers.push(containerObserver);
  }

  /**
   * 启动定时检查
   */
  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(() => {
      const currentTimeEl = document.querySelector(SELECTORS.player.timeCurrent);
      if (currentTimeEl && !this.boundTimeElement) {
        this.bindObservers();
      }
    }, CONFIG.monitor.rebindInterval) as unknown as number;
  }

  /**
   * 清理所有监听器
   */
  private cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.boundTimeElement = null;
  }
}

