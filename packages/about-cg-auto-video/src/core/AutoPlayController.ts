/**
 * 自动播放控制器
 * 核心业务逻辑：协调课程解析、播放器监控和自动播放
 */

import { CONFIG, SELECTORS } from '../config/selectors';
import { CourseDataProvider } from '../providers/CourseDataProvider';
import { CourseObserverService } from '../services/CourseObserverService';
import { PlayButtonService } from '../services/PlayButtonService';
import { PlayerMonitorService } from '../services/PlayerMonitorService';
import type { Lesson } from '../types';
import { DOMUtils } from '../utils/domUtils';
import { Logger } from '../utils/logger';

export class AutoPlayController {
  private courseDataProvider: CourseDataProvider;
  private playerMonitor: PlayerMonitorService;
  private courseObserver: CourseObserverService;
  private playButtonService: PlayButtonService;

  constructor() {
    this.courseDataProvider = new CourseDataProvider();
    this.playerMonitor = new PlayerMonitorService();
    this.courseObserver = new CourseObserverService(this.courseDataProvider);
    this.playButtonService = new PlayButtonService();
  }

  /**
   * 初始化控制器
   */
  async initialize(): Promise<void> {
    Logger.info('AboutCG Auto Video 已加载');

    // 等待课程目录加载
    if (await DOMUtils.waitForElement(SELECTORS.course.menu)) {
      const courseData = this.courseDataProvider.parse();
      this.courseDataProvider.logCourseData(courseData);
    }

    // 等待播放器控件加载
    if (!await DOMUtils.waitForElement(SELECTORS.player.timeCurrent)) {
      Logger.error('播放器控件加载超时');
      return;
    }

    // 设置回调
    this.playerMonitor.setCallbacks({ onPlayEnd: () => this.handlePlayEnd() });
    this.courseObserver.setCallbacks({ onLessonChange: (newLesson, oldLesson) => this.handleLessonChange(newLesson, oldLesson) });
    this.courseObserver.start();

    // 等待播放按钮并开始播放
    if (!await DOMUtils.waitForElement(`${SELECTORS.player.coverPlayBtn}, ${SELECTORS.player.playPauseBtn}`, CONFIG.timeout.playButton)) {
      Logger.error('播放按钮加载超时');
      return;
    }

    setTimeout(() => this.startAutoPlay(), CONFIG.autoPlay.afterClick);
  }

  /**
   * 开始自动播放
   */
  private async startAutoPlay(): Promise<void> {
    this.playerMonitor.start();
    if (!this.playButtonService.isPlaying()) {
      await this.playButtonService.smartClick();
    }
  }

  /**
   * 处理播放完成事件
   */
  private handlePlayEnd(): void {
    setTimeout(() => this.playNextLesson(), CONFIG.autoPlay.afterEnd);
  }

  /**
   * 处理小节切换事件
   */
  private async handleLessonChange(newLesson: Lesson, oldLesson?: Lesson): Promise<void> {
    Logger.info(`小节切换: ${oldLesson?.name || '无'} -> ${newLesson.name}`);
    await new Promise((resolve) => setTimeout(resolve, CONFIG.autoPlay.lessonChangeDelay));
    this.playerMonitor.rebind();
    await this.playButtonService.smartClick();
  }

  /**
   * 播放下一节
   */
  private playNextLesson(): void {
    const position = this.courseDataProvider.getCurrentPosition(this.courseDataProvider.parse());
    
    if (!position?.next) {
      Logger.info('所有课程已播放完毕');
      return;
    }

    const { chapter, lessonIndex, lesson } = position.next;
    Logger.info(`播放下一节: 第${chapter.index}章 第${lessonIndex + 1}节 - ${lesson.name}`);

    const nameElement = lesson.element.querySelector<HTMLElement>(SELECTORS.course.lessonClickable);
    if (nameElement && DOMUtils.safeClick(nameElement)) {
      Logger.success(`已点击小节: ${lesson.name}`);
    } else {
      Logger.error('点击小节失败');
    }
  }
}

