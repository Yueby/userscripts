import type { ReplyComment, User } from '../types';

export function normalizeReplyComments(value: unknown): ReplyComment[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const byId = new Map<string, ReplyComment>();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id : '';
    if (!id) continue;
    const comment: ReplyComment = {
      id,
      text: typeof record.text === 'string' ? record.text : '',
      createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
      url: typeof record.url === 'string' ? record.url : '',
    };
    const existing = byId.get(id);
    if (!existing || (!existing.text && comment.text)) byId.set(id, comment);
  }

  return Array.from(byId.values());
}

export function mergeReplyComments(
  first: ReplyComment[] | undefined,
  second: ReplyComment[] | undefined,
): ReplyComment[] | undefined {
  if (first === undefined && second === undefined) return undefined;

  const byId = new Map<string, ReplyComment>();
  for (const comment of [...(first ?? []), ...(second ?? [])]) {
    const existing = byId.get(comment.id);
    if (!existing || (!existing.text && comment.text)) byId.set(comment.id, comment);
  }
  return Array.from(byId.values());
}

export function mergeUserPreservingComments(existing: User, incoming: User): User {
  const comments = mergeReplyComments(existing.replyComments, incoming.replyComments);
  const merged = incoming.profileLoaded && !existing.profileLoaded
    ? { ...existing, ...incoming }
    : { ...existing };
  if (comments !== undefined) merged.replyComments = comments;
  return merged;
}

export function applyUserProfile(target: User, profile: User): void {
  const comments = target.replyComments;
  Object.assign(target, profile, { profileLoaded: true });
  if (comments !== undefined) target.replyComments = comments;
}
