import { GM_xmlhttpRequest } from '$';
import { LIMITS, STORAGE_KEYS } from '../constants';
import type { User } from '../types';
import { gmStorage } from '../utils/storage';
import { MAX_RETRIES_DEFAULT, paginateUsers, type TimelinePage } from './paginate.ts';
import { buildTweetDetailVariables, parseTweetDetailPage } from './replies.ts';
import { getTxId, pageFetch } from './transaction';
import { userFromResult } from './user.ts';

const BEARER_TOKEN =
  'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

const API_DOC_URL =
  'https://raw.githubusercontent.com/fa0311/TwitterInternalAPIDocument/master/docs/json/API.json';

// ---------------------------------------------------------------------------
// Endpoints & features — resolved at runtime from fa0311/TwitterInternalAPIDocument
// ---------------------------------------------------------------------------

const ENDPOINT_MAP = {
  retweeters: 'Retweeters',
  favoriters: 'Favoriters',
  searchTimeline: 'SearchTimeline',
  replies: 'TweetDetail',
  userByScreenName: 'UserByScreenName',
} as const;

export const DEFAULT_ENDPOINTS = {
  retweeters: '',
  favoriters: '',
  searchTimeline: '',
  replies: '',
} as const;

type EndpointKey = keyof typeof DEFAULT_ENDPOINTS | 'userByScreenName';

const ENDPOINTS: Record<EndpointKey, string> = {
  ...DEFAULT_ENDPOINTS,
  userByScreenName: '',
  replies: '',
};
const ENDPOINT_FEATURES: Record<EndpointKey, Record<string, boolean>> = {
  retweeters: {},
  favoriters: {},
  searchTimeline: {},
  replies: {},
  userByScreenName: {},
};

function setEndpoint(key: EndpointKey, value: string) {
  ENDPOINTS[key] = value;
}

export function updateEndpoints(custom: Partial<Record<keyof typeof DEFAULT_ENDPOINTS, string>>) {
  for (const [k, v] of Object.entries(custom)) {
    if (!v || !(k in DEFAULT_ENDPOINTS)) continue;
    const endpointKey = k as keyof typeof DEFAULT_ENDPOINTS;
    const opName = v.includes('/') ? v.split('/').pop()! : ENDPOINT_MAP[endpointKey];
    setEndpoint(endpointKey, v.includes('/') ? v : `${v}/${opName}`);
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

function _gmFetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload: (res) => (res.status >= 200 && res.status < 300 ? resolve(res.responseText) : reject(new Error(`HTTP ${res.status}`))),
      onerror: () => reject(new Error('network error')),
    });
  });
}

async function _resolveFromApiDoc(): Promise<boolean> {
  try {
    const text = await _gmFetch(API_DOC_URL);
    const data = JSON.parse(text);
    const graphql = data?.graphql;
    if (!graphql || typeof graphql !== 'object') return false;

    for (const [key, opName] of Object.entries(ENDPOINT_MAP)) {
      const endpointKey = key as EndpointKey;
      const entry = graphql[opName];
      if (entry?.queryId) {
        setEndpoint(endpointKey, `${entry.queryId}/${opName}`);
      }
      if (entry?.features && typeof entry.features === 'object') {
        ENDPOINT_FEATURES[endpointKey] = { ...entry.features };
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

function getTweetIdFromUrl(): string | null {
  const match = window.location.pathname.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

function getTweetAuthorHandleFromUrl(): string | null {
  const match = window.location.pathname.match(/^\/([^/]+)\/status\/\d+/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Shared user extraction from GraphQL results
// ---------------------------------------------------------------------------

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
// Shared paginated fetch with retry + dedup lives in ./paginate.ts
// ---------------------------------------------------------------------------

interface FetchOptions {
  onProgress?: (count: number) => void;
  signal?: AbortSignal;
  maxRetries?: number;
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
    .map((entry: unknown) => {
      const e = entry as Record<string, unknown>;
      const r = ((e.content as Record<string, unknown>)?.itemContent as Record<string, unknown>)?.user_results as Record<string, unknown>;
      const result = r?.result as Record<string, unknown> | undefined;
      if (!result) return null;
      const legacy = (result.legacy ?? {}) as Record<string, unknown>;
      const core = (result.core ?? {}) as Record<string, unknown>;
      const perspectives = (result.relationship_perspectives ?? {}) as Record<string, unknown>;
      return userFromResult(result, legacy, core, perspectives);
    })
    .filter((u): u is User => u !== null && u.handle !== '');

  return { users, nextCursor };
}

function parseSearchTimeline(data: unknown, quotedTweetId: string): TimelinePage {
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
      const legacy = (tweet.legacy ?? {}) as Record<string, unknown>;
      const quotedRef = ((tweet.quotedRefResult as Record<string, unknown>)?.result ?? {}) as Record<string, unknown>;
      const quotedId = legacy.quoted_status_id_str ?? quotedRef.rest_id;
      if (quotedId !== quotedTweetId) return null;

      const userResults = ((tweet.core as Record<string, unknown>)?.user_results as Record<string, unknown>)?.result as Record<string, unknown> | undefined;
      if (!userResults) return null;
      const userLegacy = (userResults.legacy ?? {}) as Record<string, unknown>;
      const core = (userResults.core ?? {}) as Record<string, unknown>;
      const perspectives = (userResults.relationship_perspectives ?? {}) as Record<string, unknown>;
      return userFromResult(userResults, userLegacy, core, perspectives);
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

function requireEndpoint(key: EndpointKey): string {
  const endpoint = ENDPOINTS[key];
  if (!endpoint) throw new Error(`missingEndpoint:${key}`);
  return endpoint;
}

function buildGraphqlUrl(
  endpoint: string,
  variables: Record<string, unknown>,
  features: Record<string, boolean>,
): string {
  return (
    `https://x.com/i/api/graphql/${endpoint}` +
    `?variables=${encodeURIComponent(JSON.stringify(variables))}` +
    `&features=${encodeURIComponent(JSON.stringify(features))}`
  );
}

export async function fetchRetweeters(
  tweetId: string,
  csrfToken: string,
  options: FetchOptions = {},
): Promise<User[]> {
  const endpoint = requireEndpoint('retweeters');
  return paginateUsers({
    buildUrl: (cursor) => buildGraphqlUrl(endpoint, {
      tweetId, count: LIMITS.PAGE_SIZE, includePromotedContent: true, ...(cursor && { cursor }),
    }, ENDPOINT_FEATURES.retweeters),
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
  const endpoint = requireEndpoint('favoriters');
  return paginateUsers({
    buildUrl: (cursor) => buildGraphqlUrl(endpoint, {
      tweetId, count: LIMITS.PAGE_SIZE, includePromotedContent: true, ...(cursor && { cursor }),
    }, ENDPOINT_FEATURES.favoriters),
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
  const endpoint = requireEndpoint('searchTimeline');
  const path = `/i/api/graphql/${endpoint}`;

  return paginateUsers({
    buildUrl: (cursor) => buildGraphqlUrl(endpoint, {
      rawQuery: `quoted_tweet_id:${tweetId}`,
      count: LIMITS.PAGE_SIZE,
      querySource: 'tdqt',
      product: 'Top',
      ...(cursor && { cursor }),
    }, ENDPOINT_FEATURES.searchTimeline),
    parsePage: (data) => parseSearchTimeline(data, tweetId),
    fetchFn: pageFetch(),
    headers: baseHeaders(csrfToken),
    maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
    signal: options.signal,
    extraHeaders: async () => {
      const txId = await getTxId('GET', path);
      if (!txId) throw new Error('transactionIdUnavailable');
      return { 'x-client-transaction-id': txId };
    },
  }, options.onProgress);
}

export async function fetchRepliers(
  tweetId: string,
  csrfToken: string,
  options: FetchOptions = {},
): Promise<User[]> {
  const endpoint = requireEndpoint('replies');
  const path = `/i/api/graphql/${endpoint}`;
  let authorHandle = getTweetAuthorHandleFromUrl();

  const users = await paginateUsers({
    buildUrl: (cursor) => buildGraphqlUrl(
      endpoint,
      buildTweetDetailVariables(tweetId, cursor),
      ENDPOINT_FEATURES.replies,
    ),
    parsePage: (data) => {
      const page = parseTweetDetailPage(data, tweetId, authorHandle);
      if (page.authorHandle) authorHandle = page.authorHandle;
      return {
        users: page.users,
        nextCursor: page.nextCursors[0] ?? null,
        nextCursors: page.nextCursors,
      };
    },
    fetchFn: pageFetch(),
    headers: baseHeaders(csrfToken),
    maxRetries: options.maxRetries ?? MAX_RETRIES_DEFAULT,
    signal: options.signal,
    extraHeaders: async () => {
      const txId = await getTxId('GET', path);
      const headers: Record<string, string> = {};
      if (txId) headers['x-client-transaction-id'] = txId;
      return headers;
    },
  }, options.onProgress);

  const excludedAuthor = authorHandle?.toLowerCase();
  return excludedAuthor
    ? users.filter((user) => user.handle.toLowerCase() !== excludedAuthor)
    : users;
}

export async function fetchUserProfile(handle: string): Promise<User> {
  const csrfToken = getCsrfToken();
  if (!csrfToken) throw new Error('loginRequired');

  await initEndpoints();
  const endpoint = requireEndpoint('userByScreenName');
  const response = await pageFetch()(
    buildGraphqlUrl(endpoint, {
      screen_name: handle,
      withSafetyModeUserFields: true,
    }, ENDPOINT_FEATURES.userByScreenName),
    { headers: baseHeaders(csrfToken) },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  const result = data?.data?.user?.result as Record<string, unknown> | undefined;
  if (!result) throw new Error('userProfileUnavailable');

  const legacy = (result.legacy ?? {}) as Record<string, unknown>;
  const core = (result.core ?? {}) as Record<string, unknown>;
  const perspectives = (result.relationship_perspectives ?? {}) as Record<string, unknown>;
  return userFromResult(result, legacy, core, perspectives);
}

export { getCsrfToken, getTweetAuthorHandleFromUrl, getTweetIdFromUrl };

