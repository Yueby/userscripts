import { GM_getValue, GM_setValue } from '$';

export interface Storage {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
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
};
