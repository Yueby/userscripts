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
