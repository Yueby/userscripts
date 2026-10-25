# x-draw-helper tests

Run with Node's built-in test runner (no extra dependencies):

```sh
node --test "packages/x-draw-helper/tests/*.test.mjs"
```

The `.mjs` tests import the pure TypeScript modules directly. Node 24 strips the
types at runtime, so `replies.ts`, `paginate.ts`, `user.ts`, `drawDataCore.ts`,
`replyComments.ts`, `csv.ts` and `historyCore.ts` must stay free of
browser/Greasemonkey imports. `historyStore.ts` only needs Vue reactivity, so
the history tests run against an in-memory storage mock.

`fixtures/tweet-detail.json` is an anonymized, minimal two-page TweetDetail
response. Only the fields needed by the parser are kept (tweet ids, direct
reply target, user core/avatar/bio/count/perspective fields, cursor types and
values, plus synthetic reply text used to test comment extraction). Real post
text, media, handles and profile data were removed. The original capture was
used only for a temporary local count check.
