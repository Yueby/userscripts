import { GM_deleteValue, GM_getValue, GM_listValues, GM_setValue } from '$';
import { LEGACY_KEY_MAP, STORAGE_KEYS } from '../constants';

export interface Storage {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  list(): string[];
}

export const gmStorage: Storage = {
  get<T>(key: string, fallback: T): T {
    try {
      return (GM_getValue(key, fallback) as T) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      GM_setValue(key, value);
    } catch { /* ignore */ }
  },
  remove(key: string): void {
    try {
      GM_deleteValue(key);
    } catch { /* ignore */ }
  },
  list(): string[] {
    try {
      return GM_listValues() ?? [];
    } catch {
      return [];
    }
  },
};

export function migrateStorageKeys(): void {
  const allKeys = gmStorage.list();

  for (const key of allKeys) {
    // Migrate exact-match legacy keys
    const newKey = LEGACY_KEY_MAP[key];
    if (newKey && !allKeys.includes(newKey)) {
      gmStorage.set(newKey, gmStorage.get(key, null));
      gmStorage.remove(key);
    }

    // Migrate tweet cache prefix: x-draw-tweet-{id} → xd:cache:{id}
    if (key.startsWith('x-draw-tweet-')) {
      const tweetId = key.slice('x-draw-tweet-'.length);
      const migratedKey = `${STORAGE_KEYS.TWEET_CACHE_PREFIX}${tweetId}`;
      if (!allKeys.includes(migratedKey)) {
        gmStorage.set(migratedKey, gmStorage.get(key, null));
      }
      gmStorage.remove(key);
    }
  }
}
