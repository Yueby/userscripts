/**
 * 课程观察服务
 * 负责监听课程目录的变化，并通知回调
 */

import { SELECTORS } from '../config/selectors';
import { CourseDataProvider } from '../providers/CourseDataProvider';
import type { Lesson } from '../types';

export interface CourseObserverCallbacks {
  onLessonChange?: (newLesson: Lesson, oldLesson?: Lesson) => void;
}

export class CourseObserverService {
  private observer: MutationObserver | null = null;
  private callbacks: CourseObserverCallbacks = {};
  private courseDataProvider: CourseDataProvider;
  private currentPlayingLesson: Lesson | null = null;

  constructor(courseDataProvider: CourseDataProvider) {
    this.courseDataProvider = courseDataProvider;
  }

  /**
   * 设置回调
   */
  setCallbacks(callbacks: CourseObserverCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 开始监听课程目录
   */
  start(): void {
    const courseMenu = document.querySelector(SELECTORS.course.menu);
    if (!courseMenu) return;

    this.currentPlayingLesson = this.findCurrentPlayingLesson(this.courseDataProvider.parse());

    this.observer = new MutationObserver(() => this.handleCourseMenuChange());
    this.observer.observe(courseMenu, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  /**
   * 停止监听
   */
  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  /**
   * 处理课程目录变化
   */
  private handleCourseMenuChange(): void {
    const newPlayingLesson = this.findCurrentPlayingLesson(this.courseDataProvider.parse(true));

    if (newPlayingLesson && newPlayingLesson.element !== this.currentPlayingLesson?.element) {
      const oldLesson = this.currentPlayingLesson;
      this.currentPlayingLesson = newPlayingLesson;
      this.callbacks.onLessonChange?.(newPlayingLesson, oldLesson || undefined);
    }
  }

  /**
   * 从课程数据中找到当前正在播放的小节
   */
  private findCurrentPlayingLesson(courseData: { chapters: { lessons: Lesson[] }[] }): Lesson | null {
    for (const chapter of courseData.chapters) {
      const playing = chapter.lessons.find(lesson => lesson.isPlaying);
      if (playing) return playing;
    }
    return null;
  }

  /**
   * 获取当前播放的小节
   */
  getCurrentLesson(): Lesson | null {
    return this.currentPlayingLesson;
  }
}

