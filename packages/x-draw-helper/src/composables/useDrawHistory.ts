import { ref, computed, watch, type Ref } from 'vue';
import type { DrawHistoryEntry, DrawUser, Filters } from '../types';
import { STORAGE_KEYS, LIMITS } from '../constants';
import { gmStorage } from '../utils/storage';

function loadHistory(tweetId: string | null): DrawHistoryEntry[] {
  if (!tweetId) return [];
  const raw = gmStorage.get<DrawHistoryEntry[]>(`${STORAGE_KEYS.DRAW_HISTORY_PREFIX}${tweetId}`, []);
  return raw.map((e) => ({ ...e, confirmed: e.confirmed ?? true }));
}

function persistHistory(tweetId: string | null, entries: DrawHistoryEntry[]) {
  if (tweetId) gmStorage.set(`${STORAGE_KEYS.DRAW_HISTORY_PREFIX}${tweetId}`, entries);
}

export function useDrawHistory(tweetId: Ref<string | null>) {
  const history = ref<DrawHistoryEntry[]>(loadHistory(tweetId.value));
  watch(tweetId, (value) => { history.value = loadHistory(value); }, { immediate: true });

  function addEntry(params: {
    tweetId: string;
    winners: DrawUser[];
    filters: Filters;
    totalParticipants: number;
  }) {
    const entry: DrawHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tweetId: params.tweetId,
      tweetUrl: window.location.href,
      winners: params.winners,
      filters: { ...params.filters },
      totalParticipants: params.totalParticipants,
      timestamp: Date.now(),
      confirmed: true,
    };
    history.value = [entry, ...history.value].slice(0, LIMITS.MAX_HISTORY_ENTRIES);
    persistHistory(tweetId.value, history.value);
    return entry;
  }

  function removeEntry(id: string) {
    history.value = history.value.filter((e) => e.id !== id);
    persistHistory(tweetId.value, history.value);
  }

  function toggleConfirm(id: string) {
    const entry = history.value.find((e) => e.id === id);
    if (entry) {
      entry.confirmed = !entry.confirmed;
      persistHistory(tweetId.value, history.value);
    }
  }

  function clearHistory() {
    history.value = [];
    persistHistory(tweetId.value, []);
  }

  const winCountMap = computed(() => {
    const map = new Map<string, number>();
    for (const entry of history.value) {
      if (!entry.confirmed) continue;
      for (const w of entry.winners) {
        map.set(w.handle, (map.get(w.handle) ?? 0) + 1);
      }
    }
    return map;
  });

  function getWinCount(handle: string): number {
    return winCountMap.value.get(handle) ?? 0;
  }

  return {
    history,
    addEntry,
    removeEntry,
    toggleConfirm,
    clearHistory,
    winCountMap,
    getWinCount,
  };
}
