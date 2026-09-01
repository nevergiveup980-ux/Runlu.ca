import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = [];
const languageScript = fs.readFileSync(path.join(root, 'runlu-language.js'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

function catalogKeys(language) {
  const start = languageScript.indexOf(`${language}:{`);
  const end = language === 'fr'
    ? languageScript.indexOf('    es:{', start)
    : languageScript.indexOf('\n    }\n  };', start);
  const section = languageScript.slice(start, end);
  return new Set([...section.matchAll(/'((?:\\'|[^'])*)'\s*:/g)].map(match => match[1].replaceAll("\\'", "'")));
}

const catalogs = { fr: catalogKeys('fr'), es: catalogKeys('es') };

for (const match of sitemap.matchAll(/<loc>https:\/\/runlu\.ca\/(.*?)<\/loc>/g)) {
  const raw = match[1].trim();
  let rel;
  if (!raw) rel = 'index.html';
  else if (raw.endsWith('/')) rel = path.join(raw, 'index.html');
  else rel = raw;
  if (rel.endsWith('.html') && fs.existsSync(path.join(root, rel))) pages.push(path.join(root, rel));
}

const failures = [];
for (const file of [...new Set(pages)]) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');

  for (const match of html.matchAll(/<[^!][^>]*>/g)) {
    const names = [...match[0].matchAll(/\s(data-(?:en|zh|fr|es))=/gi)].map(item => item[1].toLowerCase());
    const duplicate = names.find((name, index) => names.indexOf(name) !== index);
    if (duplicate) failures.push(`${rel}: duplicate ${duplicate} attribute`);
  }

  const customBlocks = ['en', 'zh', 'fr', 'es'].every(lang =>
    new RegExp(`data-lang=["']${lang}["']`, 'i').test(html)
  );

  if (!customBlocks) {
    const selectors = [...html.matchAll(/<select\b[^>]*data-runlu-language-select[^>]*>([\s\S]*?)<\/select>/gi)];
    if (!selectors.length) failures.push(`${rel}: missing standard language selector`);
    for (const [, options] of selectors) {
      for (const lang of ['en', 'zh', 'fr', 'es']) {
        const option = options.match(new RegExp(`<option\\b[^>]*value=["']${lang}["'][^>]*>`, 'i'))?.[0];
        if (!option) failures.push(`${rel}: selector missing ${lang}`);
        else if (/\bdisabled\b/i.test(option)) failures.push(`${rel}: ${lang} is disabled`);
      }
    }
    if (!html.includes('runlu-language.js')) failures.push(`${rel}: shared language script is not loaded`);
  }

  for (const match of html.matchAll(/<[^>]*\bdata-en=(?:"[^"]*"|'[^']*')[^>]*>/gi)) {
    const tag = match[0];
    const english = (tag.match(/\bdata-en="([^"]*)"/i)?.[1] || tag.match(/\bdata-en='([^']*)'/i)?.[1] || '').replaceAll('&amp;', '&');
    for (const lang of ['zh', 'fr', 'es']) {
      if (!new RegExp(`\\bdata-${lang}=(?:"[^"]*"|'[^']*')`, 'i').test(tag) && !catalogs[lang]?.has(english)) {
        failures.push(`${rel}: translatable element missing data-${lang}: ${tag.slice(0, 110)}`);
      }
    }
  }

  const counts = Object.fromEntries(['en', 'zh', 'fr', 'es'].map(lang => [
    lang,
    (html.match(new RegExp(`class=["'][^"']*\\b(?:copy|language)-${lang}\\b`, 'gi')) || []).length
  ]));
  if (Math.max(...Object.values(counts)) > 0 && new Set(Object.values(counts)).size !== 1) {
    failures.push(`${rel}: long-form block counts differ ${JSON.stringify(counts)}`);
  }
}

if (failures.length) {
  console.error(`Four-language check failed (${failures.length} issues):`);
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Four-language check passed for ${new Set(pages).size} sitemap HTML pages.`);
