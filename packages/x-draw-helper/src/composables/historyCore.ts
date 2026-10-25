import { LIMITS, STORAGE_KEYS } from '../constants.ts';
import type { DrawHistoryEntry, DrawUser, Filters, User } from '../types';
import { normalizeReplyComments } from '../utils/replyComments.ts';

export interface HistoryStorage {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  list(): string[];
}

export interface AddHistoryEntryParams {
  tweetId: string;
  winners: DrawUser[];
  filters: Filters;
  totalParticipants: number;
}

export interface ConfirmedWinStats {
  keys: Set<string>;
  idCounts: Map<string, number>;
  handleOnlyCounts: Map<string, number>;
  handleCounts: Map<string, number>;
}

function asBucket(entries: unknown): DrawHistoryEntry[] {
  return Array.isArray(entries)
    ? entries.filter((entry): entry is DrawHistoryEntry => Boolean(entry) && typeof entry === 'object')
    : [];
}

export function historyBucketKey(tweetId: string): string {
  return `${STORAGE_KEYS.DRAW_HISTORY_PREFIX}${tweetId}`;
}

export interface HistoryLocationLike {
  pathname: string;
}

export function buildHistoryTweetUrl(
  tweetId: string,
  location: HistoryLocationLike | null | undefined,
): string {
  const match = location?.pathname.match(/^\/([^/]+)\/status\/(\d+)(?:\/|$)/);
  if (match && match[2] === tweetId) {
    return `https://x.com/${match[1]}/status/${match[2]}`;
  }
  return `https://x.com/i/status/${tweetId}`;
}

export function normalizeHistoryEntry(entry: DrawHistoryEntry): DrawHistoryEntry {
  const savedFilters = entry.filters as Partial<Filters> | undefined;
  return {
    ...entry,
    tweetId: typeof entry.tweetId === 'string' ? entry.tweetId : '',
    tweetUrl: typeof entry.tweetUrl === 'string' ? entry.tweetUrl : '',
    winners: Array.isArray(entry.winners)
      ? entry.winners.map((winner) => {
        if (!winner || typeof winner !== 'object') return winner;
        const comments = normalizeReplyComments(winner.replyComments);
        return comments === undefined ? winner : { ...winner, replyComments: comments };
      })
      : [],
    filters: {
      followed_by: savedFilters?.followed_by ?? false,
      retweet: savedFilters?.retweet ?? false,
      like: savedFilters?.like ?? false,
      quote: savedFilters?.quote ?? false,
      reply: savedFilters?.reply ?? false,
    },
    totalParticipants: Number.isFinite(entry.totalParticipants) ? entry.totalParticipants : 0,
    timestamp: Number.isFinite(entry.timestamp) ? entry.timestamp : 0,
    confirmed: entry.confirmed ?? true,
  };
}

export function listHistoryBuckets(storage: HistoryStorage): string[] {
  return storage.list().filter((key) => key.startsWith(STORAGE_KEYS.DRAW_HISTORY_PREFIX));
}

export function loadAllHistory(storage: HistoryStorage): DrawHistoryEntry[] {
  const entries: DrawHistoryEntry[] = [];
  for (const key of listHistoryBuckets(storage)) {
    const bucket = asBucket(storage.get<unknown>(key, []));
    for (const entry of bucket) entries.push(normalizeHistoryEntry(entry));
  }
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

export function appendHistoryEntry(storage: HistoryStorage, entry: DrawHistoryEntry): void {
  const key = historyBucketKey(entry.tweetId);
  const bucket = asBucket(storage.get<unknown>(key, [])).map(normalizeHistoryEntry);
  const next = [normalizeHistoryEntry(entry), ...bucket].slice(0, LIMITS.MAX_HISTORY_ENTRIES);
  storage.set(key, next);
}

export function removeHistoryEntry(
  storage: HistoryStorage,
  entryId: string,
  tweetId?: string,
): void {
  const keys = tweetId === undefined ? listHistoryBuckets(storage) : [historyBucketKey(tweetId)];

  for (const key of keys) {
    const bucket = asBucket(storage.get<unknown>(key, []));
    const index = bucket.findIndex((entry) => (
      entry.id === entryId
      && (tweetId === undefined || String(entry.tweetId ?? '') === tweetId)
    ));
    if (index === -1) continue;
    bucket.splice(index, 1);
    storage.set(key, bucket);
    return;
  }
}

export function toggleHistoryEntry(
  storage: HistoryStorage,
  entryId: string,
  tweetId?: string,
): void {
  const keys = tweetId === undefined ? listHistoryBuckets(storage) : [historyBucketKey(tweetId)];

  for (const key of keys) {
    const bucket = asBucket(storage.get<unknown>(key, []));
    const index = bucket.findIndex((entry) => (
      entry.id === entryId
      && (tweetId === undefined || String(entry.tweetId ?? '') === tweetId)
    ));
    if (index === -1) continue;
    const current = normalizeHistoryEntry(bucket[index]);
    bucket[index] = { ...current, confirmed: !current.confirmed };
    storage.set(key, bucket);
    return;
  }
}

export function clearAllHistory(storage: HistoryStorage): void {
  for (const key of listHistoryBuckets(storage)) storage.remove(key);
}

export function handleKey(handle: string): string {
  return `handle:${handle.toLowerCase()}`;
}

export function userKey(user: Pick<User, 'id' | 'handle'>): string {
  return user.id ? `id:${user.id}` : handleKey(user.handle);
}

export function collectConfirmedWinStats(entries: DrawHistoryEntry[]): ConfirmedWinStats {
  const keys = new Set<string>();
  const idCounts = new Map<string, number>();
  const handleOnlyCounts = new Map<string, number>();
  const handleCounts = new Map<string, number>();

  for (const entry of entries) {
    if (entry.confirmed === false) continue;
    if (!Array.isArray(entry.winners)) continue;

    const seen = new Set<string>();

    for (const winner of entry.winners) {
      if (!winner || typeof winner.handle !== 'string') continue;

      const key = userKey(winner);
      if (seen.has(key)) continue;
      seen.add(key);

      keys.add(key);
      const lowerHandle = winner.handle.toLowerCase();
      handleCounts.set(lowerHandle, (handleCounts.get(lowerHandle) ?? 0) + 1);
      if (winner.id) {
        idCounts.set(winner.id, (idCounts.get(winner.id) ?? 0) + 1);
      } else {
        handleOnlyCounts.set(lowerHandle, (handleOnlyCounts.get(lowerHandle) ?? 0) + 1);
      }
    }
  }

  return { keys, idCounts, handleOnlyCounts, handleCounts };
}

export function getWinCountFromStats(
  stats: ConfirmedWinStats,
  user: Pick<User, 'id' | 'handle'> | string,
): number {
  if (typeof user === 'string') {
    return stats.handleCounts.get(user.toLowerCase()) ?? 0;
  }

  const lowerHandle = user.handle.toLowerCase();
  if (!user.id) return stats.handleOnlyCounts.get(lowerHandle) ?? 0;
  return (stats.idCounts.get(user.id) ?? 0) + (stats.handleOnlyCounts.get(lowerHandle) ?? 0);
}

export function isExcludedWinner(
  user: Pick<User, 'id' | 'handle'>,
  keys: Set<string>,
): boolean {
  if (user.id && keys.has(`id:${user.id}`)) return true;
  return keys.has(handleKey(user.handle));
}
