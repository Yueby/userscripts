import type { InteractionData } from '../types';
import { formatFileTimestamp } from '../utils/format';
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
        t('followers'),
        t('followingLabel'),
      ],
    ];

    const userRow = (type: string, user: InteractionData['retweets'][number]) => [
      type,
      user.username,
      user.handle,
      user.avatarUrl,
      user.bio,
      user.following ? t('yes') : t('no'),
      user.followed_by ? t('yes') : t('no'),
      String(user.followersCount),
      String(user.followingCount),
    ];

    for (const user of data.retweets) rows.push(userRow(t('retweetType'), user));
    for (const user of data.likes) rows.push(userRow(t('likeType'), user));
    for (const user of data.quotes) rows.push(userRow(t('quoteType'), user));

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
    link.download = `x_draw_data_${formatFileTimestamp()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return { exportCsv };
}
