import type { User } from '../types';

export function escapeCsvCell(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function buildCsv(rows: readonly (readonly string[])[]): string {
  return '\uFEFF' + rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

export function formatReplyComments(user: Pick<User, 'replyComments'>): string {
  return (user.replyComments ?? []).map((comment) => comment.text).join('\n');
}
