// Tests for the file-name check behind "New file" and "Rename" in index.html. Run: node --test tests/
// The function is loaded from index.html as-is; `tabs` stands in for the open tabs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const src = html.match(/function fileNameError\([\s\S]*?\n}\n/);
assert.ok(src, 'index.html must define fileNameError');
const make = tabs => new Function('tabs', `${src[0]}; return fileNameError;`)(tabs);

const self = { name: 'notes.md' }, other = { name: 'API.yaml' };
const check = make([self, other]);

test('valid names pass', () => {
  for (const n of ['notes.md', 'a.b.c.yaml', 'Dockerfile', 'São Paulo.csv', '  padded.md  ']) assert.equal(check(n, self, false), null, n);
});
test('empty name: allowed for new files only', () => {
  assert.equal(check('   ', null, true), null);
  assert.match(check('', self, false), /Enter a file name/);
});
test('path separators, reserved and control characters are refused', () => {
  for (const n of ['a/b.md', 'a\\b.md', 'c:d', 'what?.md', 'x*.md', '"q".md', '<img src=x onerror=alert(1)>.md', 'pipe|.md', 'tab\t.md']) assert.ok(check(n, self, false), n);
});
test('. and .. and over-long names are refused', () => {
  assert.ok(check('.', self, false));
  assert.ok(check('..', self, false));
  assert.ok(check('a'.repeat(256), self, false));
  assert.equal(check('a'.repeat(255), self, false), null);
});
test('a name another open tab uses is refused, case-insensitive; the tab itself is not a clash', () => {
  assert.match(check('api.YAML', self, false), /already open/);
  assert.equal(check('NOTES.md', self, false), null);
  assert.match(check('notes.md', null, true), /already open/);
});
