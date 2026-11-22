#!/usr/bin/env node
// RUNLU STORIES: second Philosophy in Everyday Life article, source-level acceptance.
// Run: node scripts/check-stories-philosophy-02.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const page = read('notes/true-wealth-is-the-freedom-to-choose.html');
const index = read('notes.html');
const sitemap = read('sitemap.xml');
const filter = read('notes-stories.js');
const styles = read('styles.css');
const slug = 'true-wealth-is-the-freedom-to-choose';
const category = 'philosophy-in-everyday-life';

for (const lang of ['en','zh','fr','es']) {
  const marker = 'class="copy-' + lang + '"';
  assert.equal(page.split(marker).length - 1, 1, 'Article should contain exactly one '+lang+' body');
  const source = read('docs/philosophy-true-wealth-freedom-' + lang + '.md');
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
  if (language !== 'en') {
    assert.ok(styles.includes('html[lang="' + htmlLanguage + '"] .copy-' + language),
      language + ' article body must have a language visibility rule');
  } else {
    assert.ok(styles.includes('.copy-zh,.copy-fr,.copy-es{display:none}'),
      'English must be the default visible language');
  }
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


/* Static mobile/navigation acceptance: browser/device QA remains separate. */
assert.ok(page.includes('name="viewport" content="width=device-width,initial-scale=1"'),
  'Mobile viewport declaration is required');
assert.equal((page.match(/<select[^>]*data-runlu-language-select/g) || []).length, 1,
  'Exactly one shared language selector is required');
for (const language of ['en', 'zh', 'fr', 'es']) {
  assert.ok(page.includes('<option value="' + language + '">'),
    language + ' must be selectable');
  const block = page.match(new RegExp('<section class="copy-' + language + '"[^>]*>([\\s\\S]*?)<\\/section>'));
  assert.ok(block && block[1].includes('../notes.html#philosophy-in-everyday-life'),
    language + ' must return to the philosophy category');
}
assert.ok(index.includes('PHILOSOPHY · 02'), 'Second essay category card must be numbered 02');
assert.ok(index.includes('data-stories-category="philosophy-in-everyday-life" href="notes/' + slug + '.html"'),
  'Second essay card must be filterable');
console.log('PASS: static mobile viewport, four-language selector, category navigation, and card checks.');
