// RUNLU Frontiers IV draft-only static QA. Run: node drafts/frontiers-season-04-qa-check.mjs
// No dependencies; reads repository files. Does not publish or modify anything.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const langs = ['zh','en','fr','es'];
const article = read('./frontiers-season-04-01-preview.html');
const index = read('./frontiers-season-04-index-preview.html');
const script = read('../runlu-language.js');
const count = (s, pattern) => [...s.matchAll(pattern)].length;
const errors = [];
const check = (label, fn) => {
  try { fn(); process.stdout.write('PASS ' + label + '\n'); }
  catch (error) { errors.push(label + ': ' + error.message); process.stderr.write('FAIL ' + label + ': ' + error.message + '\n'); }
};
for (const lang of langs) {
  const md = read('./frontiers-season-04-01-' + lang + '.md');
  check(lang + ' manuscript six sections', () => assert.equal(count(md, /^## /gm), 6));
  check(lang + ' article exists once', () => assert.equal(count(article, new RegExp('<article class="edition ' + lang + '" lang="' + lang + '">', 'g')), 1));
  check(lang + ' index exists once', () => assert.equal(count(index, new RegExp('<section class="edition ' + lang + '" lang="' + lang + '">', 'g')), 1));
}
check('article 24 headings', () => assert.equal(count(article, /<h2>/g), 24));
check('index 40 entries', () => assert.equal(count(index, /<div class="item">/g), 40));
check('four index-to-article links', () => assert.equal(count(index, /href="frontiers-season-04-01-preview.html"/g), 4));
check('four article-to-index links', () => assert.equal(count(article, /href="frontiers-season-04-index-preview.html"/g), 4));
for (const [name, html] of [['article', article], ['index', index]]) {
  check(name + ' remains noindex', () => assert.match(html, /name="robots" content="noindex,nofollow"/));
  check(name + ' uses shared language script', () => assert.match(html, /src="\.\.\/runlu-language\.js"/));
  check(name + ' language options', () => {
    for (const lang of langs) assert.match(html, new RegExp('<option value="' + lang + '">'));
  });
}
check('language script supports four languages', () => assert.match(script, /AVAILABLE=\['en','zh','fr','es'\]/));
check('language script binds select change', () => assert.match(script, /select\.addEventListener\('change'/));
check('no Spanish editorial status in article', () => assert.doesNotMatch(article, /Estado editorial:/));
process.stdout.write('\n' + (errors.length ? errors.length + ' failure(s)' : 'All static checks passed') + '\n');
if (errors.length) process.exitCode = 1;
