/**
 * 课程数据提供者
 * 负责解析和提供课程目录数据
 */

import { SELECTORS } from '../config/selectors';
import type { Chapter, CourseData, Lesson, LessonPosition } from '../types';
import { DOMUtils } from '../utils/domUtils';
import { Logger } from '../utils/logger';

export class CourseDataProvider {
  private cachedCourseData: CourseData | null = null;

  /**
   * 解析课程目录
   * @param forceRefresh 是否强制刷新缓存
   */
  parse(forceRefresh: boolean = false): CourseData {
    if (this.cachedCourseData && !forceRefresh) {
      return this.cachedCourseData;
    }
    
    const chapters: Chapter[] = [];
    let currentLesson: CourseData['currentLesson'];

    const chapterElements = document.querySelectorAll<HTMLElement>(
      SELECTORS.course.chapterSection
    );

    chapterElements.forEach((chapterEl) => {
      const chapterIndex = parseInt(
        DOMUtils.queryText(chapterEl, SELECTORS.course.chapterIndex) || '0'
      );
      const chapterName = DOMUtils.queryText(chapterEl, SELECTORS.course.chapterTitle);
      const chapterDuration = DOMUtils.queryText(chapterEl, SELECTORS.course.chapterDuration);

      if (!chapterName) return;

      const lessons: Lesson[] = [];
      const lessonElements = chapterEl.querySelectorAll<HTMLElement>(
        SELECTORS.course.lessonNode
      );

      lessonElements.forEach((lessonEl, lessonIdx) => {
        const lessonName = DOMUtils.queryText(lessonEl, SELECTORS.course.lessonName);
        const lessonDuration = DOMUtils.queryText(lessonEl, SELECTORS.course.lessonDuration);
        const playingEl = lessonEl.querySelector(SELECTORS.course.playingIndicator);
        const isPlaying = DOMUtils.getTextContent(playingEl).includes('正在播放');

        if (!lessonName) return;

        if (isPlaying) {
          currentLesson = {
            chapterIndex,
            lessonIndex: lessonIdx,
            lessonName,
          };
        }

        lessons.push({
          name: lessonName,
          duration: lessonDuration,
          isPlaying,
          index: lessonIdx,
          element: lessonEl,
        });
      });

      chapters.push({
        index: chapterIndex,
        name: chapterName,
        duration: chapterDuration,
        lessons,
      });
    });

    this.cachedCourseData = { chapters, currentLesson };
    return this.cachedCourseData;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedCourseData = null;
  }

  /**
   * 获取当前小节的位置信息（包括前后小节）
   */
  getCurrentPosition(courseData: CourseData): LessonPosition | null {
    if (!courseData.currentLesson) return null;

    const { chapterIndex, lessonIndex } = courseData.currentLesson;

    const currentChapterIdx = courseData.chapters.findIndex(
      (ch) => ch.index === chapterIndex
    );
    if (currentChapterIdx === -1) return null;

    const currentChapter = courseData.chapters[currentChapterIdx];
    const currentLesson = currentChapter.lessons[lessonIndex];

    if (!currentLesson) return null;

    const result: LessonPosition = {
      current: {
        chapter: currentChapter,
        lesson: currentLesson,
        chapterIndex: currentChapterIdx,
        lessonIndex,
      },
    };

    // 查找前一个小节
    if (lessonIndex > 0) {
      result.previous = {
        chapter: currentChapter,
        lesson: currentChapter.lessons[lessonIndex - 1],
        chapterIndex: currentChapterIdx,
        lessonIndex: lessonIndex - 1,
      };
    } else if (currentChapterIdx > 0) {
      const prevChapter = courseData.chapters[currentChapterIdx - 1];
      const prevLessonIdx = prevChapter.lessons.length - 1;
      if (prevLessonIdx >= 0) {
        result.previous = {
          chapter: prevChapter,
          lesson: prevChapter.lessons[prevLessonIdx],
          chapterIndex: currentChapterIdx - 1,
          lessonIndex: prevLessonIdx,
        };
      }
    }

    // 查找下一个小节
    if (lessonIndex < currentChapter.lessons.length - 1) {
      result.next = {
        chapter: currentChapter,
        lesson: currentChapter.lessons[lessonIndex + 1],
        chapterIndex: currentChapterIdx,
        lessonIndex: lessonIndex + 1,
      };
    } else if (currentChapterIdx < courseData.chapters.length - 1) {
      const nextChapter = courseData.chapters[currentChapterIdx + 1];
      if (nextChapter.lessons.length > 0) {
        result.next = {
          chapter: nextChapter,
          lesson: nextChapter.lessons[0],
          chapterIndex: currentChapterIdx + 1,
          lessonIndex: 0,
        };
      }
    }

    return result;
  }

  /**
   * 获取下一个小节
   */
  getNextLesson(courseData: CourseData): Lesson | null {
    const position = this.getCurrentPosition(courseData);
    return position?.next?.lesson || null;
  }

  /**
   * 获取前一个小节
   */
  getPreviousLesson(courseData: CourseData): Lesson | null {
    const position = this.getCurrentPosition(courseData);
    return position?.previous?.lesson || null;
  }

  /**
   * 打印课程数据（用于调试）
   */
  logCourseData(courseData: CourseData): void {
    Logger.info('课程数据解析完成');
    Logger.info(`章节总数: ${courseData.chapters.length}`);

    courseData.chapters.forEach((chapter) => {
      Logger.info(`第${chapter.index}章: ${chapter.name} (${chapter.duration})`);
      Logger.info(`  - 小节数: ${chapter.lessons.length}`);
      chapter.lessons.forEach((lesson, idx) => {
        const playingMark = lesson.isPlaying ? '▶️ ' : '';
        Logger.info(`  ${idx + 1}. ${playingMark}${lesson.name} (${lesson.duration})`);
      });
    });

    if (courseData.currentLesson) {
      Logger.info(
        `当前播放: 第${courseData.currentLesson.chapterIndex}章 - ${courseData.currentLesson.lessonName}`
      );

      const position = this.getCurrentPosition(courseData);
      if (position) {
        Logger.info('小节定位信息:');
        Logger.info(
          `  当前: 第${position.current.chapter.index}章 第${position.current.lessonIndex + 1}节 - ${position.current.lesson.name}`
        );

        if (position.previous) {
          Logger.info(
            `  上一节: 第${position.previous.chapter.index}章 第${position.previous.lessonIndex + 1}节 - ${position.previous.lesson.name}`
          );
        } else {
          Logger.info('  上一节: 无（已是第一节）');
        }

        if (position.next) {
          Logger.info(
            `  下一节: 第${position.next.chapter.index}章 第${position.next.lessonIndex + 1}节 - ${position.next.lesson.name}`
          );
        } else {
          Logger.info('  下一节: 无（已是最后一节）');
        }
      }
    }
  }
}

