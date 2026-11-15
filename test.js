// Minimal tests for the keyword-of-the-day logic. Run with: node test.js
const assert = require('assert');
const fs = require('fs');
const { dayNumber, pickIndex, keywordId, START_DATE } = require('./app.js');

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log('ok - ' + name);
}

test('day number is 0 on the start date', () => {
  assert.strictEqual(dayNumber(new Date(2026, 10, 16)), 0);
});

test('day number increases by 1 each day', () => {
  assert.strictEqual(dayNumber(new Date(2026, 10, 17)), 1);
  assert.strictEqual(dayNumber(new Date(2026, 11, 16)), 30);
});

test('time of day does not change the day number', () => {
  assert.strictEqual(dayNumber(new Date(2026, 10, 20, 0, 0, 1)), 4);
  assert.strictEqual(dayNumber(new Date(2026, 10, 20, 23, 59, 59)), 4);
});

test('pickIndex wraps around the list', () => {
  assert.strictEqual(pickIndex(0, 30), 0);
  assert.strictEqual(pickIndex(29, 30), 29);
  assert.strictEqual(pickIndex(30, 30), 0);
  assert.strictEqual(pickIndex(65, 30), 5);
});

test('pickIndex handles negative days (dates before the start)', () => {
  assert.strictEqual(pickIndex(-1, 30), 29);
  assert.strictEqual(pickIndex(-31, 30), 29);
});

test('keywords.json is valid and well formed', () => {
  const data = JSON.parse(fs.readFileSync('./keywords.json', 'utf8'));
  assert.ok(Array.isArray(data) && data.length > 0);
  const ids = new Set();
  for (const k of data) {
    for (const field of ['keyword', 'language', 'definition', 'example']) {
      assert.ok(typeof k[field] === 'string' && k[field].trim() !== '', field + ' missing in ' + JSON.stringify(k));
    }
    ids.add(keywordId(k));
  }
  assert.strictEqual(ids.size, data.length, 'duplicate keyword + language pair');
});

console.log('\n' + passed + ' tests passed (start date: ' + new Date(START_DATE).toISOString().slice(0, 10) + ')');
