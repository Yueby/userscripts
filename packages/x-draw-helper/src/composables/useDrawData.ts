import { ref, computed } from 'vue';
import type { User, DrawUser, Filters, FilterKey, DrawResult, InteractionData, InteractionSource } from '../types';
import { LIMITS, STORAGE_KEYS } from '../constants';
import { gmStorage } from '../utils/storage';
import { fetchRetweeters, fetchFavoriters, fetchQuoteTweeters, fetchRepliers, getCsrfToken, getTweetAuthorHandleFromUrl, getTweetIdFromUrl, initEndpoints } from '../api/twitter';
import { filterQualifiedUsers, mergeInteractionUsers, normalizeCachedData, type CachedInteractionData } from './drawDataCore';
import { abortError, createFetchRunGuard } from './fetchRunGuard';
import { isExcludedWinner } from './historyCore';

function getCacheIndex(): string[] {
  return gmStorage.get<string[]>(STORAGE_KEYS.CACHE_INDEX, []);
}

function setCacheIndex(index: string[]) {
  gmStorage.set(STORAGE_KEYS.CACHE_INDEX, index);
}

function touchCacheIndex(tweetId: string) {
  let index = getCacheIndex().filter((id) => id !== tweetId);
  index.unshift(tweetId);
  if (index.length > LIMITS.MAX_CACHE_ENTRIES) {
    const evicted = index.splice(LIMITS.MAX_CACHE_ENTRIES);
    for (const id of evicted) {
      gmStorage.remove(`${STORAGE_KEYS.TWEET_CACHE_PREFIX}${id}`);
    }
  }
  setCacheIndex(index);
}

function loadCache(tweetId: string): CachedInteractionData | null {
  return gmStorage.get<CachedInteractionData | null>(`${STORAGE_KEYS.TWEET_CACHE_PREFIX}${tweetId}`, null);
}

function saveCache(tweetId: string, retweets: User[], likes: User[], quotes: User[], replies: User[]) {
  gmStorage.set(`${STORAGE_KEYS.TWEET_CACHE_PREFIX}${tweetId}`, { retweets, likes, quotes, replies, fetchedAt: Date.now() } as CachedInteractionData);
  touchCacheIndex(tweetId);
}

const retweets = ref<User[]>([]);
const likes = ref<User[]>([]);
const quotes = ref<User[]>([]);
const replies = ref<User[]>([]);
const filters = ref<Filters>({
  followed_by: false,
  retweet: false,
  like: false,
  quote: false,
  reply: false,
});
const drawCount = ref(1);
const loading = ref(false);
const retweetProgress = ref(0);
const likeProgress = ref(0);
const quoteProgress = ref(0);
const replyProgress = ref(0);
const lastTweetId = ref<string | null>(null);
const fetchedAt = ref<number | null>(null);
const failedSources = ref<InteractionSource[]>([]);

const fetchGuard = createFetchRunGuard();

export function useDrawData() {

  function syncTweetId(tweetId: string | null) {
    if (lastTweetId.value === tweetId) return;
    fetchGuard.invalidate();
    retweets.value = [];
    likes.value = [];
    quotes.value = [];
    replies.value = [];
    fetchedAt.value = null;
    failedSources.value = [];
    lastTweetId.value = tweetId;
  }

  const mergedUsers = computed(() => mergeInteractionUsers({
    retweets: retweets.value,
    likes: likes.value,
    quotes: quotes.value,
    replies: replies.value,
  }, getTweetAuthorHandleFromUrl()));

  const qualifiedUsers = computed(() => filterQualifiedUsers(mergedUsers.value, filters.value));

  function toggleFilter(key: FilterKey) {
    filters.value[key] = !filters.value[key];
  }

  function performDraw(options?: {
    excludeHandles?: Set<string>;
    excludeWinnerKeys?: Set<string>;
  }): DrawResult {
    const count = Math.max(1, Math.floor(drawCount.value) || 1);
    drawCount.value = count;

    let users = qualifiedUsers.value;
    if (options?.excludeWinnerKeys?.size) {
      const keys = options.excludeWinnerKeys;
      users = users.filter((user) => !isExcludedWinner(user, keys));
    }
    if (options?.excludeHandles?.size) {
      const handles = options.excludeHandles;
      users = users.filter((u) => !handles.has(u.handle.toLowerCase()) && !handles.has(u.handle));
    }
    if (users.length === 0) {
      return { success: false, message: 'noQualifiedUsers' };
    }
    if (count > users.length) {
      return { success: false, message: 'notEnoughUsers', count: users.length };
    }

    const temp = [...users];
    const winners: DrawUser[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * temp.length);
      winners.push(temp[idx]);
      temp.splice(idx, 1);
    }

    return { success: true, winners };
  }

  async function fetchInteractionData(): Promise<InteractionData> {
    const tweetId = getTweetIdFromUrl();
    if (!tweetId) throw new Error('invalidTweetUrl');

    const csrfToken = getCsrfToken();
    if (!csrfToken) throw new Error('loginRequired');

    // If tweet changed, clear stale data immediately; also cancels any old run.
    syncTweetId(tweetId);

    const run = fetchGuard.start();
    const signal = run.controller.signal;

    const cached = loadCache(tweetId);
    if (cached) {
      const data = normalizeCachedData(cached);
      retweets.value = data.retweets;
      likes.value = data.likes;
      quotes.value = data.quotes;
      replies.value = data.replies;
      fetchedAt.value = data.fetchedAt;
    }

    loading.value = true;
    retweetProgress.value = 0;
    likeProgress.value = 0;
    quoteProgress.value = 0;
    replyProgress.value = 0;
    failedSources.value = [];

    try {
      await initEndpoints();
      if (!fetchGuard.isCurrent(run)) throw abortError();

      const results = await Promise.allSettled([
        fetchRetweeters(tweetId, csrfToken, {
          signal,
          onProgress: (count) => { if (fetchGuard.isCurrent(run)) retweetProgress.value = count; },
        }),
        fetchFavoriters(tweetId, csrfToken, {
          signal,
          onProgress: (count) => { if (fetchGuard.isCurrent(run)) likeProgress.value = count; },
        }),
        fetchQuoteTweeters(tweetId, csrfToken, {
          signal,
          onProgress: (count) => { if (fetchGuard.isCurrent(run)) quoteProgress.value = count; },
        }),
        fetchRepliers(tweetId, csrfToken, {
          signal,
          onProgress: (count) => { if (fetchGuard.isCurrent(run)) replyProgress.value = count; },
        }),
      ]);

      if (!fetchGuard.isCurrent(run)) throw abortError();

      const sourceNames: InteractionSource[] = ['retweets', 'likes', 'quotes', 'replies'];
      failedSources.value = results.flatMap((result, index) =>
        result.status === 'rejected' ? [sourceNames[index]] : [],
      );

      if (failedSources.value.length === sourceNames.length) {
        fetchedAt.value = cached?.fetchedAt ?? null;
        throw new Error('allSourcesFailed');
      }

      const settled = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
        result.status === 'fulfilled' ? result.value : fallback;

      const retweetData = settled(results[0], retweets.value);
      const likeData = settled(results[1], likes.value);
      const quoteData = settled(results[2], quotes.value);
      const replyData = settled(results[3], replies.value);

      retweets.value = retweetData;
      likes.value = likeData;
      quotes.value = quoteData;
      replies.value = replyData;
      fetchedAt.value = Date.now();
      saveCache(tweetId, retweetData, likeData, quoteData, replyData);

      return {
        retweets: retweetData,
        likes: likeData,
        quotes: quoteData,
        replies: replyData,
        failedSources: failedSources.value,
      };
    } finally {
      if (fetchGuard.isCurrent(run)) loading.value = false;
      fetchGuard.finish(run);
    }
  }

  function restoreFromCache(): boolean {
    const tweetId = getTweetIdFromUrl();
    if (!tweetId) return false;
    syncTweetId(tweetId);
    const cached = loadCache(tweetId);
    if (!cached) return false;
    const data = normalizeCachedData(cached);
    retweets.value = data.retweets;
    likes.value = data.likes;
    quotes.value = data.quotes;
    replies.value = data.replies;
    fetchedAt.value = data.fetchedAt;
    return true;
  }

  function cancelFetch() {
    fetchGuard.invalidate();
    loading.value = false;
  }

  function reset() {
    fetchGuard.invalidate();
    retweets.value = [];
    likes.value = [];
    quotes.value = [];
    replies.value = [];
    filters.value = { followed_by: false, retweet: false, like: false, quote: false, reply: false };
    drawCount.value = 1;
    retweetProgress.value = 0;
    likeProgress.value = 0;
    quoteProgress.value = 0;
    replyProgress.value = 0;
    lastTweetId.value = null;
    fetchedAt.value = null;
    failedSources.value = [];
    loading.value = false;
  }

  return {
    retweets,
    likes,
    quotes,
    replies,
    filters,
    drawCount,
    loading,
    retweetProgress,
    likeProgress,
    quoteProgress,
    replyProgress,
    lastTweetId,
    fetchedAt,
    failedSources,
    mergedUsers,
    qualifiedUsers,
    interactionCounts: computed(() => ({
      retweets: mergedUsers.value.filter((user) => user.hasRetweet).length,
      likes: mergedUsers.value.filter((user) => user.hasLike).length,
      quotes: mergedUsers.value.filter((user) => user.hasQuote).length,
      replies: mergedUsers.value.filter((user) => user.hasReply).length,
    })),
    toggleFilter,
    performDraw,
    fetchInteractionData,
    restoreFromCache,
    cancelFetch,
    reset,
    syncTweetId,
  };
}
