export const STORAGE_KEYS = {
  TWEET_CACHE_PREFIX: 'x-draw-tweet-',
  DRAW_HISTORY: 'x-draw-history',
  LANGUAGE: 'x-draw-helper-lang',
  DM_TEMPLATE: 'x-draw-dm-template',
  CUSTOM_ENDPOINTS: 'x-draw-endpoints',
} as const;

export const LIMITS = {
  MAX_HISTORY_ENTRIES: 100,
  PAGE_SIZE: 20,
} as const;

export const TIMING = {
  TOAST_DURATION: 3000,
  CACHE_AGE_INTERVAL: 30_000,
  CONFIRM_TIMEOUT: 3000,
  DRAW_ANIMATION_SPEED: 80,
  DRAW_ANIMATION_DURATION: 2000,
  DRAW_ANIMATION_REVEAL_DELAY: 600,
} as const;

export const UI = {
  SKELETON_ROWS: 8,
} as const;
