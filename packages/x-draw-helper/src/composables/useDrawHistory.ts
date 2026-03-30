import { ref, computed } from 'vue';
import type { DrawHistoryEntry, DrawUser, Filters } from '../types';
import { STORAGE_KEYS, LIMITS } from '../constants';
import { gmStorage } from '../utils/storage';

function loadHistory(): DrawHistoryEntry[] {
  const raw = gmStorage.get<DrawHistoryEntry[]>(STORAGE_KEYS.DRAW_HISTORY, []);
  return raw.map((e) => ({ ...e, confirmed: e.confirmed ?? true }));
}

function persistHistory(entries: DrawHistoryEntry[]) {
  gmStorage.set(STORAGE_KEYS.DRAW_HISTORY, entries);
}

const history = ref<DrawHistoryEntry[]>(loadHistory());

export function useDrawHistory() {

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
    persistHistory(history.value);
    return entry;
  }

  function removeEntry(id: string) {
    history.value = history.value.filter((e) => e.id !== id);
    persistHistory(history.value);
  }

  function toggleConfirm(id: string) {
    const entry = history.value.find((e) => e.id === id);
    if (entry) {
      entry.confirmed = !entry.confirmed;
      persistHistory(history.value);
    }
  }

  function clearHistory() {
    history.value = [];
    persistHistory([]);
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
