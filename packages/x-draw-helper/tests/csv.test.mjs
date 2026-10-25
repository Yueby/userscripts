import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCsv, escapeCsvCell, formatReplyComments } from '../src/utils/csv.ts';

test('CSV cells escape quotes, commas and newlines', () => {
  assert.equal(escapeCsvCell('plain'), '"plain"');
  assert.equal(escapeCsvCell('a,b'), '"a,b"');
  assert.equal(escapeCsvCell('say "hi"'), '"say ""hi"""');
  assert.equal(escapeCsvCell('line1\nline2'), '"line1\nline2"');
});

test('buildCsv emits a BOM and correctly quoted rows', () => {
  const csv = buildCsv([
    ['type', 'comment'],
    ['reply', 'say "hi",\nthen stop'],
  ]);

  assert.equal(csv, '\uFEFF"type","comment"\n"reply","say ""hi"",\nthen stop"');
});

test('all reply comments are exported as raw text joined by newlines', () => {
  assert.equal(formatReplyComments({
    replyComments: [
      { id: '1', text: 'first', createdAt: '', url: '' },
      { id: '2', text: 'second, "quoted"', createdAt: '', url: '' },
    ],
  }), 'first\nsecond, "quoted"');
  assert.equal(formatReplyComments({}), '');
});
