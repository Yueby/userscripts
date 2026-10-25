import type { ReplyComment, User } from '../types';
import { mergeReplyComments, mergeUserPreservingComments } from '../utils/replyComments.ts';
import { userFromResult } from './user.ts';

export interface ReplyTimelinePage {
  users: User[];
  nextCursors: string[];
  authorHandle: string | null;
}

export function buildTweetDetailVariables(
  focalTweetId: string,
  cursor?: string | null,
): Record<string, unknown> {
  const variables: Record<string, unknown> = {
    focalTweetId,
    with_rux_injections: false,
    rankingMode: 'Relevance',
    includePromotedContent: true,
    withCommunity: true,
    withQuickPromoteEligibilityTweetFields: true,
    withBirdwatchNotes: true,
    withVoice: true,
  };
  if (cursor) {
    variables.cursor = cursor;
    variables.referrer = 'tweet';
  }
  return variables;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function unwrapTweet(result: unknown): Record<string, unknown> | null {
  const raw = asRecord(result);
  if (!raw) return null;
  if (raw.__typename === 'TweetWithVisibilityResults') {
    return asRecord(raw.tweet);
  }
  return raw;
}

function getTweetResults(entry: unknown): unknown[] {
  const content = asRecord(asRecord(entry)?.content);
  if (!content) return [];

  const results: unknown[] = [];
  if (Array.isArray(content.items)) {
    for (const item of content.items) {
      const itemContent = asRecord(asRecord(asRecord(item)?.item)?.itemContent);
      const result = asRecord(itemContent?.tweet_results)?.result;
      if (result) results.push(result);
    }
  }

  const directResult = asRecord(asRecord(content.itemContent)?.tweet_results)?.result;
  if (directResult) results.push(directResult);

  return results;
}

function getAuthorHandle(tweet: Record<string, unknown>): string | null {
  const userResult = asRecord(asRecord(asRecord(tweet.core)?.user_results)?.result);
  const core = asRecord(userResult?.core);
  const legacy = asRecord(userResult?.legacy);
  const handle = core?.screen_name || legacy?.screen_name;
  return typeof handle === 'string' && handle ? handle : null;
}

function getCommentText(tweet: Record<string, unknown>): string {
  const noteResult = asRecord(
    asRecord(asRecord(tweet.note_tweet)?.note_tweet_results)?.result,
  );
  const noteText = noteResult?.text;
  if (typeof noteText === 'string' && noteText.length > 0) return noteText;

  const fullText = asRecord(tweet.legacy)?.full_text;
  return typeof fullText === 'string' ? fullText : '';
}

function commentFromTweet(
  tweet: Record<string, unknown>,
  tweetId: string,
  authorHandle: string,
): ReplyComment | null {
  if (!tweetId || !authorHandle) return null;
  const legacy = asRecord(tweet.legacy) ?? {};
  return {
    id: tweetId,
    text: getCommentText(tweet),
    createdAt: typeof legacy.created_at === 'string' ? legacy.created_at : '',
    url: `https://x.com/${authorHandle}/status/${tweetId}`,
  };
}

function getCursors(entries: unknown[]): { showMore: string[]; bottom: string[] } {
  const showMore: string[] = [];
  const bottom: string[] = [];

  for (const entry of entries) {
    const content = asRecord(asRecord(entry)?.content);
    const value = content?.value;
    if (typeof value !== 'string' || !value) continue;
    if (content?.cursorType === 'ShowMoreThreads') showMore.push(value);
    else if (content?.cursorType === 'Bottom') bottom.push(value);
  }

  return { showMore, bottom };
}

function hasBottomTermination(instructions: unknown[]): boolean {
  return instructions.some((instruction) => {
    const record = asRecord(instruction);
    if (record?.type !== 'TimelineTerminateTimeline') return false;
    // Top only ends upward threading; it must not stop downward reply pagination.
    return String(record.direction ?? '').toLowerCase() !== 'top';
  });
}

function getGraphqlErrorMessage(data: unknown): string | null {
  const errors = asRecord(data)?.errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;
  const messages = errors
    .map((error) => asRecord(error)?.message)
    .filter((message): message is string => typeof message === 'string' && message.length > 0);
  return messages.join('; ') || 'unknown';
}

export function parseTweetDetailPage(
  data: unknown,
  focalTweetId: string,
  knownAuthorHandle: string | null = null,
): ReplyTimelinePage {
  const graphqlError = getGraphqlErrorMessage(data);
  if (graphqlError) throw new Error(`tweetDetailErrors:${graphqlError}`);

  const instructions = asRecord(asRecord(asRecord(data)?.data)?.threaded_conversation_with_injections_v2)?.instructions;
  if (!Array.isArray(instructions)) throw new Error('tweetDetailInstructionsMissing');

  const addEntries = instructions
    .map(asRecord)
    .find((instruction) => instruction?.type === 'TimelineAddEntries');

  if (!addEntries) {
    const terminated = instructions.some(
      (instruction) => asRecord(instruction)?.type === 'TimelineTerminateTimeline',
    );
    if (terminated) return { users: [], nextCursors: [], authorHandle: knownAuthorHandle };
    throw new Error('tweetDetailInstructionsMissing');
  }
  if (!Array.isArray(addEntries.entries)) throw new Error('tweetDetailInstructionsMissing');

  const entries = addEntries.entries;

  const tweets: Record<string, unknown>[] = [];
  let authorHandle = knownAuthorHandle;

  for (const entry of entries) {
    for (const result of getTweetResults(entry)) {
      const tweet = unwrapTweet(result);
      if (!tweet) continue;

      const legacy = asRecord(tweet.legacy) ?? {};
      const tweetId = String(tweet.rest_id ?? legacy.id_str ?? '');
      if (tweetId === focalTweetId) {
        authorHandle = getAuthorHandle(tweet) ?? authorHandle;
        continue;
      }
      tweets.push(tweet);
    }
  }

  const authorKey = authorHandle?.toLowerCase() ?? null;
  const usersByKey = new Map<string, User>();

  for (const tweet of tweets) {
    const legacy = asRecord(tweet.legacy) ?? {};
    // Only direct replies to the focal post count. Nested replies, quotes and
    // mention-only posts are intentionally not inspected recursively.
    if (String(legacy.in_reply_to_status_id_str ?? '') !== focalTweetId) continue;

    const userResult = asRecord(asRecord(asRecord(tweet.core)?.user_results)?.result);
    if (!userResult) continue;

    const core = asRecord(userResult.core) ?? {};
    const userLegacy = asRecord(userResult.legacy) ?? {};
    const perspectives = asRecord(userResult.relationship_perspectives) ?? {};
    const user = userFromResult(userResult, userLegacy, core, perspectives);

    if (!user.handle) continue;
    if (authorKey && user.handle.toLowerCase() === authorKey) continue;

    const key = user.id || user.handle.toLowerCase();
    const existing = usersByKey.get(key);
    const merged = existing
      ? mergeUserPreservingComments(existing, user)
      : { ...user, replyComments: [] as ReplyComment[] };

    const tweetId = String(tweet.rest_id ?? legacy.id_str ?? '');
    const comment = commentFromTweet(tweet, tweetId, user.handle);
    if (comment) {
      merged.replyComments = mergeReplyComments(merged.replyComments, [comment]);
    }
    usersByKey.set(key, merged);
  }

  const users = Array.from(usersByKey.values());

  const { showMore, bottom } = getCursors(entries);
  const nextCursors = hasBottomTermination(instructions)
    ? []
    : Array.from(new Set([...showMore, ...bottom]));

  return { users, nextCursors, authorHandle };
}
