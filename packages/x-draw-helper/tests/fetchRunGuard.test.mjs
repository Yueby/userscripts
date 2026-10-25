import test from 'node:test';
import assert from 'node:assert/strict';
import { abortError, createFetchRunGuard } from '../src/composables/fetchRunGuard.ts';

test('starting a new run aborts and detaches the old run', () => {
  const guard = createFetchRunGuard();
  const first = guard.start();
  assert.equal(guard.isCurrent(first), true);

  const second = guard.start();
  assert.equal(first.controller.signal.aborted, true);
  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), true);
  assert.equal(second.controller.signal.aborted, false);

  guard.finish(first);
  assert.equal(guard.isCurrent(second), true);
});

test('a superseded run cannot commit data over the new run', async () => {
  const guard = createFetchRunGuard();
  let state = { tweetId: 'A', users: [] };

  const runA = guard.start();
  const pendingA = Promise.resolve().then(() => {
    if (!guard.isCurrent(runA)) throw abortError();
    state = { tweetId: 'A', users: ['old'] };
  });

  const runB = guard.start();
  if (guard.isCurrent(runB)) state = { tweetId: 'B', users: ['new'] };
  await assert.rejects(pendingA, (error) => error.name === 'AbortError');
  assert.deepEqual(state, { tweetId: 'B', users: ['new'] });
});

test('invalidate aborts the active run and raises AbortError, not a source failure', () => {
  const guard = createFetchRunGuard();
  const run = guard.start();

  guard.invalidate();

  assert.equal(run.controller.signal.aborted, true);
  assert.equal(guard.isCurrent(run), false);
  assert.throws(() => {
    if (!guard.isCurrent(run)) throw abortError();
  }, (error) => error.name === 'AbortError' && error.message === 'Aborted');
});

test('finish only clears the run that still owns the guard', () => {
  const guard = createFetchRunGuard();
  const run = guard.start();

  guard.finish(run);
  assert.equal(guard.isCurrent(run), false);
  assert.equal(run.controller.signal.aborted, false);
});
