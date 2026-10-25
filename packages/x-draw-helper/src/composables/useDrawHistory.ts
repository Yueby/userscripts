import type { Ref } from 'vue';
import { gmStorage } from '../utils/storage';
import { createHistoryStore } from './historyStore.ts';

// One store per page so every panel instance sees the same global history.
// Created lazily so storage migration runs before the first read.
let historyStore: ReturnType<typeof createHistoryStore> | null = null;

export function useDrawHistory(_tweetId?: Ref<string | null>) {
  if (!historyStore) historyStore = createHistoryStore(gmStorage);
  return historyStore;
}
