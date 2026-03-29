import { ref, computed } from 'vue';
import { GM_getValue, GM_setValue } from '$';
import type { User, DrawUser, Filters, FilterKey, DrawResult, InteractionData } from '../types';
import { fetchRetweeters, fetchFavoriters, fetchQuoteTweeters, getCsrfToken, getTweetIdFromUrl, initEndpoints } from '../api/twitter';

const CACHE_KEY_PREFIX = 'x-draw-cache-';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CachedData {
  retweets: User[];
  likes: User[];
  quotes: User[];
  timestamp: number;
}

function loadCache(tweetId: string): CachedData | null {
  try {
    const data = GM_getValue(`${CACHE_KEY_PREFIX}${tweetId}`, null) as CachedData | null;
    if (data && Date.now() - data.timestamp < CACHE_TTL) return data;
  } catch { /* ignore */ }
  return null;
}

function saveCache(tweetId: string, retweets: User[], likes: User[], quotes: User[]) {
  try {
    GM_setValue(`${CACHE_KEY_PREFIX}${tweetId}`, { retweets, likes, quotes, timestamp: Date.now() } as CachedData);
  } catch { /* ignore */ }
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
const loadingStatus = ref('');
const retweetProgress = ref(0);
const likeProgress = ref(0);
const quoteProgress = ref(0);
const lastTweetId = ref<string | null>(null);

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

  function performDraw(): DrawResult {
    const users = qualifiedUsers.value;
    if (users.length === 0) {
      return { success: false, message: 'noQualifiedUsers' };
    }
    if (drawCount.value > users.length) {
      return { success: false, message: 'notEnoughUsers', count: users.length };
    }

    const temp = [...users];
    const winners: DrawUser[] = [];
    for (let i = 0; i < drawCount.value; i++) {
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

    // Try loading from cache first (instant display)
    const cached = loadCache(tweetId);
    if (cached) {
      retweets.value = cached.retweets;
      likes.value = cached.likes;
      quotes.value = cached.quotes || [];
    }

    loading.value = true;
    retweetProgress.value = 0;
    likeProgress.value = 0;
    quoteProgress.value = 0;

    try {
      await initEndpoints();

      const [retweetData, likeData, quoteData] = await Promise.all([
        fetchRetweeters(tweetId, csrfToken, {
          signal: abortController.signal,
          onProgress: (count) => {
            retweetProgress.value = count;
          },
        }),
        fetchFavoriters(tweetId, csrfToken, {
          signal: abortController.signal,
          onProgress: (count) => {
            likeProgress.value = count;
          },
        }),
        fetchQuoteTweeters(tweetId, csrfToken, {
          signal: abortController.signal,
          onProgress: (count) => {
            quoteProgress.value = count;
          },
        }),
      ]);

      retweets.value = retweetData;
      likes.value = likeData;
      quotes.value = quoteData;
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
  }

  return {
    retweets,
    likes,
    quotes,
    filters,
    drawCount,
    loading,
    loadingStatus,
    retweetProgress,
    likeProgress,
    quoteProgress,
    lastTweetId,
    mergedUsers,
    qualifiedUsers,
    toggleFilter,
    performDraw,
    fetchInteractionData,
    cancelFetch,
    reset,
  };
}
