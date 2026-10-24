// Run with: node tests/discovery-smoke.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('index.html');
const js = read('runlu-discovery.js');
const css = read('runlu-discovery.css');
assert.match(html, /id="runluDiscoveryGrid"/);
assert.match(html, /runlu-discovery\.css\?v=20261023/);
assert.match(html, /runlu-discovery\.js\?v=20261023/);
for (const language of ['en', 'zh', 'fr', 'es']) {
  assert.match(html, new RegExp('data-' + language + '='));
  assert.match(js, new RegExp('\\b' + language + ':'));
}
for (const href of ['book/', 'frontiers.html', 'digital.html']) {
  assert.ok(js.includes("href:'" + href + "'"), href);
  assert.ok(fs.existsSync(path.join(root, href)), 'missing local destination: ' + href);
}
assert.doesNotMatch(js, /\bfetch\s*\(|sendBeacon|document\.cookie|localStorage/);
assert.match(js, /MutationObserver/);
assert.match(css, /:focus-visible/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /max-width:760px/);
console.log('RUNLU Discovery smoke checks passed');
