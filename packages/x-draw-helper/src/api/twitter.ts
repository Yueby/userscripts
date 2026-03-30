import type { User } from '../types';
import { pageFetch, getTxId } from './transaction';
import { gmStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

const BEARER_TOKEN =
  'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

// Feature flags synced from fa0311/TwitterInternalAPIDocument.
// Retweeters, Favoriters and SearchTimeline share the same set.
const GRAPHQL_FEATURES = {
  rweb_video_screen_enabled: false,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_profile_redirect_enabled: false,
  rweb_tipjar_consumption_enabled: false,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: false,
  responsive_web_jetfuel_frame: true,
  responsive_web_grok_share_attachment_enabled: true,
  responsive_web_grok_annotations_enabled: true,
  articles_preview_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  content_disclosure_indicator_enabled: true,
  content_disclosure_ai_generated_indicator_enabled: true,
  responsive_web_grok_show_grok_translated_post: false,
  responsive_web_grok_analysis_button_from_backend: true,
  post_ctas_fetch_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: false,
  responsive_web_grok_image_annotation_enabled: true,
  responsive_web_grok_imagine_annotation_enabled: true,
  responsive_web_grok_community_note_auto_translation_is_enabled: false,
  responsive_web_enhance_cards_enabled: false,
};

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const DEFAULT_ENDPOINTS = {
  retweeters: 'uhTjAvG7nm0lyrfujroWUw/Retweeters',
  favoriters: 'SoWvHOdzCsomAQdY-bFNDA/Favoriters',
  searchTimeline: 'rkp6b4vtR9u7v3naGoOzUQ/SearchTimeline',
} as const;

const ENDPOINTS = { ...DEFAULT_ENDPOINTS };

export function updateEndpoints(custom: Partial<typeof DEFAULT_ENDPOINTS>) {
  for (const [k, v] of Object.entries(custom)) {
    if (v && k in ENDPOINTS) {
      const opName = v.includes('/') ? v.split('/').pop()! : k === 'retweeters' ? 'Retweeters' : k === 'favoriters' ? 'Favoriters' : 'SearchTimeline';
      (ENDPOINTS as any)[k] = v.includes('/') ? v : `${v}/${opName}`;
    }
  }
}

export function loadCustomEndpoints() {
  const saved = gmStorage.get<Record<string, string>>(STORAGE_KEYS.CUSTOM_ENDPOINTS, {});
  if (saved && typeof saved === 'object') updateEndpoints(saved);
}

loadCustomEndpoints();

const DISCOVERY_TARGETS: [string, string][] = [
  ['retweeters', 'Retweeters'],
  ['favoriters', 'Favoriters'],
  ['searchTimeline', 'SearchTimeline'],
];

async function _discoverEndpoints(): Promise<void> {
  const pFetch = pageFetch();
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
    .map((s) => s.src)
    .filter((src) => src.endsWith('.js'));

  const found = new Set<string>();

  for (const url of scripts) {
    if (found.size === DISCOVERY_TARGETS.length) break;
    try {
      const text = await (await pFetch(url)).text();
      for (const [key, opName] of DISCOVERY_TARGETS) {
        if (found.has(key)) continue;
        const m =
          text.match(new RegExp(`queryId:"([^"]+)"[^}]{0,80}operationName:"${opName}"`)) ??
          text.match(new RegExp(`operationName:"${opName}"[^}]{0,80}queryId:"([^"]+)"`));
        if (m) {
          (ENDPOINTS as any)[key] = `${m[1]}/${opName}`;
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
  _endpointsPromise = _discoverEndpoints().catch(() => {
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
// Fetchers
// ---------------------------------------------------------------------------

interface FetchOptions {
  onProgress?: (count: number) => void;
  signal?: AbortSignal;
  maxRetries?: number;
}

async function fetchPaginatedUsers(
  endpoint: string,
  tweetId: string,
  csrfToken: string,
  options: FetchOptions = {}
): Promise<User[]> {
  const { onProgress, signal, maxRetries = 3 } = options;
  const pFetch = pageFetch();
  const result: User[] = [];
  const seen = new Set<string>();

  const headers = {
    authorization: `Bearer ${BEARER_TOKEN}`,
    'x-csrf-token': csrfToken,
    'x-twitter-auth-type': 'OAuth2Session',
    'x-twitter-active-user': 'yes',
    'content-type': 'application/json',
  };

  function buildUrl(cursor: string | null): string {
    const variables: Record<string, unknown> = {
      tweetId,
      count: 20,
      includePromotedContent: true,
    };
    if (cursor) variables.cursor = cursor;
    return (
      `https://x.com/i/api/graphql/${endpoint}` +
      `?variables=${encodeURIComponent(JSON.stringify(variables))}` +
      `&features=${encodeURIComponent(JSON.stringify(GRAPHQL_FEATURES))}`
    );
  }

  async function fetchWithRetry(cursor: string | null): Promise<any | null> {
    for (let retry = 0; retry < maxRetries; retry++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      try {
        const response = await pFetch(buildUrl(cursor), { headers, signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        if (retry === maxRetries - 1) return null;
        await new Promise((r) => setTimeout(r, 2000 * (retry + 1)));
      }
    }
    return null;
  }

  function parseTimeline(data: any): { users: User[]; nextCursor: string | null } {
    const timeline =
      data?.data?.retweeters_timeline?.timeline ??
      data?.data?.favoriters_timeline?.timeline;

    if (!timeline) return { users: [], nextCursor: null };

    if (
      timeline.instructions.some(
        (i: { type: string }) => i.type === 'TimelineTerminateTimeline'
      )
    ) {
      return { users: [], nextCursor: null };
    }

    const addEntries = timeline.instructions.find(
      (i: { type: string }) => i.type === 'TimelineAddEntries'
    );
    if (!addEntries?.entries) return { users: [], nextCursor: null };

    const bottomCursor = addEntries.entries.find(
      (e: Record<string, any>) => e.content?.cursorType === 'Bottom'
    );
    const nextCursor = bottomCursor?.content?.value ?? null;

    const users: User[] = addEntries.entries
      .filter((e: { entryId?: string }) => e.entryId?.startsWith('user-'))
      .map((entry: Record<string, any>) => {
        const r = entry.content?.itemContent?.user_results?.result;
        const legacy = r?.legacy || {};
        const core = r?.core || {};
        const perspectives = r?.relationship_perspectives || {};
        const entryId = String(entry.entryId || '');
        const entryUserId = entryId.startsWith('user-') ? entryId.slice(5) : '';
        return {
          id: r?.rest_id || entryUserId,
          username: legacy.name || core.name || '',
          handle: legacy.screen_name || core.screen_name || r?.rest_id || '',
          avatarUrl: legacy.profile_image_url_https || r?.avatar?.image_url || '',
          bio: legacy.description || r?.profile_bio?.description || '',
          following: Boolean(perspectives.following ?? legacy.following),
          followed_by: Boolean(perspectives.followed_by ?? legacy.followed_by),
          followersCount: Number(legacy.followers_count ?? 0),
          followingCount: Number(legacy.friends_count ?? 0),
        };
      })
      .filter((u: User) => u.handle !== '');

    return { users, nextCursor };
  }

  let currentCursor: string | null = null;
  let pendingFetch: Promise<any | null> | null = fetchWithRetry(null);

  while (pendingFetch) {
    const data = await pendingFetch;
    if (!data) break;

    const { users, nextCursor } = parseTimeline(data);

    if (nextCursor && nextCursor !== currentCursor) {
      currentCursor = nextCursor;
      pendingFetch = fetchWithRetry(currentCursor);
    } else {
      pendingFetch = null;
    }

    for (const u of users) {
      const key = u.id || u.handle;
      if (!seen.has(key)) { seen.add(key); result.push(u); }
    }
    onProgress?.(result.length);
  }

  return result;
}

export async function fetchRetweeters(
  tweetId: string,
  csrfToken: string,
  options?: FetchOptions
): Promise<User[]> {
  return fetchPaginatedUsers(ENDPOINTS.retweeters, tweetId, csrfToken, options);
}

export async function fetchFavoriters(
  tweetId: string,
  csrfToken: string,
  options?: FetchOptions
): Promise<User[]> {
  return fetchPaginatedUsers(ENDPOINTS.favoriters, tweetId, csrfToken, options);
}

// ---------------------------------------------------------------------------
// Quote tweeters (via SearchTimeline — requires x-client-transaction-id)
// ---------------------------------------------------------------------------

function _parseSearchTimeline(data: any): { users: User[]; nextCursor: string | null } {
  const instructions =
    data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ?? [];
  if (instructions.some((i: any) => i.type === 'TimelineTerminateTimeline'))
    return { users: [], nextCursor: null };
  const addEntries = instructions.find((i: any) => i.type === 'TimelineAddEntries');
  if (!addEntries?.entries) return { users: [], nextCursor: null };
  const bottomCursor = addEntries.entries.find((e: any) => e.content?.cursorType === 'Bottom');
  const nextCursor: string | null = bottomCursor?.content?.value ?? null;
  const users: User[] = addEntries.entries
    .filter((e: any) => String(e.entryId ?? '').startsWith('tweet-'))
    .map((entry: any) => {
      const tweetResult = entry.content?.itemContent?.tweet_results?.result;
      const tweet =
        tweetResult?.__typename === 'TweetWithVisibilityResults'
          ? tweetResult.tweet
          : tweetResult;
      const userResult = tweet?.core?.user_results?.result;
      const userCore = userResult?.core ?? {};
      const legacy = userResult?.legacy ?? {};
      const perspectives = userResult?.relationship_perspectives ?? {};
      return {
        id: userResult?.rest_id ?? '',
        username: userCore.name || legacy.name || '',
        handle: userCore.screen_name || legacy.screen_name || '',
        avatarUrl: userResult?.avatar?.image_url || legacy.profile_image_url_https || '',
        bio: userResult?.profile_bio?.description || legacy.description || '',
        following: Boolean(perspectives.following ?? legacy.following),
        followed_by: Boolean(perspectives.followed_by ?? legacy.followed_by),
        followersCount: Number(legacy.followers_count ?? 0),
        followingCount: Number(legacy.friends_count ?? 0),
      } as User;
    })
    .filter((u: User) => u.handle !== '');
  return { users, nextCursor };
}

export async function fetchQuoteTweeters(
  tweetId: string,
  csrfToken: string,
  options: FetchOptions = {}
): Promise<User[]> {
  const { onProgress, signal, maxRetries = 3 } = options;
  const pFetch = pageFetch();
  const result: User[] = [];
  const seen = new Set<string>();
  const selfId = getLoggedInUserId();
  const endpoint = ENDPOINTS.searchTimeline;
  const path = `/i/api/graphql/${endpoint}`;

  const headers: Record<string, string> = {
    authorization: `Bearer ${BEARER_TOKEN}`,
    'x-csrf-token': csrfToken,
    'x-twitter-auth-type': 'OAuth2Session',
    'x-twitter-active-user': 'yes',
    'content-type': 'application/json',
  };

  function buildUrl(cursor: string | null): string {
    const variables: Record<string, unknown> = {
      rawQuery: `quoted_tweet_id:${tweetId}`,
      count: 20,
      querySource: 'tdqt',
      product: 'Top',
      withGrokTranslatedBio: false,
    };
    if (cursor) variables.cursor = cursor;
    return (
      `https://x.com${path}` +
      `?variables=${encodeURIComponent(JSON.stringify(variables))}` +
      `&features=${encodeURIComponent(JSON.stringify(GRAPHQL_FEATURES))}`
    );
  }

  async function fetchWithRetry(cursor: string | null): Promise<any | null> {
    for (let retry = 0; retry < maxRetries; retry++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      try {
        const txId = await getTxId('GET', path);
        const reqHeaders = txId ? { ...headers, 'x-client-transaction-id': txId } : headers;
        const response = await pFetch(buildUrl(cursor), { headers: reqHeaders, signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        if (retry === maxRetries - 1) return null;
        await new Promise((r) => setTimeout(r, 2000 * (retry + 1)));
      }
    }
    return null;
  }

  let currentCursor: string | null = null;
  let pendingFetch: Promise<any | null> | null = fetchWithRetry(null);

  while (pendingFetch) {
    const data = await pendingFetch;
    if (!data) break;

    const { users, nextCursor } = _parseSearchTimeline(data);
    const filtered = selfId ? users.filter((u) => u.id !== selfId) : users;

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

export { getCsrfToken, getTweetIdFromUrl };
