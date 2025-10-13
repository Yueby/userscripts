/**
 * CSS 选择器配置
 * 集中管理所有 DOM 选择器，便于维护和修改
 */

export const SELECTORS = {
  // 播放器相关选择器
  player: {
    container: '#players',
    cover: '.pv-cover',
    coverPlayBtn: '.pv-cover .pv-icon-btn-play',
    playPauseBtn: '.pv-playpause',
    timeCurrent: '.pv-time-current',
    timeDuration: '.pv-time-duration',
    // 播放按钮 class
    playBtnClass: 'pv-icon-btn-play',
    pauseBtnClass: 'pv-icon-btn-pause',
  },

  // 课程目录相关选择器
  course: {
    menu: '.cg-player-menu',
    chapterSection: '.cg-play-chapter-section',
    chapterIndex: '.cg-play-chapter-index',
    chapterTitle: '.cg-play-chapter-title .cg-player-text2',
    chapterDuration: '.cg-play-chapter-title .cg-player-text1',
    lessonNode: '.cg-play-node',
    lessonName: '.cg-player-text2',
    lessonDuration: '.cg-f-fe-c span',
    lessonClickable: '.cg-text-row1',
    playingIndicator: '.cg-textp',
  },
} as const;

/**
 * 配置常量
 */
export const CONFIG = {
  // 等待超时时间（毫秒）
  timeout: {
    element: 15000,
    playButton: 10000,
  },

  // 元素稳定性检查
  stability: {
    checks: 3, // 需要连续检测到同一元素的次数
  },

  // 自动播放延迟
  autoPlay: {
    afterEnd: 3000, // 播放完成后延迟（毫秒） - 等待3秒后自动切换下一节
    afterClick: 500, // 初始化后点击播放的延迟（毫秒）
    lessonChangeDelay: 2000, // 小节切换后延迟（毫秒） - 等待2秒后点击播放按钮
  },

  // 播放完成检测
  playEnd: {
    tolerance: 1, // 允许的时间误差（秒）
    resetThreshold: 5, // 时间回退多少秒后重置完成标志（秒）
  },

  // 监控检查间隔
  monitor: {
    rebindInterval: 3000, // 定时重新绑定检查间隔（毫秒）
  },
} as const;

