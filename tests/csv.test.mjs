// Tests for the CSV/TSV logic in index.html. Run: node --test tests/
// The functions live in index.html between the `<csv-core>` markers; this file loads that source as-is.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const core = html.match(/\/\/ <csv-core>.*\n([\s\S]*?)\/\/ <\/csv-core>/);
assert.ok(core, 'index.html must keep the // <csv-core> ... // </csv-core> markers');
const { parseDelimited, delimitedLineTokens } = new Function(`${core[1]}; return { parseDelimited, delimitedLineTokens };`)();

// Tokenize a whole document line by line, like Monaco does, and return the text of each token.
function spans(text, delim) {
  let state;
  return text.split(/\r?\n/).map(line => {
    const r = delimitedLineTokens(line, delim, state);
    state = r.state;
    return r.tokens.map((t, i) => [t.type, line.slice(t.start, r.tokens[i + 1]?.start ?? line.length)]);
  });
}

test('preview parser: commas', () => {
  assert.deepEqual(parseDelimited('a,b,c\n1,2,3', ','), [['a', 'b', 'c'], ['1', '2', '3']]);
});
test('preview parser: tabs', () => {
  assert.deepEqual(parseDelimited('a\tb\n1,5\t2', '\t'), [['a', 'b'], ['1,5', '2']]);
});
test('preview parser: quoted delimiter', () => {
  assert.deepEqual(parseDelimited('name,city\n"Doe, Jane","São Paulo, SP"', ','), [['name', 'city'], ['Doe, Jane', 'São Paulo, SP']]);
});
test('preview parser: doubled quotes', () => {
  assert.deepEqual(parseDelimited('q\n"say ""hi"""', ','), [['q'], ['say "hi"']]);
});
test('preview parser: empty fields', () => {
  assert.deepEqual(parseDelimited('a,,c\n,,', ','), [['a', '', 'c'], ['', '', '']]);
});
test('preview parser: CRLF line ends', () => {
  assert.deepEqual(parseDelimited('a,b\r\n1,2\r\n', ','), [['a', 'b'], ['1', '2']]);
});

test('editor tokens: commas give one colour per column and cycle after 8', () => {
  assert.deepEqual(spans('a,b,c', ','), [[['col.0', 'a'], ['delimiter', ','], ['col.1', 'b'], ['delimiter', ','], ['col.2', 'c']]]);
  const wide = spans('0,1,2,3,4,5,6,7,8,9', ',')[0].filter(([t]) => t !== 'delimiter').map(([t]) => t);
  assert.deepEqual(wide, ['col.0', 'col.1', 'col.2', 'col.3', 'col.4', 'col.5', 'col.6', 'col.7', 'col.0', 'col.1']);
});
test('editor tokens: tabs split TSV, commas do not', () => {
  assert.deepEqual(spans('a,1\tb', '\t'), [[['col.0', 'a,1'], ['delimiter', '\t'], ['col.1', 'b']]]);
});
test('editor tokens: a quoted delimiter stays inside its column', () => {
  assert.deepEqual(spans('"x, y",z', ','), [[['col.0', '"x, y"'], ['delimiter', ','], ['col.1', 'z']]]);
});
test('editor tokens: doubled quotes do not close the field', () => {
  assert.deepEqual(spans('"a "",b""",c', ','), [[['col.0', '"a "",b"""'], ['delimiter', ','], ['col.1', 'c']]]);
});
test('editor tokens: empty fields still advance the column', () => {
  assert.deepEqual(spans('a,,c', ','), [[['col.0', 'a'], ['delimiter', ',,'], ['col.2', 'c']]]);
  assert.deepEqual(spans(',b', ','), [[['delimiter', ','], ['col.1', 'b']]]);
});
test('editor tokens: each new line starts again at column 0 (CRLF too)', () => {
  assert.deepEqual(spans('a,b\r\nc,d', ','), [
    [['col.0', 'a'], ['delimiter', ','], ['col.1', 'b']],
    [['col.0', 'c'], ['delimiter', ','], ['col.1', 'd']],
  ]);
});
test('editor tokens: a quoted field that spans lines keeps its column', () => {
  assert.deepEqual(spans('a,"line 1\nline 2",b\nc', ','), [
    [['col.0', 'a'], ['delimiter', ','], ['col.1', '"line 1']],
    [['col.1', 'line 2"'], ['delimiter', ','], ['col.2', 'b']],
    [['col.0', 'c']],
  ]);
});
test('editor tokens and preview parser agree on the column count', () => {
  const doc = 'id,name,note\r\n1,"Doe, Jane","said ""ok"""\r\n2,,\r\n3,"multi\nline",x';
  const rows = parseDelimited(doc, ',');
  let state, counts = [], cols = 0;
  for (const line of doc.split(/\r?\n/)) {
    const r = delimitedLineTokens(line, ',', state);
    const delims = r.tokens.reduce((n, t, i) => t.type === 'delimiter' ? n + line.slice(t.start, r.tokens[i + 1]?.start ?? line.length).length : n, 0);
    cols += delims;
    state = r.state;
    if (!state.q) { counts.push(cols + 1); cols = 0; }
  }
  assert.deepEqual(counts, rows.map(r => r.length));
});
