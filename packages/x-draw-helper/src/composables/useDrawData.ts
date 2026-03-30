import { ref, computed } from 'vue';
import type { User, DrawUser, Filters, FilterKey, DrawResult, InteractionData } from '../types';
import { STORAGE_KEYS } from '../constants';
import { gmStorage } from '../utils/storage';
import { fetchRetweeters, fetchFavoriters, fetchQuoteTweeters, getCsrfToken, getTweetIdFromUrl, initEndpoints } from '../api/twitter';

interface CachedData {
  retweets: User[];
  likes: User[];
  quotes: User[];
  fetchedAt: number;
}

function loadCache(tweetId: string): CachedData | null {
  return gmStorage.get<CachedData | null>(`${STORAGE_KEYS.TWEET_CACHE_PREFIX}${tweetId}`, null);
}

function saveCache(tweetId: string, retweets: User[], likes: User[], quotes: User[]) {
  gmStorage.set(`${STORAGE_KEYS.TWEET_CACHE_PREFIX}${tweetId}`, { retweets, likes, quotes, fetchedAt: Date.now() } as CachedData);
}

const retweets = ref<User[]>([]);
const likes = ref<User[]>([]);
const quotes = ref<User[]>([]);
const filters = ref<Filters>({
  followed_by: false,
  retweet: false,
  like: false,
  quote: false,
});
const drawCount = ref(1);
const loading = ref(false);
const retweetProgress = ref(0);
const likeProgress = ref(0);
const quoteProgress = ref(0);
const lastTweetId = ref<string | null>(null);
const fetchedAt = ref<number | null>(null);

let abortController: AbortController | null = null;

export function useDrawData() {

  const mergedUsers = computed(() => {
    const map = new Map<string, DrawUser>();
    for (const user of retweets.value) {
      map.set(user.handle, { ...user, hasRetweet: true });
    }
    for (const user of likes.value) {
      const existing = map.get(user.handle);
      if (existing) {
        existing.hasLike = true;
      } else {
        map.set(user.handle, { ...user, hasLike: true });
      }
    }
    for (const user of quotes.value) {
      const existing = map.get(user.handle);
      if (existing) {
        existing.hasQuote = true;
      } else {
        map.set(user.handle, { ...user, hasQuote: true });
      }
    }
    return Array.from(map.values());
  });

  const qualifiedUsers = computed(() => {
    const hasActive = Object.values(filters.value).some(Boolean);
    if (!hasActive) return mergedUsers.value;

    return mergedUsers.value.filter((user) => {
      if (filters.value.followed_by && !user.followed_by) return false;
      if (filters.value.like && !user.hasLike) return false;
      // Quotes count as retweets: when both active, OR logic
      if (filters.value.retweet && filters.value.quote) {
        if (!user.hasRetweet && !user.hasQuote) return false;
      } else {
        if (filters.value.retweet && !user.hasRetweet) return false;
        if (filters.value.quote && !user.hasQuote) return false;
      }
      return true;
    });
  });

  function toggleFilter(key: FilterKey) {
    filters.value[key] = !filters.value[key];
  }

  function performDraw(options?: { excludeHandles?: Set<string> }): DrawResult {
    const count = Math.max(1, Math.floor(drawCount.value) || 1);
    drawCount.value = count;

    let users = qualifiedUsers.value;
    if (options?.excludeHandles?.size) {
      users = users.filter((u) => !options.excludeHandles!.has(u.handle));
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
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    const tweetId = getTweetIdFromUrl();
    if (!tweetId) throw new Error('invalidTweetUrl');

    const csrfToken = getCsrfToken();
    if (!csrfToken) throw new Error('loginRequired');

    // If tweet changed, clear stale data immediately
    if (lastTweetId.value !== tweetId) {
      retweets.value = [];
      likes.value = [];
      quotes.value = [];
      lastTweetId.value = tweetId;
    }

    const cached = loadCache(tweetId);
    if (cached) {
      retweets.value = cached.retweets;
      likes.value = cached.likes;
      quotes.value = cached.quotes || [];
      fetchedAt.value = cached.fetchedAt;
    }

    loading.value = true;
    retweetProgress.value = 0;
    likeProgress.value = 0;
    quoteProgress.value = 0;

    try {
      await initEndpoints();

      const results = await Promise.allSettled([
        fetchRetweeters(tweetId, csrfToken, {
          signal: abortController.signal,
          onProgress: (count) => { retweetProgress.value = count; },
        }),
        fetchFavoriters(tweetId, csrfToken, {
          signal: abortController.signal,
          onProgress: (count) => { likeProgress.value = count; },
        }),
        fetchQuoteTweeters(tweetId, csrfToken, {
          signal: abortController.signal,
          onProgress: (count) => { quoteProgress.value = count; },
        }),
      ]);

      const settled = <T>(r: PromiseSettledResult<T>, fallback: T): T =>
        r.status === 'fulfilled' ? r.value : fallback;

      const retweetData = settled(results[0], retweets.value);
      const likeData = settled(results[1], likes.value);
      const quoteData = settled(results[2], quotes.value);

      retweets.value = retweetData;
      likes.value = likeData;
      quotes.value = quoteData;
      fetchedAt.value = Date.now();
      saveCache(tweetId, retweetData, likeData, quoteData);

      return { retweets: retweetData, likes: likeData, quotes: quoteData };
    } finally {
      loading.value = false;
    }
  }

  function cancelFetch() {
    abortController?.abort();
    loading.value = false;
  }

  function reset() {
    retweets.value = [];
    likes.value = [];
    quotes.value = [];
    filters.value = { followed_by: false, retweet: false, like: false, quote: false };
    drawCount.value = 1;
    retweetProgress.value = 0;
    likeProgress.value = 0;
    quoteProgress.value = 0;
    lastTweetId.value = null;
    fetchedAt.value = null;
  }

  return {
    retweets,
    likes,
    quotes,
    filters,
    drawCount,
    loading,
    retweetProgress,
    likeProgress,
    quoteProgress,
    lastTweetId,
    fetchedAt,
    mergedUsers,
    qualifiedUsers,
    toggleFilter,
    performDraw,
    fetchInteractionData,
    cancelFetch,
    reset,
  };
}
