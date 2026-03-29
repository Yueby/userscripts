import type { InteractionData } from '../types';
import { useI18n } from './useI18n';

export function useExport() {
  const { t } = useI18n();

  function exportCsv(data: InteractionData) {
    const rows: string[][] = [
      [
        t('interactionType'),
        t('username'),
        t('handle'),
        t('avatarUrl'),
        t('bio'),
        t('following'),
        t('followingYou'),
      ],
    ];

    for (const user of data.retweets) {
      rows.push([
        t('retweetType'),
        user.username,
        user.handle,
        user.avatarUrl,
        user.bio,
        user.following ? t('yes') : t('no'),
        user.followed_by ? t('yes') : t('no'),
      ]);
    }

    for (const user of data.likes) {
      rows.push([
        t('likeType'),
        user.username,
        user.handle,
        user.avatarUrl,
        user.bio,
        user.following ? t('yes') : t('no'),
        user.followed_by ? t('yes') : t('no'),
      ]);
    }

    for (const user of data.quotes) {
      rows.push([
        t('quoteType'),
        user.username,
        user.handle,
        user.avatarUrl,
        user.bio,
        user.following ? t('yes') : t('no'),
        user.followed_by ? t('yes') : t('no'),
      ]);
    }

    const csvContent =
      '\uFEFF' +
      rows
        .map((row) =>
          row
            .map((cell) =>
              typeof cell === 'string'
                ? `"${cell.replace(/"/g, '""')}"`
                : cell
            )
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    link.download = `x_draw_data_${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return { exportCsv };
}
