import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterQualifiedUsers,
  mergeInteractionUsers,
  normalizeCachedData,
} from '../src/composables/drawDataCore.ts';
import { applyUserProfile } from '../src/utils/replyComments.ts';

function user(handle, overrides = {}) {
  return {
    id: `id-${handle}`,
    username: handle,
    handle,
    avatarUrl: '',
    bio: '',
    following: false,
    followed_by: false,
    followersCount: 0,
    followingCount: 0,
    ...overrides,
  };
}

function filters(overrides = {}) {
  return {
    followed_by: false,
    retweet: false,
    like: false,
    quote: false,
    reply: false,
    ...overrides,
  };
}

test('old cached interaction data without replies stays readable', () => {
  const oldCache = {
    retweets: [user('alice')],
    likes: [user('bob')],
    quotes: [],
    fetchedAt: 123,
  };

  assert.deepEqual(normalizeCachedData(oldCache), {
    retweets: [user('alice')],
    likes: [user('bob')],
    quotes: [],
    replies: [],
    fetchedAt: 123,
  });
  assert.deepEqual(normalizeCachedData(null), {
    retweets: [],
    likes: [],
    quotes: [],
    replies: [],
    fetchedAt: null,
  });
});

test('replies merge with existing sources, dedupe by handle and exclude the author', () => {
  const merged = mergeInteractionUsers({
    retweets: [user('alice'), user('Author')],
    likes: [user('ALICE')],
    quotes: [user('carol')],
    replies: [user('alice'), user('dave')],
  }, 'author');

  assert.deepEqual(merged.map((entry) => entry.handle).sort(), ['alice', 'carol', 'dave']);
  const alice = merged.find((entry) => entry.handle.toLowerCase() === 'alice');
  assert.equal(alice.hasRetweet, true);
  assert.equal(alice.hasLike, true);
  assert.equal(alice.hasReply, true);
  const dave = merged.find((entry) => entry.handle === 'dave');
  assert.equal(dave.hasReply, true);
  assert.equal(dave.hasRetweet, undefined);
});

test('loaded reply profiles enrich placeholder users without losing interaction flags', () => {
  const merged = mergeInteractionUsers({
    retweets: [user('alice', { bio: '' })],
    likes: [],
    quotes: [],
    replies: [user('alice', { bio: 'rich profile', profileLoaded: true, followersCount: 9 })],
  }, null);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].bio, 'rich profile');
  assert.equal(merged[0].followersCount, 9);
  assert.equal(merged[0].hasRetweet, true);
  assert.equal(merged[0].hasReply, true);
});

test('merges reply comments from every interaction source by comment id', () => {
  const comment = (id, text) => ({ id, text, createdAt: '', url: `https://x.com/alice/status/${id}` });
  const merged = mergeInteractionUsers({
    retweets: [user('alice', { replyComments: [comment('1', 'from retweet')] })],
    likes: [],
    quotes: [],
    replies: [user('alice', {
      profileLoaded: true,
      replyComments: [comment('1', 'from retweet'), comment('2', 'from reply')],
    })],
  }, null);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].profileLoaded, true);
  assert.deepEqual(merged[0].replyComments, [
    comment('1', 'from retweet'),
    comment('2', 'from reply'),
  ]);
});

test('cached reply comments survive reload and old caches without comments stay valid', () => {
  const comments = [{ id: '1', text: 'cached text', createdAt: 'now', url: 'https://x.com/alice/status/1' }];
  const normalized = normalizeCachedData({
    retweets: [user('alice'), { ...user('legacy'), replyComments: 'invalid' }],
    likes: [],
    quotes: [],
    replies: [user('bob', { replyComments: comments })],
    fetchedAt: 1,
  });

  assert.deepEqual(normalized.replies[0].replyComments, comments);
  assert.equal(normalized.retweets[0].replyComments, undefined);
  assert.equal(normalized.retweets[1].replyComments, undefined);
});

test('profile refresh preserves reply comments', () => {
  const comments = [{ id: '1', text: 'keep me', createdAt: '', url: '' }];
  const target = user('alice', { replyComments: comments });

  applyUserProfile(target, user('alice', { bio: 'fresh profile', profileLoaded: true }));

  assert.equal(target.bio, 'fresh profile');
  assert.equal(target.profileLoaded, true);
  assert.deepEqual(target.replyComments, comments);
});

test('reply filter is ANDed with existing filters while retweet+quote stays OR', () => {
  const makeUser = (handle, flags) => ({ ...user(handle), ...flags });
  const users = [
    makeUser('replyOnly', { hasReply: true }),
    makeUser('replyLike', { hasReply: true, hasLike: true }),
    makeUser('likeOnly', { hasLike: true }),
    makeUser('retweetOnly', { hasRetweet: true }),
    makeUser('quoteOnly', { hasQuote: true }),
    makeUser('retweetAndLike', { hasRetweet: true, hasLike: true }),
  ];

  assert.deepEqual(
    filterQualifiedUsers(users, filters({ reply: true })).map((entry) => entry.handle),
    ['replyOnly', 'replyLike'],
  );
  assert.deepEqual(
    filterQualifiedUsers(users, filters({ reply: true, like: true })).map((entry) => entry.handle),
    ['replyLike'],
  );
  assert.deepEqual(
    filterQualifiedUsers(users, filters({ retweet: true, quote: true })).map((entry) => entry.handle),
    ['retweetOnly', 'quoteOnly', 'retweetAndLike'],
  );
  assert.deepEqual(
    filterQualifiedUsers(users, filters({ reply: true, retweet: true, quote: true })).map((entry) => entry.handle),
    [],
  );
});

test('reply and followed_by filters combine with AND semantics', () => {
  const users = [
    { ...user('a', { followed_by: true }), hasReply: true },
    { ...user('b', { followed_by: false }), hasReply: true },
    { ...user('c', { followed_by: true }), hasReply: false },
  ];

  assert.deepEqual(
    filterQualifiedUsers(users, filters({ reply: true, followed_by: true })).map((entry) => entry.handle),
    ['a'],
  );
});

test('no active filters keeps the existing pass-through behaviour', () => {
  const users = [user('alice'), user('bob')];
  assert.deepEqual(filterQualifiedUsers(users, filters()), users);
});
