import type { User } from '../types';

const BEARER_TOKEN =
  'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

// Features exactly as X's frontend sends for SearchTimeline
const SEARCH_FEATURES = {
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
  responsive_web_grok_analyze_post_followups_enabled: true,
  responsive_web_jetfuel_frame: true,
  responsive_web_grok_share_attachment_enabled: true,
  responsive_web_grok_annotations_enabled: true,
  articles_preview_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
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

const GRAPHQL_FEATURES = {
  profile_label_improvements_pcf_label_in_post_enabled: true,
  rweb_tipjar_consumption_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: false,
  responsive_web_jetfuel_frame: false,
  responsive_web_grok_share_attachment_enabled: true,
  articles_preview_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  responsive_web_grok_analysis_button_from_backend: true,
  creator_subscriptions_quote_tweet_preview_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  rweb_video_timestamps_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  responsive_web_grok_image_annotation_enabled: false,
  responsive_web_enhance_cards_enabled: false,
};

const ENDPOINTS: Record<string, string> = {
  retweeters: 'niCJ2QyTuAgZWv01E7mqJQ/Retweeters',
  favoriters: 'aLZ5wrqDYuDm9c_xNl667w/Favoriters',
  searchTimeline: 'GcXk9vN_d1jUfHNqLacXQA/SearchTimeline',
};

let _endpointsPromise: Promise<void> | null = null;
export async function initEndpoints(): Promise<void> {
  if (_endpointsPromise) return _endpointsPromise;
  _endpointsPromise = _resolveEndpoints().catch(() => { _endpointsPromise = null; });
  return _endpointsPromise;
}

async function _resolveEndpoints(): Promise<void> {

  const targets: [keyof typeof ENDPOINTS, string][] = [
    ['retweeters', 'Retweeters'],
    ['favoriters', 'Favoriters'],
    ['searchTimeline', 'SearchTimeline'],
  ];
  const found = new Set<string>();

  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
    .map((s) => s.src)
    .filter((src) => src.endsWith('.js'));

  for (const url of scripts) {
    if (found.size === targets.length) break;
    try {
      const text = await (await fetch(url)).text();
      for (const [key, opName] of targets) {
        if (found.has(key)) continue;
        const m =
          text.match(new RegExp(`queryId:"([^"]+)"[^}]{0,80}operationName:"${opName}"`)) ||
          text.match(new RegExp(`operationName:"${opName}"[^}]{0,80}queryId:"([^"]+)"`));
        if (m) {
          ENDPOINTS[key] = `${m[1]}/${opName}`;
          found.add(key);
        }
      }
    } catch {
      continue;
    }
  }
}

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
  const decoded = decodeURIComponent(raw); // "u=12345678"
  return decoded.startsWith('u=') ? decoded.slice(2) : null;
}

function getTweetIdFromUrl(): string | null {
  const match = window.location.href.match(/\/status\/(\d+)/);
  return match?.[1] ?? null;
}

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
        const response = await fetch(buildUrl(cursor), { headers, signal });
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
        };
      })
      .filter((u: User) => u.handle !== '');

    return { users, nextCursor };
  }

  // Pipeline: kick off the first fetch
  let currentCursor: string | null = null;
  let pendingFetch: Promise<any | null> | null = fetchWithRetry(null);

  while (pendingFetch) {
    const data = await pendingFetch;
    if (!data) break;

    const { users, nextCursor } = parseTimeline(data);

    // Pipeline: start next page fetch BEFORE processing current page users
    if (nextCursor && nextCursor !== currentCursor) {
      currentCursor = nextCursor;
      pendingFetch = fetchWithRetry(currentCursor);
    } else {
      pendingFetch = null;
    }

    // Dedup + collect
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

// --- x-client-transaction-id generation (based on Lqm1/x-client-transaction-id, Apache 2.0) ---
const _ON_DEMAND_RE =
  /(\d+):\s*["']ondemand\.s["'][\s\S]*?\}\[e\]\s*\|\|\s*e\)\s*\+\s*["']\.["']\s*\+\s*\{[\s\S]*?\b\1:\s*["']([a-zA-Z0-9_-]+)["']/s;
const _INDICES_RE = /\(\w\[(\d{1,2})\],\s*16\)/g;

class _ClientTransaction {
  private keyBytes: number[] = [];
  private defRowIdx = 0;
  private defByteIndices: number[] = [];
  private animKey = '';
  private ready = false;

  async init(): Promise<boolean> {
    try {
      const metaKey = document
        .querySelector("[name='twitter-site-verification']")
        ?.getAttribute('content');
      if (!metaKey) return false;
      this.keyBytes = Array.from(atob(metaKey), (c) => c.charCodeAt(0));

      // Animation frames are stripped by React after hydration; fetch the raw homepage HTML
      let animDoc: Document = document;
      if (!document.querySelector("[id^='loading-x-anim']")) {
        const html = await (await fetch('/')).text();
        animDoc = new DOMParser().parseFromString(html, 'text/html');
      }

      const onDemandUrl = this._getOnDemandUrl();
      if (!onDemandUrl) return false;

      const text = await (await fetch(onDemandUrl)).text();
      const indices: number[] = [];
      _INDICES_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = _INDICES_RE.exec(text)) !== null) indices.push(parseInt(m[1], 10));
      if (!indices.length) return false;

      this.defRowIdx = indices[0];
      this.defByteIndices = indices.slice(1);
      this.animKey = this._buildAnimKey(animDoc);
      this.ready = !!this.animKey;
      return this.ready;
    } catch {
      return false;
    }
  }

  private _getOnDemandUrl(): string | null {
    const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script'));
    // First: search inline scripts (lightweight)
    for (const s of scripts) {
      const t = s.textContent ?? '';
      if (!t.includes('ondemand.s')) continue;
      const m = _ON_DEMAND_RE.exec(t);
      if (m) return `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${m[2]}a.js`;
    }
    // Fallback: search full HTML (heavy, lazy)
    const m = _ON_DEMAND_RE.exec(document.documentElement.outerHTML);
    if (m) return `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${m[2]}a.js`;
    return null;
  }

  private _buildAnimKey(doc: Document = document): string {
    const frames = Array.from(doc.querySelectorAll<Element>("[id^='loading-x-anim']"));
    if (!frames.length) return '';
    const kb = this.keyBytes;
    const rowIdx = kb[this.defRowIdx] % 16;
    let frameTime = this.defByteIndices.reduce((a, i) => a * (kb[i] % 16), 1);
    frameTime = Math.round(frameTime / 10) * 10;
    const arr = this._get2dArr(frames, kb);
    if (!arr[rowIdx]?.length) return '';
    return this._animate(arr[rowIdx], frameTime / 4096);
  }

  private _get2dArr(frames: Element[], kb: number[]): number[][] {
    const frame = frames[kb[5] % 4];
    const d = frame?.children[0]?.children[1]?.getAttribute('d');
    if (!d) return [[]];
    return d
      .substring(9)
      .split('C')
      .map((s) => {
        const c = s.replace(/[^\d]+/g, ' ').trim();
        return c ? c.split(/\s+/).map(Number) : [];
      });
  }

  private _solve(v: number, min: number, max: number, floor: boolean): number {
    const r = (v * (max - min)) / 255 + min;
    return floor ? Math.floor(r) : Math.round(r * 100) / 100;
  }

  private _animate(row: number[], t: number): string {
    const isOdd = (n: number) => (n % 2 ? -1 : 0);
    const lerp = (a: number[], b: number[], f: number) =>
      a.map((v, i) => v * (1 - f) + b[i] * f);
    const rotMat = (deg: number) => {
      const r = (deg * Math.PI) / 180;
      return [Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r)];
    };
    const floatHex = (x: number): string => {
      const res: string[] = [];
      let q = Math.floor(x);
      let frac = x - q;
      while (q > 0) {
        const nq = Math.floor(q / 16);
        const rem = q - nq * 16;
        res.unshift(rem > 9 ? String.fromCharCode(rem + 55) : rem.toString());
        q = nq;
      }
      if (!frac) return res.join('');
      res.push('.');
      for (let f2 = frac; f2 > 0; ) {
        f2 *= 16;
        const int = Math.floor(f2);
        f2 -= int;
        res.push(int > 9 ? String.fromCharCode(int + 55) : int.toString());
      }
      return res.join('');
    };
    const cubicVal = (curves: number[], tv: number): number => {
      const calc = (a: number, b: number, m: number) =>
        3 * a * (1 - m) * (1 - m) * m + 3 * b * (1 - m) * m * m + m * m * m;
      if (tv <= 0)
        return (
          (curves[0] > 0
            ? curves[1] / curves[0]
            : curves[1] === 0 && curves[2] > 0
              ? curves[3] / curves[2]
              : 0) * tv
        );
      if (tv >= 1)
        return (
          1 +
          (curves[2] < 1
            ? (curves[3] - 1) / (curves[2] - 1)
            : curves[2] === 1 && curves[0] < 1
              ? (curves[1] - 1) / (curves[0] - 1)
              : 0) *
            (tv - 1)
        );
      let [s, e, mid] = [0, 1, 0];
      while (s < e) {
        mid = (s + e) / 2;
        const x = calc(curves[0], curves[2], mid);
        if (Math.abs(tv - x) < 0.00001) return calc(curves[1], curves[3], mid);
        if (x < tv) s = mid;
        else e = mid;
      }
      return calc(curves[1], curves[3], mid);
    };

    const from = [...row.slice(0, 3), 1];
    const to = [...row.slice(3, 6), 1];
    const fromR = [0];
    const toR = [this._solve(row[6], 60, 360, true)];
    const curves = row.slice(7).map((v, i) => this._solve(v, isOdd(i), 1, false));
    const val = cubicVal(curves, t);
    const col = lerp(from, to, val).map((v) => (v > 0 ? v : 0));
    const rot = lerp(fromR, toR, val);
    const mat = rotMat(rot[0]);
    const parts = col.slice(0, -1).map((v) => Math.round(v).toString(16));
    for (const v of mat) {
      let rv = Math.round(v * 100) / 100;
      if (rv < 0) rv = -rv;
      const h = floatHex(rv);
      parts.push((h.startsWith('.') ? '0' + h : h || '0').toLowerCase());
    }
    parts.push('0', '0');
    return parts.join('').replace(/[.-]/g, '');
  }

  async generateId(method: string, path: string): Promise<string | null> {
    if (!this.ready) return null;
    const now = Math.floor((Date.now() - 1682924400000) / 1000);
    const tBytes = [now & 0xff, (now >> 8) & 0xff, (now >> 16) & 0xff, (now >> 24) & 0xff];
    const data = `${method}!${path}!${now}obfiowerehiring${this.animKey}`;
    const hash = Array.from(
      new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))),
    );
    const rn = Math.floor(Math.random() * 256);
    const bytes = [...this.keyBytes, ...tBytes, ...hash.slice(0, 16), 3];
    const out = new Uint8Array([rn, ...bytes.map((b) => b ^ rn)]);
    return btoa(String.fromCharCode(...out)).replace(/=/g, '');
  }
}

let _capturedTxId: string | null = null;

export function initTxIdCapture(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uw: Window = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window) as Window;
  const orig = uw.fetch.bind(uw);
  (uw as any).fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    if (url.includes('/i/api/graphql/')) {
      const h = init?.headers ?? (input instanceof Request ? input.headers : undefined);
      if (h) {
        const txId = h instanceof Headers
          ? h.get('x-client-transaction-id')
          : (h as Record<string, string>)['x-client-transaction-id'];
        if (txId) _capturedTxId = txId;
      }
    }
    return orig(input as RequestInfo | URL, init);
  };
}

async function _initTxn(): Promise<_ClientTransaction | null> {
  const txn = new _ClientTransaction();
  return (await txn.init()) ? txn : null;
}

let _txnInstance: _ClientTransaction | null = null;
let _txnInitPromise: Promise<_ClientTransaction | null> | null = null;

async function _getTxId(method: string, path: string): Promise<string | null> {
  // Ensure single init attempt at a time (race-safe)
  if (!_txnInitPromise || !_txnInstance) {
    _txnInitPromise = _initTxn();
    _txnInstance = await _txnInitPromise;
    if (!_txnInstance) _txnInitPromise = null; // allow retry on failure
  }
  if (_txnInstance) {
    const id = await _txnInstance.generateId(method, path);
    if (id) return id;
  }
  // Fallback: use a txId captured from X's own graphql requests
  return _capturedTxId;
}
// -----------------------------------------------------------------------

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
      // Handle TweetWithVisibilityResults wrapper
      const tweet =
        tweetResult?.__typename === 'TweetWithVisibilityResults'
          ? tweetResult.tweet
          : tweetResult;
      const userResult = tweet?.core?.user_results?.result;
      // X API: name/screen_name in result.core, avatar in result.avatar
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
      `&features=${encodeURIComponent(JSON.stringify(SEARCH_FEATURES))}`
    );
  }

  async function fetchWithRetry(cursor: string | null): Promise<any | null> {
    for (let retry = 0; retry < maxRetries; retry++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      try {
        const txId = await _getTxId('GET', path);
        const reqHeaders = txId ? { ...headers, 'x-client-transaction-id': txId } : headers;
        const response = await fetch(buildUrl(cursor), { headers: reqHeaders, signal });
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

