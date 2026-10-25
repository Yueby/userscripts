import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendHistoryEntry,
  buildHistoryTweetUrl,
  collectConfirmedWinStats,
  getWinCountFromStats,
  isExcludedWinner,
  listHistoryBuckets,
  loadAllHistory,
  normalizeHistoryEntry,
} from '../src/composables/historyCore.ts';
import { createHistoryStore } from '../src/composables/historyStore.ts';

const HISTORY_PREFIX = 'xd:history:';

function createStorage(initial = {}) {
  const map = new Map(Object.entries(initial).map(([key, value]) => [key, structuredClone(value)]));
  return {
    get(key, fallback) {
      return map.has(key) ? structuredClone(map.get(key)) : fallback;
    },
    set(key, value) {
      map.set(key, structuredClone(value));
    },
    remove(key) {
      map.delete(key);
    },
    list() {
      return [...map.keys()];
    },
  };
}

function winner(id, handle, replyComments) {
  return {
    id,
    handle,
    username: handle,
    avatarUrl: '',
    bio: '',
    following: false,
    followed_by: false,
    followersCount: 0,
    followingCount: 0,
    ...(replyComments ? { replyComments } : {}),
  };
}

function entry(id, tweetId, { winners, confirmed = true, timestamp = 1, filters } = {}) {
  return {
    id,
    tweetId,
    tweetUrl: `https://x.com/i/status/${tweetId}`,
    winners: winners ?? [],
    filters: {
      followed_by: false,
      retweet: false,
      like: false,
      quote: false,
      reply: false,
      ...filters,
    },
    totalParticipants: winners?.length ?? 0,
    timestamp,
    confirmed,
  };
}

const comment = (id, text) => ({ id, text, createdAt: 'now', url: `https://x.com/a/status/${id}` });

test('global history scans every bucket, normalizes old entries and sorts by timestamp', () => {
  const storage = createStorage({
    [`${HISTORY_PREFIX}A`]: [
      { ...entry('a-old', 'A', { timestamp: 10 }), filters: undefined, confirmed: undefined },
      entry('a-new', 'A', { timestamp: 30 }),
    ],
    [`${HISTORY_PREFIX}B`]: [entry('b-mid', 'B', { timestamp: 20 })],
    'xd:cache:A': { retweets: [] },
    'xd:dm-template': 'hello',
  });

  const history = loadAllHistory(storage);

  assert.deepEqual(history.map((item) => item.id), ['a-new', 'b-mid', 'a-old']);
  assert.equal(history[2].confirmed, true);
  assert.deepEqual(history[2].filters, {
    followed_by: false,
    retweet: false,
    like: false,
    quote: false,
    reply: false,
  });
  assert.deepEqual(listHistoryBuckets(storage).sort(), [`${HISTORY_PREFIX}A`, `${HISTORY_PREFIX}B`]);
});

test('confirmed wins count across posts, ignore unconfirmed/test records and dedupe per entry', () => {
  const entries = [
    entry('a1', 'A', {
      timestamp: 3,
      winners: [winner('1', 'alice'), winner('1', 'alice')],
    }),
    entry('b1', 'B', { timestamp: 2, winners: [winner('1', 'alice'), winner('2', 'bob')] }),
    entry('b2', 'B', { timestamp: 1, confirmed: false, winners: [winner('3', 'carol')] }),
  ];
  const stats = collectConfirmedWinStats(entries);

  assert.equal(getWinCountFromStats(stats, { id: '1', handle: 'alice' }), 2);
  assert.equal(getWinCountFromStats(stats, { id: '2', handle: 'bob' }), 1);
  assert.equal(getWinCountFromStats(stats, { id: '3', handle: 'carol' }), 0);
  assert.equal(getWinCountFromStats(stats, 'alice'), 2);
  assert.equal(stats.keys.has('id:1'), true);
  assert.equal(stats.keys.has('id:3'), false);
});

test('known ids stay distinct when handles match, while legacy handle-only records stay compatible', () => {
  const entries = [
    entry('a1', 'A', { winners: [winner('10', 'shared')] }),
    entry('a2', 'A', { winners: [winner('11', 'shared')] }),
    entry('c1', 'C', { winners: [winner('12', 'same-entry'), winner('13', 'same-entry')] }),
    entry('b1', 'B', { winners: [winner('', 'legacy')] }),
  ];
  const stats = collectConfirmedWinStats(entries);

  assert.equal(getWinCountFromStats(stats, { id: '10', handle: 'shared' }), 1);
  assert.equal(getWinCountFromStats(stats, { id: '11', handle: 'shared' }), 1);
  assert.equal(getWinCountFromStats(stats, { id: '999', handle: 'shared' }), 0);
  assert.equal(getWinCountFromStats(stats, { id: '12', handle: 'same-entry' }), 1);
  assert.equal(getWinCountFromStats(stats, { id: '13', handle: 'same-entry' }), 1);

  assert.equal(getWinCountFromStats(stats, { id: '20', handle: 'legacy' }), 1);
  assert.equal(getWinCountFromStats(stats, { id: '21', handle: 'legacy' }), 1);
  assert.equal(stats.keys.has('handle:legacy'), true);

  assert.equal(isExcludedWinner({ id: '10', handle: 'shared' }, stats.keys), true);
  assert.equal(isExcludedWinner({ id: '999', handle: 'shared' }, stats.keys), false);
  assert.equal(isExcludedWinner({ id: '20', handle: 'legacy' }, stats.keys), true);
});

test('same person changing handle still counts through the stable id', () => {
  const stats = collectConfirmedWinStats([
    entry('a1', 'A', { winners: [winner('77', 'old_handle')] }),
    entry('b1', 'B', { winners: [winner('77', 'new_handle')] }),
  ]);

  assert.equal(getWinCountFromStats(stats, { id: '77', handle: 'new_handle' }), 2);
  assert.equal(isExcludedWinner({ id: '77', handle: 'new_handle' }, stats.keys), true);
  assert.equal(stats.keys.has('handle:old_handle'), false);
});

test('all panel instances share one reactive history and see toggle/remove/clear immediately', () => {
  const storage = createStorage({
    [`${HISTORY_PREFIX}A`]: [entry('a1', 'A', { timestamp: 2 }), entry('a2', 'A', { timestamp: 1 })],
    [`${HISTORY_PREFIX}B`]: [entry('b1', 'B', { timestamp: 3 })],
    'xd:cache:A': { retweets: ['keep'] },
    'xd:dm-template': 'keep template',
  });
  const store = createHistoryStore(storage);
  const panelOne = store.history;
  const panelTwo = store.history;

  assert.equal(panelOne.value.map((item) => item.id).join(','), 'b1,a1,a2');

  store.toggleConfirm('b1');
  assert.equal(panelOne.value.find((item) => item.id === 'b1').confirmed, false);
  assert.equal(panelTwo.value.find((item) => item.id === 'b1').confirmed, false);

  store.removeEntry('a1');
  assert.deepEqual(panelOne.value.map((item) => item.id), ['b1', 'a2']);
  assert.deepEqual(panelTwo.value.map((item) => item.id), ['b1', 'a2']);

  store.clearHistory();
  assert.deepEqual(panelOne.value, []);
  assert.deepEqual(panelTwo.value, []);
  assert.deepEqual(storage.get('xd:cache:A'), { retweets: ['keep'] });
  assert.equal(storage.get('xd:dm-template'), 'keep template');
});

test('store win counts and confirmedWinnerKeys stay confirmed-only and reactive', () => {
  const storage = createStorage({
    [`${HISTORY_PREFIX}A`]: [entry('a1', 'A', { winners: [winner('1', 'alice')] })],
    [`${HISTORY_PREFIX}B`]: [entry('b1', 'B', { winners: [winner('1', 'alice')] })],
    [`${HISTORY_PREFIX}C`]: [entry('c1', 'C', { confirmed: false, winners: [winner('3', 'carol')] })],
  });
  const store = createHistoryStore(storage);

  assert.equal(store.getWinCount({ id: '1', handle: 'alice' }), 2);
  assert.equal(store.getWinCount({ id: '3', handle: 'carol' }), 0);
  assert.equal(store.confirmedWinnerKeys.value.has('id:1'), true);
  assert.equal(store.confirmedWinnerKeys.value.has('id:3'), false);

  store.toggleConfirm('a1');
  assert.equal(store.getWinCount({ id: '1', handle: 'alice' }), 1);
  assert.equal(store.history.value.find((item) => item.id === 'a1').confirmed, false);
});

test('addEntry writes to the supplied tweet bucket and keeps other buckets intact', () => {
  const storage = createStorage({
    [`${HISTORY_PREFIX}B`]: [entry('b1', 'B', { timestamp: 5 })],
  });
  const store = createHistoryStore(storage);

  const added = store.addEntry({
    tweetId: 'A',
    winners: [winner('1', 'alice', [comment('c1', 'comment text')])],
    filters: {
      followed_by: false,
      retweet: true,
      like: false,
      quote: false,
      reply: true,
    },
    totalParticipants: 9,
  });

  assert.equal(added.tweetId, 'A');
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}A`).map((item) => item.id), [added.id]);
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}B`).map((item) => item.id), ['b1']);
  assert.deepEqual(store.history.value[0].winners[0].replyComments, [comment('c1', 'comment text')]);
});

test('explicit tweetId toggles/removes the requested duplicate-id record only', () => {
  const storage = createStorage({
    [`${HISTORY_PREFIX}A`]: [entry('dup', 'A', { timestamp: 2, winners: [winner('1', 'alice')] })],
    [`${HISTORY_PREFIX}B`]: [entry('dup', 'B', { timestamp: 1, winners: [winner('2', 'bob')] })],
  });
  const store = createHistoryStore(storage);
  const originalA = structuredClone(storage.get(`${HISTORY_PREFIX}A`));

  store.toggleConfirm('dup', 'B');
  assert.equal(storage.get(`${HISTORY_PREFIX}B`)[0].confirmed, false);
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}A`), originalA);

  store.toggleConfirm('dup', 'B');
  assert.equal(storage.get(`${HISTORY_PREFIX}B`)[0].confirmed, true);
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}A`), originalA);

  store.removeEntry('dup', 'C');
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}B`).map((item) => item.id), ['dup']);
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}A`), originalA);

  store.removeEntry('dup', 'B');
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}B`), []);
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}A`), originalA);
  assert.deepEqual(store.history.value.map((item) => item.id), ['dup']);
});

test('explicit tweetId refuses entries whose record belongs to another bucket', () => {
  const storage = createStorage({
    [`${HISTORY_PREFIX}A`]: [entry('dup', 'A', { timestamp: 2 })],
    [`${HISTORY_PREFIX}B`]: [entry('dup', 'A', { timestamp: 1 })],
  });
  const store = createHistoryStore(storage);
  const original = structuredClone(storage.get(`${HISTORY_PREFIX}B`));

  store.toggleConfirm('dup', 'B');
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}B`), original);

  store.removeEntry('dup', 'B');
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}B`), original);
});

test('omitting tweetId keeps the legacy first-match behaviour', () => {
  const storage = createStorage({
    [`${HISTORY_PREFIX}A`]: [entry('dup', 'A', { timestamp: 2 })],
    [`${HISTORY_PREFIX}B`]: [entry('dup', 'B', { timestamp: 1 })],
  });
  const store = createHistoryStore(storage);

  store.removeEntry('dup');
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}A`), []);
  assert.deepEqual(storage.get(`${HISTORY_PREFIX}B`).map((item) => item.id), ['dup']);
});

test('history URLs stay clean and always point at the supplied tweet id', () => {
  assert.equal(
    buildHistoryTweetUrl('123', { pathname: '/alice/status/123/photo/1' }),
    'https://x.com/alice/status/123',
  );
  assert.equal(
    buildHistoryTweetUrl('123', { pathname: '/bob/status/999' }),
    'https://x.com/i/status/123',
  );
  assert.equal(buildHistoryTweetUrl('123', null), 'https://x.com/i/status/123');
});

test('addEntry stores a link for its own tweet even when another post is open', () => {
  const storage = createStorage();
  const store = createHistoryStore(storage);

  function withPathname(pathname, callback) {
    const previous = globalThis.window;
    globalThis.window = { location: { pathname } };
    try {
      callback();
    } finally {
      if (previous === undefined) delete globalThis.window;
      else globalThis.window = previous;
    }
  }

  const filtersUsed = {
    followed_by: false,
    retweet: false,
    like: false,
    quote: false,
    reply: false,
  };

  withPathname('/alice/status/123/photo/1', () => {
    const added = store.addEntry({
      tweetId: '123',
      winners: [],
      filters: filtersUsed,
      totalParticipants: 0,
    });
    assert.equal(added.tweetUrl, 'https://x.com/alice/status/123');
  });

  withPathname('/alice/status/111', () => {
    const added = store.addEntry({
      tweetId: '222',
      winners: [],
      filters: filtersUsed,
      totalParticipants: 0,
    });
    assert.equal(added.tweetUrl, 'https://x.com/i/status/222');
  });
});

test('per-post limits never truncate the global combined history', () => {
  const storage = createStorage();
  for (let index = 0; index < 60; index++) {
    appendHistoryEntry(storage, entry(`a-${index}`, 'A', { timestamp: index }));
    appendHistoryEntry(storage, entry(`b-${index}`, 'B', { timestamp: index + 100 }));
  }

  assert.equal(storage.get(`${HISTORY_PREFIX}A`).length, 60);
  assert.equal(storage.get(`${HISTORY_PREFIX}B`).length, 60);
  assert.equal(loadAllHistory(storage).length, 120);
});

test('last result lookup stays scoped to its own post in a global list', () => {
  const history = loadAllHistory(createStorage({
    [`${HISTORY_PREFIX}A`]: [entry('a1', 'A', { timestamp: 1 }), entry('a2', 'A', { timestamp: 4 })],
    [`${HISTORY_PREFIX}B`]: [entry('b1', 'B', { timestamp: 9 })],
  }));

  assert.equal(history[0].tweetId, 'B');
  assert.equal(history.find((item) => item.tweetId === 'A').id, 'a2');
});

test('normalizeHistoryEntry keeps reply comments and fills legacy defaults', () => {
  const normalized = normalizeHistoryEntry({
    id: 'x',
    tweetId: 'A',
    tweetUrl: '',
    winners: [winner('1', 'alice', [comment('c1', 'text')])],
    timestamp: 1,
  });

  assert.equal(normalized.confirmed, true);
  assert.equal(normalized.filters.reply, false);
  assert.deepEqual(normalized.winners[0].replyComments, [comment('c1', 'text')]);
});
