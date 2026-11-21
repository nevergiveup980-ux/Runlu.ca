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
  // Compare every heading and paragraph in the reviewed Markdown with the
  // corresponding HTML language block, so truncated translations cannot pass.
  const section = page.match(new RegExp('<section class="copy-' + lang + '"[^>]*>([\\s\\S]*?)<\\/section>'));
  assert.ok(section, lang + ' article section must exist');
  const html = section[1];
  const headings = [...source.matchAll(/^## (.+)$/gm)].map(match => match[1].trim());
  for (const heading of headings) {
    const escaped = heading.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    assert.ok(html.includes('<h2>' + escaped + '</h2>'), lang + ' missing heading: ' + heading);
  }
  const articleText = source.slice(source.indexOf('## ')).split(/^---$/m)[0];
  const expectedParagraphs = articleText.split(/\r?\n/)
    .map(line => line.trim()).filter(line => line && !line.startsWith('## '));
  const htmlParagraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(match => match[1]);
  assert.equal(htmlParagraphs.length, expectedParagraphs.length,
    lang + ' paragraph count differs between manuscript and page');
  const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  expectedParagraphs.forEach((paragraph, index) => {
    assert.equal(htmlParagraphs[index], escapeHtml(paragraph),
      lang + ' paragraph ' + (index + 1) + ' differs from its manuscript');
  });

}
assert.equal((page.match(/<h2>/g) || []).length, 32, 'Four language bodies should contain 32 section headings');
const mobileStyles = read('notes/philosophy-essay.css');
assert.ok(page.includes('philosophy-essay.css?v=1'), 'Mobile reading stylesheet must be linked');
assert.ok(page.includes('class="field-page philosophy-essay"'), 'Mobile reading styles must be scoped to article');
assert.ok(mobileStyles.includes('@media (max-width: 600px)'), 'Mobile breakpoint must be present');
const languageScript = read('runlu-language.js');
const languageMap = {en: 'en', zh: 'zh-CN', fr: 'fr', es: 'es'};
for (const [language, htmlLanguage] of Object.entries(languageMap)) {
  assert.ok(page.includes('class="copy-' + language + '" lang="' + htmlLanguage + '"'),
    language + ' article body must declare the correct HTML language');
  assert.ok(styles.includes('html[lang="' + htmlLanguage + '"] .copy-' + language),
    language + ' article body must have a language visibility rule');
}
assert.ok(languageScript.includes("document.documentElement.lang=HTML_LANG[current]"),
  'Shared language script must update document language');
assert.equal((page.match(/data-runlu-language-select/g) || []).length, 1,
  'Article must expose one language selector');
assert.equal((page.match(/<h1>/g) || []).length, 4,
  'Each language version must have exactly one primary heading');
assert.ok(mobileStyles.includes('overflow-wrap: anywhere'),
  'Mobile headings must be able to wrap long text');
assert.ok(page.includes('../runlu-language.js'), 'Shared language script is required');
assert.ok(page.includes('data-runlu-language-select'), 'Shared language selector is required');
assert.ok(page.includes('../notes.html#' + category), 'Return link must retain category filter');
assert.ok(index.includes('data-stories-category="' + category + '" href="notes/' + slug + '.html"'), 'Category card must link to article');
assert.ok(filter.includes("card.dataset.storiesCategory"), 'Filter must use category dataset');
assert.ok(styles.includes('html[lang="fr"] .copy-fr'), 'Four-language CSS switching rules required');
assert.ok(sitemap.includes('https://runlu.ca/notes/' + slug + '.html'), 'Article URL must be in sitemap');
console.log('PASS: four-language manuscripts, page structure, index filter, shared language UI, and sitemap.');
console.log('NOTE: source-level checks only. Browser, accessibility, editorial and human review remain outstanding.');
