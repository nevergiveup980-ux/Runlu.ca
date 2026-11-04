// Dependency-free Node.js regression checks for campaign-tracker.js.
// Run: node book/campaign-tracker.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/campaign-tracker.js', 'utf8');

function run(query) {
  const handlers = {};
  const emitted = [];
  const window = {
    location: { search: query },
    dispatchEvent: event => emitted.push(event)
  };
  const document = {
    addEventListener: (name, handler) => { handlers[name] = handler; }
  };
  class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options.detail; }
  }
  const context = { window, document, CustomEvent, URLSearchParams };
  vm.runInNewContext(source, context);
  const link = { dataset: { runluStore: 'apple-books' } };
  handlers.click({ target: { closest: selector => selector === 'a[data-runlu-store]' ? link : null } });
  return { attribution: window.RUNLU_CAMPAIGN.attribution, emitted };
}

const tiktok = run('?utm_source=tiktok&utm_medium=organic_social&utm_campaign=glass_throne_launch');
assert.equal(tiktok.attribution.utm_source, 'tiktok');
assert.equal(tiktok.attribution.utm_campaign, 'glass_throne_launch');
assert.equal(tiktok.emitted.length, 1);
assert.equal(tiktok.emitted[0].detail.event, 'runlu_store_click');
assert.equal(tiktok.emitted[0].detail.store, 'apple-books');
assert.equal(tiktok.emitted[0].detail.book, 'the-glass-throne');

const x = run('?utm_source=x');
assert.equal(x.attribution.utm_source, 'x');

const invalid = run('?utm_source=%3Cscript%3E&utm_campaign=' + 'a'.repeat(100));
assert.equal(Object.keys(invalid.attribution).length, 0);

const blank = run('');
assert.equal(Object.keys(blank.attribution).length, 0);
console.log('Campaign tracker regression checks passed.');
