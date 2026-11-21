#!/usr/bin/env node
// RUNLU STORIES: first Philosophy in Everyday Life article, source-level acceptance.
// Run: node scripts/check-stories-philosophy.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('notes/life-is-a-quiet-struggle-against-disorder.html');
const index = read('notes.html');
const sitemap = read('sitemap.xml');
const filter = read('notes-stories.js');
const styles = read('styles.css');
const slug = 'life-is-a-quiet-struggle-against-disorder';
const category = 'philosophy-in-everyday-life';

for (const lang of ['en','zh','fr','es']) {
  const marker = 'class="copy-' + lang + '"';
  assert.equal(page.split(marker).length - 1, 1, 'Article should contain exactly one '+lang+' body');
  const source = read('docs/philosophy-life-against-disorder-' + lang + '.md');
  assert.equal((source.match(/^## /gm) || []).length, 8, lang+' manuscript must contain eight sections');
}
assert.equal((page.match(/<h2>/g) || []).length, 32, 'Four language bodies should contain 32 section headings');
assert.ok(page.includes('../runlu-language.js'), 'Shared language script is required');
assert.ok(page.includes('data-runlu-language-select'), 'Shared language selector is required');
assert.ok(page.includes('../notes.html#' + category), 'Return link must retain category filter');
assert.ok(index.includes('data-stories-category="' + category + '" href="notes/' + slug + '.html"'), 'Category card must link to article');
assert.ok(filter.includes("card.dataset.storiesCategory"), 'Filter must use category dataset');
assert.ok(styles.includes('html[lang="fr"] .copy-fr'), 'Four-language CSS switching rules required');
assert.ok(sitemap.includes('https://runlu.ca/notes/' + slug + '.html'), 'Article URL must be in sitemap');
console.log('PASS: four-language manuscripts, page structure, index filter, shared language UI, and sitemap.');
console.log('NOTE: source-level checks only. Browser, accessibility, editorial and human review remain outstanding.');
