import { computed, ref } from 'vue';
import type { DrawHistoryEntry, User } from '../types';
import type { Storage } from '../utils/storage';
import {
  appendHistoryEntry,
  buildHistoryTweetUrl,
  clearAllHistory,
  collectConfirmedWinStats,
  getWinCountFromStats,
  loadAllHistory,
  normalizeHistoryEntry,
  removeHistoryEntry,
  toggleHistoryEntry,
  type AddHistoryEntryParams,
  type HistoryStorage,
} from './historyCore.ts';

export function createHistoryStore(storage: Storage) {
  const history = ref<DrawHistoryEntry[]>(loadAllHistory(storage as HistoryStorage));
  const winStats = computed(() => collectConfirmedWinStats(history.value));
  const confirmedWinnerKeys = computed<Set<string>>(() => winStats.value.keys);
  const winCountMap = computed(() => winStats.value.handleCounts);

  function refresh() {
    history.value = loadAllHistory(storage as HistoryStorage);
  }

  function addEntry(params: AddHistoryEntryParams): DrawHistoryEntry {
    const entry = normalizeHistoryEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tweetId: params.tweetId,
      tweetUrl: buildHistoryTweetUrl(
        params.tweetId,
        typeof window !== 'undefined' ? window.location : null,
      ),
      winners: params.winners,
      filters: { ...params.filters },
      totalParticipants: params.totalParticipants,
      timestamp: Date.now(),
      confirmed: true,
    });
    appendHistoryEntry(storage as HistoryStorage, entry);
    refresh();
    return entry;
  }

  function removeEntry(id: string, tweetId?: string) {
    removeHistoryEntry(storage as HistoryStorage, id, tweetId);
    refresh();
  }

  function toggleConfirm(id: string, tweetId?: string) {
    toggleHistoryEntry(storage as HistoryStorage, id, tweetId);
    refresh();
  }

  function clearHistory() {
    clearAllHistory(storage as HistoryStorage);
    refresh();
  }

  function getWinCount(user: Pick<User, 'id' | 'handle'> | string): number {
    return getWinCountFromStats(winStats.value, user);
  }

  return {
    history,
    addEntry,
    removeEntry,
    toggleConfirm,
    clearHistory,
    winCountMap,
    confirmedWinnerKeys,
    getWinCount,
  };
}
