import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTweetDetailVariables, parseTweetDetailPage } from '../src/api/replies.ts';
import { paginateUsers } from '../src/api/paginate.ts';

const FOCAL_ID = '2096295151786467380';
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/tweet-detail.json', import.meta.url), 'utf8'));

function makeUser(handle, overrides = {}) {
  return {
    __typename: 'User',
    rest_id: `uid-${handle}`,
    core: {
      name: `Name ${handle}`,
      screen_name: handle,
      created_at: 'Sun Oct 25 00:00:00 +0000 2026',
    },
    avatar: { image_url: `https://img.test/${handle}.jpg` },
    profile_bio: { description: `Bio ${handle}` },
    relationship_counts: { followers: 12, following: 34 },
    relationship_perspectives: { following: true, followed_by: false },
    ...overrides,
  };
}

function makeTweet({
  id,
  replyTo,
  handle,
  quotedAuthor,
  mention,
  wrapped = false,
  user,
  text,
  noteText,
  createdAt = 'Sun Oct 25 00:00:00 +0000 2026',
}) {
  const tweet = {
    __typename: 'Tweet',
    rest_id: id,
    legacy: {
      id_str: id,
      created_at: createdAt,
      ...(typeof text === 'string' ? { full_text: text } : {}),
      ...(replyTo ? { in_reply_to_status_id_str: replyTo } : {}),
      ...(quotedAuthor ? { quoted_status_id_str: 'quoted-id' } : {}),
      ...(mention ? { entities: { user_mentions: [{ screen_name: mention }] } } : {}),
    },
    core: { user_results: { result: user ?? makeUser(handle) } },
  };
  if (noteText) {
    tweet.note_tweet = { note_tweet_results: { result: { text: noteText } } };
  }
  if (quotedAuthor) {
    tweet.quotedRefResult = {
      result: {
        rest_id: 'quoted-id',
        core: { user_results: { result: makeUser(quotedAuthor) } },
      },
    };
  }
  return wrapped ? { __typename: 'TweetWithVisibilityResults', tweet } : tweet;
}

function directEntry(id, result) {
  return { entryId: `tweet-${id}`, content: { itemContent: { tweet_results: { result } } } };
}

function moduleEntry(id, results) {
  return {
    entryId: `conversationthread-${id}`,
    content: {
      items: results.map((result, index) => ({
        entryId: `conversationthread-${id}-tweet-${index}`,
        item: { itemContent: { tweet_results: { result } } },
      })),
    },
  };
}

function cursorEntry(entryId, cursorType, value) {
  return { entryId, content: { cursorType, value } };
}

function makePage(instructions) {
  return { data: { threaded_conversation_with_injections_v2: { instructions } } };
}

function addEntries(entries) {
  return { type: 'TimelineAddEntries', entries };
}

function terminate(direction) {
  return { type: 'TimelineTerminateTimeline', direction };
}

test('captured-shape TweetDetail first page omits focal author and keeps ShowMoreThreads despite Top termination', () => {
  const page = parseTweetDetailPage(fixture.pages[0], fixture.focalTweetId);

  assert.equal(page.authorHandle, 'author');
  assert.deepEqual(page.users.map((user) => user.handle), ['reply_a']);
  assert.deepEqual(page.nextCursors, ['show-more-cursor-1']);
  assert.deepEqual(page.users[0].replyComments, [{
    id: '9000000000000000102',
    text: 'Reply A original text',
    createdAt: 'Sun Oct 25 01:02:03 +0000 2026',
    url: 'https://x.com/reply_a/status/9000000000000000102',
  }]);
});

test('captured-shape TweetDetail second page returns two more replies and stops on Bottom termination', () => {
  const page = parseTweetDetailPage(fixture.pages[1], fixture.focalTweetId, 'author');

  assert.deepEqual(page.users.map((user) => user.handle), ['reply_b', 'reply_c']);
  assert.deepEqual(page.nextCursors, []);
  assert.equal(page.users[0].replyComments?.[0].text, 'Reply B long-form note text');
  assert.equal(page.users[1].replyComments?.[0].text, 'Line one,\nLine "two" ok');
});

test('captured-shape TweetDetail traversal yields exactly three external reply authors', () => {
  const first = parseTweetDetailPage(fixture.pages[0], fixture.focalTweetId);
  const second = parseTweetDetailPage(fixture.pages[1], fixture.focalTweetId, first.authorHandle);
  const handles = [...first.users, ...second.users].map((user) => user.handle.toLowerCase()).sort();

  assert.deepEqual(handles, ['reply_a', 'reply_b', 'reply_c']);
  assert.equal([...first.users, ...second.users].some((user) => user.handle === 'author'), false);
});

test('committed fixture is anonymized and contains no real profile data', () => {
  const serialized = JSON.stringify(fixture);

  assert.equal(serialized.includes('yueby_'), false);
  assert.equal(serialized.includes('jose6556'), false);
  assert.equal(serialized.includes('pbs.twimg.com'), false);
  assert.equal(serialized.includes('"media"'), false);
  assert.equal(serialized.includes('Reply A original text'), true);
});

test('parses direct/module replies, unwraps visibility results and reads the new user shape', () => {
  const alice = makeTweet({ id: '101', replyTo: FOCAL_ID, handle: 'alice' });
  const bob = makeTweet({ id: '102', replyTo: FOCAL_ID, handle: 'bob', wrapped: true });
  const page = parseTweetDetailPage(makePage([
    addEntries([
      directEntry(FOCAL_ID, makeTweet({ id: FOCAL_ID, handle: 'author' })),
      directEntry('101', alice),
      moduleEntry('102', [bob]),
    ]),
  ]), FOCAL_ID);

  assert.equal(page.users.length, 2);
  const [first, second] = page.users;
  assert.equal(first.handle, 'alice');
  assert.equal(first.username, 'Name alice');
  assert.equal(first.avatarUrl, 'https://img.test/alice.jpg');
  assert.equal(first.bio, 'Bio alice');
  assert.equal(first.followersCount, 12);
  assert.equal(first.followingCount, 34);
  assert.equal(first.following, true);
  assert.equal(first.followed_by, false);
  assert.equal(first.profileLoaded, true);
  assert.equal(second.handle, 'bob');
});

test('keeps every direct comment from the same author and prefers note_tweet text', () => {
  const first = makeTweet({
    id: '201', replyTo: FOCAL_ID, handle: 'alice', text: 'first comment', createdAt: 'Sun Oct 25 01:00:00 +0000 2026',
  });
  const second = makeTweet({
    id: '202', replyTo: FOCAL_ID, handle: 'alice', text: 'truncated', noteText: 'long-form second comment',
  });
  const page = parseTweetDetailPage(makePage([
    addEntries([
      directEntry(FOCAL_ID, makeTweet({ id: FOCAL_ID, handle: 'author' })),
      moduleEntry('alice', [first, second]),
    ]),
  ]), FOCAL_ID);

  assert.equal(page.users.length, 1);
  assert.deepEqual(page.users[0].replyComments, [
    {
      id: '201',
      text: 'first comment',
      createdAt: 'Sun Oct 25 01:00:00 +0000 2026',
      url: 'https://x.com/alice/status/201',
    },
    {
      id: '202',
      text: 'long-form second comment',
      createdAt: 'Sun Oct 25 00:00:00 +0000 2026',
      url: 'https://x.com/alice/status/202',
    },
  ]);
});

test('never mixes quoted text, mentions or fabricated text into reply comments', () => {
  const reply = makeTweet({
    id: '203',
    replyTo: FOCAL_ID,
    handle: 'alice',
    text: 'real reply text',
    quotedAuthor: 'quoted_author',
    mention: 'someone',
  });
  reply.quotedRefResult.result.legacy = { full_text: 'quoted text must not leak' };

  const empty = makeTweet({ id: '204', replyTo: FOCAL_ID, handle: 'bob' });
  const page = parseTweetDetailPage(makePage([
    addEntries([
      directEntry(FOCAL_ID, makeTweet({ id: FOCAL_ID, handle: 'author' })),
      moduleEntry('alice', [reply]),
      moduleEntry('bob', [empty]),
    ]),
  ]), FOCAL_ID);

  assert.equal(page.users[0].replyComments?.[0].text, 'real reply text');
  assert.equal(page.users[0].replyComments?.[0].text.includes('quoted'), false);
  assert.equal(page.users[1].replyComments?.[0].text, '');
});

test('merges the same author comments across pages by comment id', async () => {
  const firstPage = parseTweetDetailPage(makePage([
    addEntries([
      directEntry(FOCAL_ID, makeTweet({ id: FOCAL_ID, handle: 'author' })),
      moduleEntry('alice', [
        makeTweet({ id: '301', replyTo: FOCAL_ID, handle: 'alice', text: 'page one' }),
      ]),
      cursorEntry('cursor-bottom-1', 'Bottom', 'next-page'),
    ]),
  ]), FOCAL_ID);
  const secondPage = parseTweetDetailPage(makePage([
    addEntries([
      moduleEntry('alice', [
        makeTweet({ id: '301', replyTo: FOCAL_ID, handle: 'alice', text: 'page one' }),
        makeTweet({ id: '302', replyTo: FOCAL_ID, handle: 'alice', text: 'page two' }),
      ]),
    ]),
  ]), FOCAL_ID);
  const pages = { start: firstPage, 'next-page': secondPage };

  const users = await paginateUsers({
    buildUrl: (cursor) => `https://x.test/${cursor ?? 'start'}`,
    parsePage: (data) => pages[data.key],
    fetchFn: async (url) => ({
      ok: true,
      json: async () => ({ key: String(url).split('/').pop() }),
    }),
    headers: {},
    maxRetries: 1,
  });

  assert.equal(users.length, 1);
  assert.deepEqual(users[0].replyComments?.map((comment) => comment.id), ['301', '302']);
  assert.deepEqual(users[0].replyComments?.map((comment) => comment.text), ['page one', 'page two']);
});

test('excludes focal author, nested replies, quote authors and mention-only posts', () => {
  const page = parseTweetDetailPage(makePage([
    addEntries([
      directEntry(FOCAL_ID, makeTweet({ id: FOCAL_ID, handle: 'author' })),
      directEntry('103', makeTweet({ id: '103', replyTo: FOCAL_ID, handle: 'author' })),
      directEntry('104', makeTweet({ id: '104', replyTo: '101', handle: 'nested' })),
      directEntry('105', makeTweet({ id: '105', handle: 'quoter', quotedAuthor: 'quoted' })),
      directEntry('106', makeTweet({ id: '106', handle: 'mentioner', mention: 'author' })),
      directEntry('107', makeTweet({ id: '107', replyTo: FOCAL_ID, handle: 'valid' })),
    ]),
  ]), FOCAL_ID);

  assert.deepEqual(page.users.map((user) => user.handle), ['valid']);
});

test('deduplicates repeated users within one page', () => {
  const sameUser = makeUser('dupe');
  const page = parseTweetDetailPage(makePage([
    addEntries([
      directEntry(FOCAL_ID, makeTweet({ id: FOCAL_ID, handle: 'author' })),
      directEntry('108', makeTweet({ id: '108', replyTo: FOCAL_ID, handle: 'dupe', user: sameUser })),
      moduleEntry('109', [
        makeTweet({ id: '109', replyTo: FOCAL_ID, handle: 'dupe', user: sameUser }),
      ]),
    ]),
  ]), FOCAL_ID);

  assert.deepEqual(page.users.map((user) => user.handle), ['dupe']);
});

test('Top termination does not stop; Bottom termination does; Bottom is used when not terminated', () => {
  const entries = [
    cursorEntry('cursor-top-1', 'Top', 'top-cursor'),
    cursorEntry('cursor-showmore-1', 'ShowMoreThreads', 'show-more-cursor'),
    cursorEntry('cursor-bottom-1', 'Bottom', 'bottom-cursor'),
  ];

  const topOnly = parseTweetDetailPage(makePage([
    addEntries(entries),
    terminate('Top'),
  ]), FOCAL_ID);
  assert.deepEqual(topOnly.nextCursors, ['show-more-cursor', 'bottom-cursor']);

  const bottomTerminated = parseTweetDetailPage(makePage([
    addEntries(entries),
    terminate('Bottom'),
  ]), FOCAL_ID);
  assert.deepEqual(bottomTerminated.nextCursors, []);

  const bottomOnly = parseTweetDetailPage(makePage([
    addEntries([cursorEntry('cursor-bottom-2', 'Bottom', 'bottom-only')]),
  ]), FOCAL_ID);
  assert.deepEqual(bottomOnly.nextCursors, ['bottom-only']);
});

test('throws on GraphQL errors instead of caching an empty reply list', () => {
  assert.throws(
    () => parseTweetDetailPage({ errors: [{ message: 'boom' }] }, FOCAL_ID),
    /tweetDetailErrors:boom/,
  );
  assert.throws(
    () => parseTweetDetailPage({ data: {}, errors: [{}] }, FOCAL_ID),
    /tweetDetailErrors:unknown/,
  );
});

test('throws when the TweetDetail instructions are missing or malformed', () => {
  assert.throws(() => parseTweetDetailPage({}, FOCAL_ID), /tweetDetailInstructionsMissing/);
  assert.throws(
    () => parseTweetDetailPage({ data: { threaded_conversation_with_injections_v2: {} } }, FOCAL_ID),
    /tweetDetailInstructionsMissing/,
  );
  assert.throws(
    () => parseTweetDetailPage(makePage('not-an-array'), FOCAL_ID),
    /tweetDetailInstructionsMissing/,
  );
  assert.throws(
    () => parseTweetDetailPage(makePage([]), FOCAL_ID),
    /tweetDetailInstructionsMissing/,
  );
  assert.throws(
    () => parseTweetDetailPage(makePage([{ type: 'TimelineAddEntries' }]), FOCAL_ID),
    /tweetDetailInstructionsMissing/,
  );
});

test('accepts a genuinely empty AddEntries page', () => {
  const page = parseTweetDetailPage(makePage([addEntries([])]), FOCAL_ID, 'author');

  assert.deepEqual(page.users, []);
  assert.deepEqual(page.nextCursors, []);
  assert.equal(page.authorHandle, 'author');
});

test('accepts terminal-only instructions as an empty page', () => {
  const page = parseTweetDetailPage(makePage([terminate('Bottom')]), FOCAL_ID);

  assert.deepEqual(page.users, []);
  assert.deepEqual(page.nextCursors, []);
});

test('TweetDetail variables match the captured request contract', () => {
  assert.deepEqual(buildTweetDetailVariables(FOCAL_ID), {
    focalTweetId: FOCAL_ID,
    with_rux_injections: false,
    rankingMode: 'Relevance',
    includePromotedContent: true,
    withCommunity: true,
    withQuickPromoteEligibilityTweetFields: true,
    withBirdwatchNotes: true,
    withVoice: true,
  });
  assert.deepEqual(buildTweetDetailVariables(FOCAL_ID, 'abc'), {
    focalTweetId: FOCAL_ID,
    with_rux_injections: false,
    rankingMode: 'Relevance',
    includePromotedContent: true,
    withCommunity: true,
    withQuickPromoteEligibilityTweetFields: true,
    withBirdwatchNotes: true,
    withVoice: true,
    cursor: 'abc',
    referrer: 'tweet',
  });
});

test('paginate follows branching cursors, dedupes users and stops on cursor loops', async () => {
  const user = (handle) => ({
    id: `id-${handle}`,
    username: handle,
    handle,
    avatarUrl: '',
    bio: '',
    following: false,
    followed_by: false,
    followersCount: 0,
    followingCount: 0,
  });
  const pages = {
    start: { users: [user('root')], nextCursors: ['a', 'b'] },
    a: { users: [user('root'), user('a')], nextCursors: ['c'] },
    b: { users: [user('b')], nextCursor: null },
    c: { users: [user('c')], nextCursors: ['a'] },
  };
  const requested = [];

  const result = await paginateUsers({
    buildUrl: (cursor) => `https://x.test/${cursor ?? 'start'}`,
    parsePage: (data) => pages[data.key],
    fetchFn: async (url) => {
      const key = String(url).split('/').pop();
      requested.push(key);
      return { ok: true, json: async () => ({ key }) };
    },
    headers: {},
    maxRetries: 1,
  });

  assert.deepEqual(requested, ['start', 'a', 'b', 'c']);
  assert.deepEqual(result.map((entry) => entry.handle), ['root', 'a', 'b', 'c']);
});

test('paginate still honours abort signals', async () => {
  const controller = new AbortController();
  controller.abort();
  let fetched = false;

  await assert.rejects(
    paginateUsers({
      buildUrl: () => 'https://x.test/start',
      parsePage: () => ({ users: [], nextCursor: null }),
      fetchFn: async () => {
        fetched = true;
        return { ok: true, json: async () => ({}) };
      },
      headers: {},
      maxRetries: 1,
      signal: controller.signal,
    }),
    (error) => error.name === 'AbortError',
  );
  assert.equal(fetched, false);
});
