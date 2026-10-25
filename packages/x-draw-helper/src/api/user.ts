import type { User } from '../types';

export function getNumericField(result: Record<string, unknown>, ...keys: string[]): number | undefined {
  const queue: unknown[] = [result];
  const seen = new Set<object>();

  while (queue.length) {
    const value = queue.shift();
    if (!value || typeof value !== 'object' || seen.has(value)) continue;
    seen.add(value);

    const record = value as Record<string, unknown>;
    for (const key of keys) {
      const field = record[key];
      if (typeof field === 'number' && Number.isFinite(field)) return field;
    }
    queue.push(...Object.values(record));
  }

  return undefined;
}

export function userFromResult(result: Record<string, unknown>, legacy: Record<string, unknown>, core: Record<string, unknown>, perspectives: Record<string, unknown>, fallbackId = ''): User {
  const avatar = result.avatar as Record<string, unknown> | undefined;
  const profileBio = result.profile_bio as Record<string, unknown> | undefined;
  const relationshipCounts = result.relationship_counts as Record<string, unknown> | undefined;
  const followersCount = typeof relationshipCounts?.followers === 'number'
    ? relationshipCounts.followers
    : getNumericField(result, 'followers_count', 'followersCount');
  const followingCount = typeof relationshipCounts?.following === 'number'
    ? relationshipCounts.following
    : getNumericField(result, 'friends_count', 'following_count', 'followingCount');

  return {
    id: (result.rest_id as string) || fallbackId,
    username: (legacy.name || core.name || '') as string,
    handle: (legacy.screen_name || core.screen_name || (result.rest_id as string) || '') as string,
    avatarUrl: (legacy.profile_image_url_https || avatar?.image_url || '') as string,
    bio: (legacy.description || profileBio?.description || '') as string,
    following: Boolean(perspectives.following ?? legacy.following),
    followed_by: Boolean(perspectives.followed_by ?? legacy.followed_by),
    followersCount: followersCount ?? 0,
    followingCount: followingCount ?? 0,
    profileLoaded: followersCount !== undefined && followingCount !== undefined,
  };
}
