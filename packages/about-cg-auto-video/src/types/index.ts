/**
 * 课程相关类型定义
 */

export interface Lesson {
  name: string;
  duration: string;
  isPlaying: boolean;
  index: number;
  element: HTMLElement;
}

export interface Chapter {
  index: number;
  name: string;
  duration: string;
  lessons: Lesson[];
}

export interface CourseData {
  chapters: Chapter[];
  currentLesson?: {
    chapterIndex: number;
    lessonIndex: number;
    lessonName: string;
  };
}

export interface LessonPosition {
  current: {
    chapter: Chapter;
    lesson: Lesson;
    chapterIndex: number;
    lessonIndex: number;
  };
  previous?: {
    chapter: Chapter;
    lesson: Lesson;
    chapterIndex: number;
    lessonIndex: number;
  };
  next?: {
    chapter: Chapter;
    lesson: Lesson;
    chapterIndex: number;
    lessonIndex: number;
  };
}

/**
 * 播放器状态
 */
export enum PlayerState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
}

/**
 * 播放器事件回调类型
 */
export interface PlayerEventCallbacks {
  onTimeUpdate?: (currentTime: string, duration: string, percentage: number) => void;
  onPlayEnd?: () => void;
  onStateChange?: (state: PlayerState) => void;
}

