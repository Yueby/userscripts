import { LIMITS, STORAGE_KEYS } from '../constants';
import type { User } from '../types';
import { gmStorage } from '../utils/storage';
import { getTxId, pageFetch } from './transaction';

const BEARER_TOKEN =
  'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

const API_DOC_URL =
  'https://raw.githubusercontent.com/fa0311/TwitterInternalAPIDocument/master/docs/json/API.json';

// ---------------------------------------------------------------------------
// Endpoints & features — resolved at runtime from fa0311/TwitterInternalAPIDocument
// ---------------------------------------------------------------------------

const ENDPOINT_MAP: Record<string, string> = {
  retweeters: 'Retweeters',
  favoriters: 'Favoriters',
  searchTimeline: 'SearchTimeline',
};

export const DEFAULT_ENDPOINTS = {
  retweeters: 'uhTjAvG7nm0lyrfujroWUw/Retweeters',
  favoriters: 'SoWvHOdzCsomAQdY-bFNDA/Favoriters',
  searchTimeline: 'rkp6b4vtR9u7v3naGoOzUQ/SearchTimeline',
} as const;

type EndpointKey = keyof typeof DEFAULT_ENDPOINTS;

const ENDPOINTS: Record<EndpointKey, string> = { ...DEFAULT_ENDPOINTS };

let GRAPHQL_FEATURES: Record<string, boolean> = {
  rweb_video_screen_enabled: false,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  rweb_tipjar_consumption_enabled: false,
  verified_phone_label_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_enhance_cards_enabled: false,
};

function setEndpoint(key: EndpointKey, value: string) {
  ENDPOINTS[key] = value;
}

export function updateEndpoints(custom: Partial<Record<EndpointKey, string>>) {
  for (const [k, v] of Object.entries(custom)) {
    if (!v || !(k in ENDPOINTS)) continue;
    const opName = v.includes('/') ? v.split('/').pop()! : ENDPOINT_MAP[k] ?? k;
    setEndpoint(k as EndpointKey, v.includes('/') ? v : `${v}/${opName}`);
  }
}

export function loadCustomEndpoints() {
  const saved = gmStorage.get<Record<string, string>>(STORAGE_KEYS.CUSTOM_ENDPOINTS, {});
  if (saved && typeof saved === 'object') updateEndpoints(saved);
}

loadCustomEndpoints();

// ---------------------------------------------------------------------------
// Endpoint resolution (GitHub API doc → page scripts → hardcoded fallback)
// ---------------------------------------------------------------------------

async function _resolveFromApiDoc(): Promise<boolean> {
  try {
    const res = await fetch(API_DOC_URL);
    if (!res.ok) return false;
    const data = await res.json();
    const graphql = data?.graphql;
    if (!graphql || typeof graphql !== 'object') return false;

    let featuresSet = false;
    for (const [key, opName] of Object.entries(ENDPOINT_MAP)) {
      const entry = graphql[opName];
      if (entry?.queryId) {
        setEndpoint(key as EndpointKey, `${entry.queryId}/${opName}`);
      }
      if (!featuresSet && entry?.features && typeof entry.features === 'object') {
        GRAPHQL_FEATURES = { ...entry.features };
        featuresSet = true;
      }
    }
    return true;
  } catch {
    return false;
  }
}

async function _discoverFromPageScripts(): Promise<void> {
  const pFetch = pageFetch();
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
    .map((s) => s.src)
    .filter((src) => src.endsWith('.js'));

  const targets = Object.entries(ENDPOINT_MAP);
  const found = new Set<string>();

  for (const url of scripts) {
    if (found.size === targets.length) break;
    try {
      const text = await (await pFetch(url)).text();
      for (const [key, opName] of targets) {
        if (found.has(key)) continue;
        const m =
          text.match(new RegExp(`queryId:"([^"]+)"[^}]{0,80}operationName:"${opName}"`)) ??
          text.match(new RegExp(`operationName:"${opName}"[^}]{0,80}queryId:"([^"]+)"`));
        if (m) {
          setEndpoint(key as EndpointKey, `${m[1]}/${opName}`);
          found.add(key);
        }
      }
    } catch {
      continue;
    }
  }
}

let _endpointsPromise: Promise<void> | null = null;

export async function initEndpoints(): Promise<void> {
  if (_endpointsPromise) return _endpointsPromise;
  _endpointsPromise = (async () => {
    const ok = await _resolveFromApiDoc();
    if (!ok) await _discoverFromPageScripts();
    loadCustomEndpoints();
  })().catch(() => {
    _endpointsPromise = null;
  });
  return _endpointsPromise;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCsrfToken(): string | null {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('ct0='))
    ?.split('=')[1] ?? null;
}

function getLoggedInUserId(): string | null {
  const raw = document.cookie
    .split('; ')
    .find((row) => row.startsWith('twid='))
    ?.split('=').slice(1).join('=');
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  return decoded.startsWith('u=') ? decoded.slice(2) : null;
}

function getTweetIdFromUrl(): string | null {
  const match = window.location.href.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Shared user extraction from GraphQL results
// ---------------------------------------------------------------------------

function userFromLegacy(legacy: Record<string, unknown>, core: Record<string, unknown>, restId: string, perspectives: Record<string, unknown>): User {
  return {
    id: restId,
    username: (legacy.name || core.name || '') as string,
    handle: (legacy.screen_name || core.screen_name || restId || '') as string,
    avatarUrl: (legacy.profile_image_url_https || '') as string,
    bio: (legacy.description || '') as string,
    following: Boolean(perspectives.following ?? legacy.following),
    followed_by: Boolean(perspectives.followed_by ?? legacy.followed_by),
    followersCount: Number(legacy.followers_count ?? 0),
    followingCount: Number(legacy.friends_count ?? 0),
  };
}

interface TimelinePage {
  users: User[];
  nextCursor: string | null;
}

function extractInstructions(data: unknown, ...path: string[]): unknown[] {
  let node: unknown = data;
  for (const key of path) {
    node = (node as Record<string, unknown>)?.[key];
  }
  return Array.isArray(node) ? node : [];
}

function getAddEntries(instructions: unknown[]): { entries: unknown[] } | null {
  const inst = instructions.find((i: unknown) => (i as Record<string, unknown>)?.type === 'TimelineAddEntries') as Record<string, unknown> | undefined;
  const entries = inst?.entries;
  return entries && Array.isArray(entries) ? { entries } : null;
}

function isTerminated(instructions: unknown[]): boolean {
  return instructions.some((i: unknown) => (i as Record<string, unknown>)?.type === 'TimelineTerminateTimeline');
}

function getBottomCursor(entries: unknown[]): string | null {
  const cursor = entries.find((e: unknown) => (e as Record<string, unknown>)?.content && ((e as Record<string, unknown>).content as Record<string, unknown>)?.cursorType === 'Bottom') as Record<string, unknown> | undefined;
  return ((cursor?.content as Record<string, unknown>)?.value as string) ?? null;
}

// ---------------------------------------------------------------------------
// Shared paginated fetch with retry + dedup
// ---------------------------------------------------------------------------

const RETRY_BACKOFF_MS = 2000;
const MAX_RETRIES_DEFAULT = 3;

interface FetchOptions {
  onProgress?: (count: number) => void;
  signal?: AbortSignal;
  maxRetries?: number;
}

interface PaginateConfig {
  buildUrl: (cursor: string | null) => string;
  parsePage: (data: unknown) => TimelinePage;
  fetchFn: typeof fetch;
  headers: Record<string, string>;
  maxRetries: number;
  signal?: AbortSignal;
  extraHeaders?: (cursor: string | null) => Promise<Record<string, string>>;
}

async function paginateUsers(
  config: PaginateConfig,
  onProgress?: (count: number) => void,
  filterUser?: (u: User) => boolean,
): Promise<User[]> {
  const { buildUrl, parsePage, fetchFn, headers, maxRetries, signal, extraHeaders } = config;
  const result: User[] = [];
  const seen = new Set<string>();

  async function fetchWithRetry(cursor: string | null): Promise<unknown | null> {
    for (let retry = 0; retry < maxRetries; retry++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      try {
        const extra = extraHeaders ? await extraHeaders(cursor) : {};
        const response = await fetchFn(buildUrl(cursor), { headers: { ...headers, ...extra }, signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        if (retry === maxRetries - 1) return null;
        await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * (retry + 1)));
      }
    }
    return null;
  }

  let currentCursor: string | null = null;
  let pendingFetch: Promise<unknown | null> | null = fetchWithRetry(null);

  while (pendingFetch) {
    const data = await pendingFetch;
    if (!data) break;

    const { users, nextCursor } = parsePage(data);
    const filtered = filterUser ? users.filter(filterUser) : users;

    if (nextCursor && nextCursor !== currentCursor) {
      currentCursor = nextCursor;
      pendingFetch = fetchWithRetry(currentCursor);
    } else {
      pendingFetch = null;
    }

    for (const u of filtered) {
      const key = u.id || u.handle;
      if (!seen.has(key)) { seen.add(key); result.push(u); }
    }
    onProgress?.(result.length);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Timeline parsers
// ---------------------------------------------------------------------------

function parseRetweeterTimeline(data: unknown): TimelinePage {
  const instructions = extractInstructions(data, 'data', 'retweeters_timeline', 'timeline', 'instructions');
  return parseUserTimeline(instructions);
}

function parseFavoriterTimeline(data: unknown): TimelinePage {
  const instructions = extractInstructions(data, 'data', 'favoriters_timeline', 'timeline', 'instructions');
  return parseUserTimeline(instructions);
}

function parseUserTimeline(instructions: unknown[]): TimelinePage {
  if (isTerminated(instructions)) return { users: [], nextCursor: null };

  const addEntries = getAddEntries(instructions);
  if (!addEntries) return { users: [], nextCursor: null };

  const nextCursor = getBottomCursor(addEntries.entries);

  const users: User[] = addEntries.entries
    .filter((e: unknown) => String((e as Record<string, unknown>).entryId ?? '').startsWith('user-'))
    .map((entry: unknown) => {
      const e = entry as Record<string, unknown>;
      const r = ((e.content as Record<string, unknown>)?.itemContent as Record<string, unknown>)?.user_results as Record<string, unknown>;
      const result = r?.result as Record<string, unknown> | undefined;
      if (!result) return null;
      const legacy = (result.legacy ?? {}) as Record<string, unknown>;
      const core = (result.core ?? {}) as Record<string, unknown>;
      const perspectives = (result.relationship_perspectives ?? {}) as Record<string, unknown>;
      const entryId = String(e.entryId ?? '');
      const fallbackId = entryId.startsWith('user-') ? entryId.slice(5) : '';
      return userFromLegacy(legacy, core, (result.rest_id as string) || fallbackId, perspectives);
    })
    .filter((u): u is User => u !== null && u.handle !== '');

  return { users, nextCursor };
}

function parseSearchTimeline(data: unknown): TimelinePage {
  const instructions = extractInstructions(data, 'data', 'search_by_raw_query', 'search_timeline', 'timeline', 'instructions');

  if (isTerminated(instructions)) return { users: [], nextCursor: null };

  const addEntries = getAddEntries(instructions);
  if (!addEntries) return { users: [], nextCursor: null };

  const nextCursor = getBottomCursor(addEntries.entries);

  const users: User[] = addEntries.entries
    .filter((e: unknown) => String((e as Record<string, unknown>).entryId ?? '').startsWith('tweet-'))
    .map((entry: unknown) => {
      const e = entry as Record<string, unknown>;
      const tweetResult = ((e.content as Record<string, unknown>)?.itemContent as Record<string, unknown>)?.tweet_results as Record<string, unknown>;
      const raw = tweetResult?.result as Record<string, unknown> | undefined;
      const tweet = (raw?.__typename === 'TweetWithVisibilityResults' ? (raw.tweet as Record<string, unknown>) : raw) ?? {};
      const userResults = ((tweet.core as Record<string, unknown>)?.user_results as Record<string, unknown>)?.result as Record<string, unknown> | undefined;
      if (!userResults) return null;
      const legacy = (userResults.legacy ?? {}) as Record<string, unknown>;
      const core = (userResults.core ?? {}) as Record<string, unknown>;
      const perspectives = (userResults.relationship_perspectives ?? {}) as Record<string, unknown>;
      return userFromLegacy(legacy, core, (userResults.rest_id as string) ?? '', perspectives);
    })
    .filter((u): u is User => u !== null && u.handle !== '');

  return { users, nextCursor };
}

// ---------------------------------------------------------------------------
// Public fetchers
// ---------------------------------------------------------------------------

function baseHeaders(csrfToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${BEARER_TOKEN}`,
    'x-csrf-token': csrfToken,
    'x-twitter-auth-type': 'OAuth2Session',
    'x-twitter-active-user': 'yes',
    'content-type': 'application/json',
  };
}

function buildGraphqlUrl(endpoint: string, variables: Record<string, unknown>): string {
  return (
    `https://x.com/i/api/graphql/${endpoint}` +
    `?variables=${encodeURIComponent(JSON.stringify(variables))}` +
    `&features=${encodeURIComponent(JSON.stringify(GRAPHQL_FEATURES))}`
  );
}

export async function fetchRetweeters(
  tweetId: string,
  csrfToken: string,
  options: FetchOptions = {},
): Promise<User[]> {
  return paginateUsers({
    buildUrl: (cursor) => buildGraphqlUrl(ENDPOINTS.retweeters, {
      tweetId, count: LIMITS.PAGE_SIZE, includePromotedContent: true, ...(cursor && { cursor }),
    }),
    parsePage: parseRetweeterTimeline,
    fetchFn: pageFetch(),
    headers: baseHeaders(csrfToken),
    maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
    signal: options.signal,
  }, options.onProgress);
}

export async function fetchFavoriters(
  tweetId: string,
  csrfToken: string,
  options: FetchOptions = {},
): Promise<User[]> {
  return paginateUsers({
    buildUrl: (cursor) => buildGraphqlUrl(ENDPOINTS.favoriters, {
      tweetId, count: LIMITS.PAGE_SIZE, includePromotedContent: true, ...(cursor && { cursor }),
    }),
    parsePage: parseFavoriterTimeline,
    fetchFn: pageFetch(),
    headers: baseHeaders(csrfToken),
    maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
    signal: options.signal,
  }, options.onProgress);
}

export async function fetchQuoteTweeters(
  tweetId: string,
  csrfToken: string,
  options: FetchOptions = {},
): Promise<User[]> {
  const endpoint = ENDPOINTS.searchTimeline;
  const path = `/i/api/graphql/${endpoint}`;
  const selfId = getLoggedInUserId();

  return paginateUsers({
    buildUrl: (cursor) => buildGraphqlUrl(endpoint, {
      rawQuery: `quoted_tweet_id:${tweetId}`,
      count: LIMITS.PAGE_SIZE,
      querySource: 'tdqt',
      product: 'Top',
      ...(cursor && { cursor }),
    }),
    parsePage: parseSearchTimeline,
    fetchFn: pageFetch(),
    headers: baseHeaders(csrfToken),
    maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
    signal: options.signal,
    extraHeaders: async () => {
      const txId = await getTxId('GET', path);
      return txId ? { 'x-client-transaction-id': txId } : {};
    },
  }, options.onProgress, selfId ? (u) => u.id !== selfId : undefined);
}

export { getCsrfToken, getTweetIdFromUrl };

