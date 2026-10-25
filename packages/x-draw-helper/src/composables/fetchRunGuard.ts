export interface FetchRun {
  id: number;
  controller: AbortController;
}

export interface FetchRunGuard {
  start: () => FetchRun;
  invalidate: () => void;
  isCurrent: (run: FetchRun) => boolean;
  finish: (run: FetchRun) => void;
}

export function abortError(): DOMException {
  return new DOMException('Aborted', 'AbortError');
}

export function createFetchRunGuard(): FetchRunGuard {
  let nextId = 0;
  let active: FetchRun | null = null;

  function start(): FetchRun {
    active?.controller.abort();
    const run = { id: ++nextId, controller: new AbortController() };
    active = run;
    return run;
  }

  function invalidate(): void {
    const run = active;
    active = null;
    nextId++;
    run?.controller.abort();
  }

  function isCurrent(run: FetchRun): boolean {
    return active?.id === run.id && !run.controller.signal.aborted;
  }

  function finish(run: FetchRun): void {
    if (active?.id === run.id) active = null;
  }

  return { start, invalidate, isCurrent, finish };
}
