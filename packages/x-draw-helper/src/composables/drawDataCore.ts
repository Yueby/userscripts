import type { DrawUser, Filters, User } from '../types';
import { mergeReplyComments, normalizeReplyComments } from '../utils/replyComments.ts';

export interface InteractionSources {
  retweets: User[];
  likes: User[];
  quotes: User[];
  replies: User[];
}

export interface CachedInteractionData {
  retweets: User[];
  likes: User[];
  quotes: User[];
  replies?: User[];
  fetchedAt: number;
}

export interface NormalizedCachedData {
  retweets: User[];
  likes: User[];
  quotes: User[];
  replies: User[];
  fetchedAt: number | null;
}

function asUsers(value: unknown): User[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is User => Boolean(item) && typeof item === 'object')
    .map((user) => {
      const comments = normalizeReplyComments(user.replyComments);
      return comments === undefined && user.replyComments === undefined
        ? user
        : { ...user, replyComments: comments };
    });
}

export function normalizeCachedData(
  cached: Partial<CachedInteractionData> | null | undefined,
): NormalizedCachedData {
  return {
    retweets: asUsers(cached?.retweets),
    likes: asUsers(cached?.likes),
    quotes: asUsers(cached?.quotes),
    replies: asUsers(cached?.replies),
    fetchedAt: typeof cached?.fetchedAt === 'number' ? cached.fetchedAt : null,
  };
}

export function mergeInteractionUsers(
  sources: InteractionSources,
  authorHandle: string | null,
): DrawUser[] {
  const map = new Map<string, DrawUser>();
  const authorKey = authorHandle?.toLowerCase();

  function mergeUser(user: User, interaction: 'hasRetweet' | 'hasLike' | 'hasQuote' | 'hasReply') {
    const handleKey = user.handle.toLowerCase();
    if (authorKey && handleKey === authorKey) return;

    const existing = map.get(handleKey);
    if (!existing) {
      map.set(handleKey, { ...user, [interaction]: true });
      return;
    }

    const comments = mergeReplyComments(existing.replyComments, user.replyComments);
    if (user.profileLoaded && !existing.profileLoaded) {
      Object.assign(existing, user);
    }
    if (comments !== undefined) existing.replyComments = comments;
    existing[interaction] = true;
  }

  sources.retweets.forEach((user) => mergeUser(user, 'hasRetweet'));
  sources.likes.forEach((user) => mergeUser(user, 'hasLike'));
  sources.quotes.forEach((user) => mergeUser(user, 'hasQuote'));
  sources.replies.forEach((user) => mergeUser(user, 'hasReply'));
  return Array.from(map.values());
}

export function filterQualifiedUsers(users: DrawUser[], filters: Filters): DrawUser[] {
  const hasActive = Object.values(filters).some(Boolean);
  if (!hasActive) return users;

  return users.filter((user) => {
    if (filters.followed_by && !user.followed_by) return false;
    if (filters.like && !user.hasLike) return false;
    if (filters.reply && !user.hasReply) return false;
    // Quotes count as retweets: when both active, OR logic
    if (filters.retweet && filters.quote) {
      if (!user.hasRetweet && !user.hasQuote) return false;
    } else {
      if (filters.retweet && !user.hasRetweet) return false;
      if (filters.quote && !user.hasQuote) return false;
    }
    return true;
  });
}
