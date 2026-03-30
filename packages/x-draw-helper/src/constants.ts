export const STORAGE_KEYS = {
  TWEET_CACHE_PREFIX: 'xd:cache:',
  CACHE_INDEX: 'xd:cache-index',
  DRAW_HISTORY: 'xd:history',
  LANGUAGE: 'xd:lang',
  DM_TEMPLATE: 'xd:dm-template',
  CUSTOM_ENDPOINTS: 'xd:endpoints',
} as const;

const LEGACY_KEY_MAP: Record<string, string> = {
  'x-draw-history': STORAGE_KEYS.DRAW_HISTORY,
  'x-draw-helper-lang': STORAGE_KEYS.LANGUAGE,
  'x-draw-dm-template': STORAGE_KEYS.DM_TEMPLATE,
  'x-draw-endpoints': STORAGE_KEYS.CUSTOM_ENDPOINTS,
};

export { LEGACY_KEY_MAP };

export const LIMITS = {
  MAX_HISTORY_ENTRIES: 100,
  MAX_CACHE_ENTRIES: 50,
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
