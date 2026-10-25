import type { User } from '../types';
import { mergeUserPreservingComments } from '../utils/replyComments.ts';

export const RETRY_BACKOFF_MS = 2000;
export const MAX_RETRIES_DEFAULT = 3;

export interface TimelinePage {
  users: User[];
  nextCursor: string | null;
  nextCursors?: string[];
}

export interface PaginateConfig {
  buildUrl: (cursor: string | null) => string;
  parsePage: (data: unknown) => TimelinePage;
  fetchFn: typeof fetch;
  headers: Record<string, string>;
  maxRetries: number;
  signal?: AbortSignal;
  extraHeaders?: (cursor: string | null) => Promise<Record<string, string>>;
}

export async function paginateUsers(
  config: PaginateConfig,
  onProgress?: (count: number) => void,
  filterUser?: (u: User) => boolean,
): Promise<User[]> {
  const { buildUrl, parsePage, fetchFn, headers, maxRetries, signal, extraHeaders } = config;
  const result: User[] = [];
  const indexByKey = new Map<string, number>();
  const pendingCursors: string[] = [];
  const scheduledCursors = new Set<string>();

  async function fetchWithRetry(cursor: string | null): Promise<unknown> {
    let lastError: unknown = new Error('Request failed');

    for (let retry = 0; retry < maxRetries; retry++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      try {
        const extra = extraHeaders ? await extraHeaders(cursor) : {};
        const response = await fetchFn(buildUrl(cursor), { headers: { ...headers, ...extra }, signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        lastError = error;
        if (retry < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * (retry + 1)));
        }
      }
    }

    throw lastError;
  }

  let pendingFetch: Promise<unknown> | null = fetchWithRetry(null);

  while (pendingFetch) {
    const data = await pendingFetch;

    const { users, nextCursor, nextCursors } = parsePage(data);
    const cursors = nextCursors ?? (nextCursor ? [nextCursor] : []);
    for (const cursor of cursors) {
      if (!cursor || scheduledCursors.has(cursor)) continue;
      scheduledCursors.add(cursor);
      pendingCursors.push(cursor);
    }
    pendingFetch = pendingCursors.length > 0 ? fetchWithRetry(pendingCursors.shift()!) : null;

    const filtered = filterUser ? users.filter(filterUser) : users;
    for (const u of filtered) {
      const key = u.id || u.handle.toLowerCase();
      const existingIndex = indexByKey.get(key);
      if (existingIndex === undefined) {
        indexByKey.set(key, result.length);
        result.push(u);
      } else {
        result[existingIndex] = mergeUserPreservingComments(result[existingIndex], u);
      }
    }
    onProgress?.(result.length);
  }

  return result;
}
