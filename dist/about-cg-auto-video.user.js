// ==UserScript==
// @name               AboutCG Auto Video
// @name:zh-CN         AboutCG 视频自动播放
// @namespace          yueby.aboutcg
// @version            0.1.0
// @author             Yueby
// @description        A userscript for auto-playing videos on AboutCG
// @description:zh-CN  AboutCG 网站视频自动播放脚本
// @icon               https://vitejs.dev/logo.svg
// @match              https://www.aboutcg.org/play*
// ==/UserScript==

(function () {
  'use strict';

  const SELECTORS = {
player: {
      container: "#players",
      coverPlayBtn: ".pv-cover .pv-icon-btn-play",
      playPauseBtn: ".pv-playpause",
      timeCurrent: ".pv-time-current",
      timeDuration: ".pv-time-duration",
playBtnClass: "pv-icon-btn-play",
      pauseBtnClass: "pv-icon-btn-pause"
    },
course: {
      menu: ".cg-player-menu",
      chapterSection: ".cg-play-chapter-section",
      chapterIndex: ".cg-play-chapter-index",
      chapterTitle: ".cg-play-chapter-title .cg-player-text2",
      chapterDuration: ".cg-play-chapter-title .cg-player-text1",
      lessonNode: ".cg-play-node",
      lessonName: ".cg-player-text2",
      lessonDuration: ".cg-f-fe-c span",
      lessonClickable: ".cg-text-row1",
      playingIndicator: ".cg-textp"
    }
  };
  const CONFIG = {
timeout: {
      element: 15e3,
      playButton: 1e4
    },
stability: {
      checks: 3
},
autoPlay: {
      afterEnd: 3e3,
afterClick: 500,
lessonChangeDelay: 2e3
},
playEnd: {
      tolerance: 1,
resetThreshold: 5
},
monitor: {
      rebindInterval: 3e3
}
  };
  class DOMUtils {
static async waitForElement(selector, timeout = CONFIG.timeout.element) {
      return new Promise((resolve) => {
        let foundElement = null;
        let stableCount = 0;
        const checkElement = () => {
          const element = document.querySelector(selector);
          if (element) {
            if (foundElement === element) {
              stableCount++;
              if (stableCount >= CONFIG.stability.checks) {
                observer.disconnect();
                clearTimeout(timeoutId);
                resolve(element);
              }
            } else {
              foundElement = element;
              stableCount = 1;
            }
          } else {
            foundElement = null;
            stableCount = 0;
          }
        };
        const observer = new MutationObserver(checkElement);
        observer.observe(document.body, { childList: true, subtree: true });
        const timeoutId = setTimeout(() => {
          observer.disconnect();
          resolve(foundElement);
        }, timeout);
        checkElement();
      });
    }
static isElementVisible(element) {
      return !!element && document.body.contains(element) && element.style.display !== "none";
    }
static safeClick(element) {
      if (!element || !this.isElementVisible(element)) return false;
      element.click();
      return true;
    }
static getTextContent(element) {
      return element?.textContent?.trim() || "";
    }
static queryText(parent, selector) {
      return this.getTextContent(parent.querySelector(selector));
    }
  }
  const PREFIX = "[AboutCG]";
  class Logger {
static info(message, ...args) {
      console.log(`${PREFIX} ${message}`, ...args);
    }
static success(message, ...args) {
      console.log(`${PREFIX} ✅ ${message}`, ...args);
    }
static error(message, ...args) {
      console.error(`${PREFIX} ❌ ${message}`, ...args);
    }
static warn(message, ...args) {
      console.warn(`${PREFIX} ⚠️ ${message}`, ...args);
    }
static debug(message, ...args) {
      console.debug(`${PREFIX} 🔍 ${message}`, ...args);
    }
static special(emoji, message, ...args) {
      console.log(`${PREFIX} ${emoji} ${message}`, ...args);
    }
  }
  class CourseDataProvider {
    cachedCourseData = null;
parse(forceRefresh = false) {
      if (this.cachedCourseData && !forceRefresh) {
        return this.cachedCourseData;
      }
      const chapters = [];
      let currentLesson;
      const chapterElements = document.querySelectorAll(
        SELECTORS.course.chapterSection
      );
      chapterElements.forEach((chapterEl) => {
        const chapterIndex = parseInt(
          DOMUtils.queryText(chapterEl, SELECTORS.course.chapterIndex) || "0"
        );
        const chapterName = DOMUtils.queryText(chapterEl, SELECTORS.course.chapterTitle);
        const chapterDuration = DOMUtils.queryText(chapterEl, SELECTORS.course.chapterDuration);
        if (!chapterName) return;
        const lessons = [];
        const lessonElements = chapterEl.querySelectorAll(
          SELECTORS.course.lessonNode
        );
        lessonElements.forEach((lessonEl, lessonIdx) => {
          const lessonName = DOMUtils.queryText(lessonEl, SELECTORS.course.lessonName);
          const lessonDuration = DOMUtils.queryText(lessonEl, SELECTORS.course.lessonDuration);
          const playingEl = lessonEl.querySelector(SELECTORS.course.playingIndicator);
          const isPlaying = DOMUtils.getTextContent(playingEl).includes("正在播放");
          if (!lessonName) return;
          if (isPlaying) {
            currentLesson = {
              chapterIndex,
              lessonIndex: lessonIdx,
              lessonName
            };
          }
          lessons.push({
            name: lessonName,
            duration: lessonDuration,
            isPlaying,
            index: lessonIdx,
            element: lessonEl
          });
        });
        chapters.push({
          index: chapterIndex,
          name: chapterName,
          duration: chapterDuration,
          lessons
        });
      });
      this.cachedCourseData = { chapters, currentLesson };
      return this.cachedCourseData;
    }
clearCache() {
      this.cachedCourseData = null;
    }
getCurrentPosition(courseData) {
      if (!courseData.currentLesson) return null;
      const { chapterIndex, lessonIndex } = courseData.currentLesson;
      const currentChapterIdx = courseData.chapters.findIndex(
        (ch) => ch.index === chapterIndex
      );
      if (currentChapterIdx === -1) return null;
      const currentChapter = courseData.chapters[currentChapterIdx];
      const currentLesson = currentChapter.lessons[lessonIndex];
      if (!currentLesson) return null;
      const result = {
        current: {
          chapter: currentChapter,
          lesson: currentLesson,
          chapterIndex: currentChapterIdx,
          lessonIndex
        }
      };
      if (lessonIndex > 0) {
        result.previous = {
          chapter: currentChapter,
          lesson: currentChapter.lessons[lessonIndex - 1],
          chapterIndex: currentChapterIdx,
          lessonIndex: lessonIndex - 1
        };
      } else if (currentChapterIdx > 0) {
        const prevChapter = courseData.chapters[currentChapterIdx - 1];
        const prevLessonIdx = prevChapter.lessons.length - 1;
        if (prevLessonIdx >= 0) {
          result.previous = {
            chapter: prevChapter,
            lesson: prevChapter.lessons[prevLessonIdx],
            chapterIndex: currentChapterIdx - 1,
            lessonIndex: prevLessonIdx
          };
        }
      }
      if (lessonIndex < currentChapter.lessons.length - 1) {
        result.next = {
          chapter: currentChapter,
          lesson: currentChapter.lessons[lessonIndex + 1],
          chapterIndex: currentChapterIdx,
          lessonIndex: lessonIndex + 1
        };
      } else if (currentChapterIdx < courseData.chapters.length - 1) {
        const nextChapter = courseData.chapters[currentChapterIdx + 1];
        if (nextChapter.lessons.length > 0) {
          result.next = {
            chapter: nextChapter,
            lesson: nextChapter.lessons[0],
            chapterIndex: currentChapterIdx + 1,
            lessonIndex: 0
          };
        }
      }
      return result;
    }
getNextLesson(courseData) {
      const position = this.getCurrentPosition(courseData);
      return position?.next?.lesson || null;
    }
getPreviousLesson(courseData) {
      const position = this.getCurrentPosition(courseData);
      return position?.previous?.lesson || null;
    }
logCourseData(courseData) {
      Logger.info("课程数据解析完成");
      Logger.info(`章节总数: ${courseData.chapters.length}`);
      courseData.chapters.forEach((chapter) => {
        Logger.info(`第${chapter.index}章: ${chapter.name} (${chapter.duration})`);
        Logger.info(`  - 小节数: ${chapter.lessons.length}`);
        chapter.lessons.forEach((lesson, idx) => {
          const playingMark = lesson.isPlaying ? "▶️ " : "";
          Logger.info(`  ${idx + 1}. ${playingMark}${lesson.name} (${lesson.duration})`);
        });
      });
      if (courseData.currentLesson) {
        Logger.info(
          `当前播放: 第${courseData.currentLesson.chapterIndex}章 - ${courseData.currentLesson.lessonName}`
        );
        const position = this.getCurrentPosition(courseData);
        if (position) {
          Logger.info("小节定位信息:");
          Logger.info(
            `  当前: 第${position.current.chapter.index}章 第${position.current.lessonIndex + 1}节 - ${position.current.lesson.name}`
          );
          if (position.previous) {
            Logger.info(
              `  上一节: 第${position.previous.chapter.index}章 第${position.previous.lessonIndex + 1}节 - ${position.previous.lesson.name}`
            );
          } else {
            Logger.info("  上一节: 无（已是第一节）");
          }
          if (position.next) {
            Logger.info(
              `  下一节: 第${position.next.chapter.index}章 第${position.next.lessonIndex + 1}节 - ${position.next.lesson.name}`
            );
          } else {
            Logger.info("  下一节: 无（已是最后一节）");
          }
        }
      }
    }
  }
  class CourseObserverService {
    observer = null;
    callbacks = {};
    courseDataProvider;
    currentPlayingLesson = null;
    constructor(courseDataProvider) {
      this.courseDataProvider = courseDataProvider;
    }
setCallbacks(callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }
start() {
      const courseMenu = document.querySelector(SELECTORS.course.menu);
      if (!courseMenu) return;
      this.currentPlayingLesson = this.findCurrentPlayingLesson(this.courseDataProvider.parse());
      this.observer = new MutationObserver(() => this.handleCourseMenuChange());
      this.observer.observe(courseMenu, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }
stop() {
      this.observer?.disconnect();
      this.observer = null;
    }
handleCourseMenuChange() {
      const newPlayingLesson = this.findCurrentPlayingLesson(this.courseDataProvider.parse(true));
      if (newPlayingLesson && newPlayingLesson.element !== this.currentPlayingLesson?.element) {
        const oldLesson = this.currentPlayingLesson;
        this.currentPlayingLesson = newPlayingLesson;
        this.callbacks.onLessonChange?.(newPlayingLesson, oldLesson || void 0);
      }
    }
findCurrentPlayingLesson(courseData) {
      for (const chapter of courseData.chapters) {
        const playing = chapter.lessons.find((lesson) => lesson.isPlaying);
        if (playing) return playing;
      }
      return null;
    }
getCurrentLesson() {
      return this.currentPlayingLesson;
    }
  }
  class PlayButtonService {
async smartClick() {
      const coverBtn = await DOMUtils.waitForElement(SELECTORS.player.coverPlayBtn, CONFIG.timeout.element);
      if (coverBtn && DOMUtils.isElementVisible(coverBtn)) {
        const freshBtn = document.querySelector(SELECTORS.player.coverPlayBtn);
        if (freshBtn && DOMUtils.safeClick(freshBtn)) {
          Logger.success("已点击封面播放按钮");
          return true;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const playBtn = document.querySelector(SELECTORS.player.playPauseBtn);
      if (playBtn?.classList.contains(SELECTORS.player.playBtnClass) && DOMUtils.safeClick(playBtn)) {
        Logger.success("已点击控制栏播放按钮");
        return true;
      }
      Logger.error("自动播放失败");
      return false;
    }
isPlaying() {
      const playPauseBtn = document.querySelector(
        SELECTORS.player.playPauseBtn
      );
      return playPauseBtn?.classList.contains(SELECTORS.player.pauseBtnClass) || false;
    }
  }
  class TimeUtils {
static parseTimeToSeconds(timeStr) {
      const parts = timeStr.split(":").map(Number);
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
      return 0;
    }
static formatSeconds(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = Math.floor(seconds % 60);
      const pad = (num) => num.toString().padStart(2, "0");
      if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
      }
      return `${pad(minutes)}:${pad(secs)}`;
    }
static calculatePercentage(current, total) {
      if (total <= 0) return "0.00";
      return (current / total * 100).toFixed(2);
    }
static isTimeClose(time1, time2, tolerance) {
      return Math.abs(time1 - time2) <= tolerance;
    }
  }
  class PlayerMonitorService {
    observers = [];
    callbacks = {};
    lastTime = "";
    hasEnded = false;
    boundTimeElement = null;
    checkInterval = null;
setCallbacks(callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }
start() {
      this.bindObservers();
      this.startContainerObserver();
      this.startPeriodicCheck();
    }
stop() {
      this.cleanup();
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
    }
rebind() {
      this.boundTimeElement = null;
      this.bindObservers();
    }
bindObservers() {
      const currentTimeEl = document.querySelector(SELECTORS.player.timeCurrent);
      const durationEl = document.querySelector(SELECTORS.player.timeDuration);
      const playPauseBtn = document.querySelector(SELECTORS.player.playPauseBtn);
      if (!currentTimeEl || !durationEl || this.boundTimeElement === currentTimeEl) {
        return;
      }
      this.cleanup();
      this.boundTimeElement = currentTimeEl;
      this.hasEnded = false;
      this.lastTime = "";
      const timeObserver = new MutationObserver(() => this.handleTimeUpdate(currentTimeEl, durationEl));
      timeObserver.observe(currentTimeEl, { childList: true, characterData: true, subtree: true });
      this.observers.push(timeObserver);
      if (playPauseBtn) {
        const btnObserver = new MutationObserver(() => this.handleStateChange(playPauseBtn));
        btnObserver.observe(playPauseBtn, { attributes: true, attributeFilter: ["class"] });
        this.observers.push(btnObserver);
      }
    }
handleTimeUpdate(currentTimeEl, durationEl) {
      const currentTime = currentTimeEl.textContent?.trim() || "00:00";
      const duration = durationEl.textContent?.trim() || "00:00";
      if (currentTime === this.lastTime) return;
      this.lastTime = currentTime;
      const currentSeconds = TimeUtils.parseTimeToSeconds(currentTime);
      const durationSeconds = TimeUtils.parseTimeToSeconds(duration);
      const percentage = parseFloat(TimeUtils.calculatePercentage(currentSeconds, durationSeconds));
      Logger.info(`播放时间: ${currentTime} / ${duration} (${percentage.toFixed(2)}%)`);
      this.callbacks.onTimeUpdate?.(currentTime, duration, percentage);
      if (!this.hasEnded && durationSeconds > 0 && TimeUtils.isTimeClose(currentSeconds, durationSeconds, CONFIG.playEnd.tolerance)) {
        this.hasEnded = true;
        Logger.special("🎉", "视频播放完成！");
        this.callbacks.onPlayEnd?.();
      }
      if (this.hasEnded && currentSeconds < durationSeconds - CONFIG.playEnd.resetThreshold) {
        this.hasEnded = false;
      }
    }
handleStateChange(playPauseBtn) {
      if (playPauseBtn.classList.contains(SELECTORS.player.playBtnClass)) {
        Logger.info("视频已暂停");
        this.callbacks.onStateChange?.("paused");
      } else if (playPauseBtn.classList.contains(SELECTORS.player.pauseBtnClass)) {
        this.callbacks.onStateChange?.("playing");
      }
    }
startContainerObserver() {
      const playerContainer = document.querySelector(SELECTORS.player.container);
      if (!playerContainer) return;
      const containerObserver = new MutationObserver(() => {
        const currentTimeEl = document.querySelector(SELECTORS.player.timeCurrent);
        if (currentTimeEl && this.boundTimeElement !== currentTimeEl) {
          this.bindObservers();
        }
      });
      containerObserver.observe(playerContainer, { childList: true, subtree: true });
      this.observers.push(containerObserver);
    }
startPeriodicCheck() {
      this.checkInterval = setInterval(() => {
        const currentTimeEl = document.querySelector(SELECTORS.player.timeCurrent);
        if (currentTimeEl && !this.boundTimeElement) {
          this.bindObservers();
        }
      }, CONFIG.monitor.rebindInterval);
    }
cleanup() {
      this.observers.forEach((observer) => observer.disconnect());
      this.observers = [];
      this.boundTimeElement = null;
    }
  }
  class AutoPlayController {
    courseDataProvider;
    playerMonitor;
    courseObserver;
    playButtonService;
    constructor() {
      this.courseDataProvider = new CourseDataProvider();
      this.playerMonitor = new PlayerMonitorService();
      this.courseObserver = new CourseObserverService(this.courseDataProvider);
      this.playButtonService = new PlayButtonService();
    }
async initialize() {
      Logger.info("AboutCG Auto Video 已加载");
      if (await DOMUtils.waitForElement(SELECTORS.course.menu)) {
        const courseData = this.courseDataProvider.parse();
        this.courseDataProvider.logCourseData(courseData);
      }
      if (!await DOMUtils.waitForElement(SELECTORS.player.timeCurrent)) {
        Logger.error("播放器控件加载超时");
        return;
      }
      this.playerMonitor.setCallbacks({ onPlayEnd: () => this.handlePlayEnd() });
      this.courseObserver.setCallbacks({ onLessonChange: (newLesson, oldLesson) => this.handleLessonChange(newLesson, oldLesson) });
      this.courseObserver.start();
      if (!await DOMUtils.waitForElement(`${SELECTORS.player.coverPlayBtn}, ${SELECTORS.player.playPauseBtn}`, CONFIG.timeout.playButton)) {
        Logger.error("播放按钮加载超时");
        return;
      }
      setTimeout(() => this.startAutoPlay(), CONFIG.autoPlay.afterClick);
    }
async startAutoPlay() {
      this.playerMonitor.start();
      if (!this.playButtonService.isPlaying()) {
        await this.playButtonService.smartClick();
      }
    }
handlePlayEnd() {
      setTimeout(() => this.playNextLesson(), CONFIG.autoPlay.afterEnd);
    }
async handleLessonChange(newLesson, oldLesson) {
      Logger.info(`小节切换: ${oldLesson?.name || "无"} -> ${newLesson.name}`);
      await new Promise((resolve) => setTimeout(resolve, CONFIG.autoPlay.lessonChangeDelay));
      this.playerMonitor.rebind();
      await this.playButtonService.smartClick();
    }
playNextLesson() {
      const position = this.courseDataProvider.getCurrentPosition(this.courseDataProvider.parse());
      if (!position?.next) {
        Logger.info("所有课程已播放完毕");
        return;
      }
      const { chapter, lessonIndex, lesson } = position.next;
      Logger.info(`播放下一节: 第${chapter.index}章 第${lessonIndex + 1}节 - ${lesson.name}`);
      const nameElement = lesson.element.querySelector(SELECTORS.course.lessonClickable);
      if (nameElement && DOMUtils.safeClick(nameElement)) {
        Logger.success(`已点击小节: ${lesson.name}`);
      } else {
        Logger.error("点击小节失败");
      }
    }
  }
  const controller = new AutoPlayController();
  async function bootstrap() {
    try {
      await controller.initialize();
    } catch (error) {
      Logger.error("插件初始化失败", error);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

})();