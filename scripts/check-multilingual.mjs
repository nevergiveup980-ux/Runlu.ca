import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// Product builds, diagnostics, redirects, archived prototypes, and standalone
// legal/privacy policies are applications/support pages rather than editorial
// site pages. They own their localization and must not be made to load the
// public website's language switcher.
const excludedPrefixes = ['flooring/','flooring-u2-lab/','flooring-u3-preview/'];
const excluded = new Set([
  'health-view-006-humid-heat.html',
  'health-view-007-staree-statins.html',
  'health-view-008-after-weight-loss.html',
  'view-011-model-hardware-standard.html',
  'view-012-ordinary-people-build-tools.html',
  'control/index.html',
  'engineering-reliability.html',
  'field-calculator-v15.html',
  'field-calculator.html',
  'field-calculator-support.html',
  'field-calculator-privacy.html',
  'roll-length.html',
  'runlu-ledger-privacy.html',
  'warehouse-privacy.html',
  // Standalone app policy/support pages and a separate book microsite own their locale UI.
  'invest/privacy.html',
  'invest/support.html',
  'truth-and-lies.html'
]);
const pages = [];
const languageScript = fs.readFileSync(path.join(root, 'runlu-language.js'), 'utf8');
function catalogKeys(language) {
  const start=languageScript.indexOf(`${language}:{`);
  const end=language==='fr'?languageScript.indexOf('    es:{',start):languageScript.indexOf('\n    }\n  };',start);
  const section=languageScript.slice(start,end);
  return new Set([...section.matchAll(/'((?:\\'|[^'])*)'\s*:/g)].map(match=>match[1].replaceAll("\\'", "'")));
}
const catalogs={fr:catalogKeys('fr'),es:catalogKeys('es')};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'research') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
}

walk(root);
const failures = [];
for (const file of pages) {
  const rel = path.relative(root, file);
  if (excluded.has(rel) || excludedPrefixes.some(prefix => rel.startsWith(prefix))) continue;
  // Season 2 Chinese masters may initially precede translations. Once all
  // editions exist, validate the actual route-switching navigation instead.
  if (/^wellness-season-02-\d{2}\.html$/.test(rel)) {
    const edition = fs.readFileSync(file, 'utf8');
    if (!/<html lang="zh(?:-Hans|-CN)?"/.test(edition)) failures.push(`${rel}: expected Chinese master language`);
    const base = rel.replace(/\.html$/, '');
    const counterparts = ['-en', '-fr', '-es'].map(suffix => base + suffix + '.html');
    if (counterparts.every(target => fs.existsSync(path.join(root, target)))) {
      for (const [lang, suffix] of [['zh-Hans',''],['en','-en'],['fr','-fr'],['es','-es']]) {
        const target = base + suffix + '.html';
        if (!edition.includes(`hreflang="${lang}" href="https://runlu.ca/${target}"`)) failures.push(`${rel}: missing alternate ${target}`);
        if (!edition.includes(`href="${target}"`)) failures.push(`${rel}: missing language navigation ${target}`);
      }
      if (!edition.includes(`rel="canonical" href="https://runlu.ca/${rel}"`)) failures.push(`${rel}: missing self canonical`);
    } else {
      if (!edition.includes('aria-label="语言版本 / Language editions"')) failures.push(`${rel}: missing edition navigation`);
      if (!edition.includes('coming later')) failures.push(`${rel}: missing translation-pending notice`);
    }
    continue;
  }
  // Season 2 translated editions use independent language pages, not the
  // shared in-page language switcher. Validate actual edition links instead.
  if (/^wellness-season-02-\d{2}-(?:en|fr|es)\.html$/.test(rel)) {
    const edition = fs.readFileSync(file, 'utf8');
    const base = rel.replace(/-(?:en|fr|es)\.html$/, '');
    const language = rel.match(/-(en|fr|es)\.html$/)?.[1];
    if (!edition.includes(`<html lang="${language}"`)) failures.push(`${rel}: incorrect document language`);
    for (const [lang, suffix] of [['zh-Hans',''],['en','-en'],['fr','-fr'],['es','-es']]) {
      const target = base + suffix + '.html';
      if (!fs.existsSync(path.join(root, target))) failures.push(`${rel}: missing edition ${target}`);
      if (!edition.includes(`hreflang="${lang}" href="https://runlu.ca/${target}"`)) failures.push(`${rel}: missing alternate ${target}`);
      if (!edition.includes(`href="${target}"`)) failures.push(`${rel}: missing language navigation ${target}`);
    }
    if (!edition.includes(`rel="canonical" href="https://runlu.ca/${rel}"`)) failures.push(`${rel}: missing self canonical`);
    continue;
  }
  // The Wellness Twelve articles are four separate, canonical language editions.
  // They do not use in-page translation; validate their linked counterparts instead
  // of incorrectly requiring the shared in-page language selector/script.
  if (/^wellness-twelve-\d{2}(?:-[a-z-]+)?(?:-(?:en|fr|es))?\.html$/.test(rel)) {
    const edition = fs.readFileSync(file, 'utf8');
    const base = rel.replace(/-(?:en|fr|es)\.html$/, '.html').replace(/\.html$/, '');
    for (const [lang, suffix] of [['zh-Hans',''],['en','-en'],['fr','-fr'],['es','-es']]) {
      const target = base + suffix + '.html';
      if (!fs.existsSync(path.join(root, target))) failures.push(`${rel}: missing edition ${target}`);
      const expected = `hreflang="${lang}" href="https://runlu.ca/${target}"`;
      if (!edition.includes(expected)) failures.push(`${rel}: missing alternate ${expected}`);
    }
    const canonical = `href="https://runlu.ca/${rel}"`;
    if (!edition.includes(`rel="canonical" ${canonical}`)) failures.push(`${rel}: missing self canonical`);
    continue;
  }
  // Chronicle Twilight uses separate language editions with a route-switching selector.
  // Preserve the edition-specific navigation; verify all four targets instead.
  if (/^chronicle\/twilight-crescent-moon-2026(?:-(?:en|fr|es))?\.html$/.test(rel)) {
    const edition = fs.readFileSync(file, 'utf8');
    for (const suffix of ['', '-en', '-fr', '-es']) {
      const target = 'chronicle/twilight-crescent-moon-2026' + suffix + '.html';
      if (!fs.existsSync(path.join(root, target))) failures.push(`${rel}: missing edition ${target}`);
      if (!edition.includes('twilight-crescent-moon-2026' + suffix + '.html')) failures.push(`${rel}: missing language navigation ${target}`);
    }
    if (!edition.includes(`rel="canonical" href="https://runlu.ca/${rel}"`)) failures.push(`${rel}: missing self canonical`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<[^!][^>]*>/g)) {
    const names=[...match[0].matchAll(/\s(data-(?:en|zh|fr|es))=/gi)].map(item=>item[1].toLowerCase());
    const duplicate=names.find((name,index)=>names.indexOf(name)!==index);
    if(duplicate) failures.push(`${rel}: duplicate ${duplicate} attribute`);
  }
  const selectors = [...html.matchAll(/<select\b[^>]*data-runlu-language-select[^>]*>([\s\S]*?)<\/select>/gi)];
  if (!selectors.length) failures.push(`${rel}: missing standard language selector`);
  for (const [, options] of selectors) {
    for (const lang of ['en', 'zh', 'fr', 'es']) {
      const option = options.match(new RegExp(`<option\\b[^>]*value=["']${lang}["'][^>]*>`, 'i'))?.[0];
      if (!option) failures.push(`${rel}: selector missing ${lang}`);
      else if (/\bdisabled\b/i.test(option)) failures.push(`${rel}: ${lang} is disabled`);
    }
  }
  for (const match of html.matchAll(/<[^>]*\bdata-en=(?:"[^"]*"|'[^']*')[^>]*>/gi)) {
    const tag = match[0];
    const english=(tag.match(/\bdata-en="([^"]*)"/i)?.[1]||tag.match(/\bdata-en='([^']*)'/i)?.[1]||'').replaceAll('&amp;','&');
    for (const lang of ['zh', 'fr', 'es']) {
      if (!new RegExp(`\\bdata-${lang}=(?:"[^"]*"|'[^']*')`, 'i').test(tag) && !catalogs[lang]?.has(english)) {
        failures.push(`${rel}: translatable element missing data-${lang}: ${tag.slice(0, 110)}`);
      }
    }
  }
  const counts = Object.fromEntries(['en', 'zh', 'fr', 'es'].map(lang => [lang, (html.match(new RegExp(`class=["'][^"']*\\b(?:copy|language)-${lang}\\b`, 'gi')) || []).length]));
  if (Math.max(...Object.values(counts)) > 0 && new Set(Object.values(counts)).size !== 1) {
    failures.push(`${rel}: long-form block counts differ ${JSON.stringify(counts)}`);
  }
  if (!html.includes('runlu-language.js')) failures.push(`${rel}: shared language script is not loaded`);
}


// Guard the three SEO-prerendered book pages against future accidental regressions.
// This is a static contract, not a substitute for browser-based language testing.
for (const chapter of ['prologue', 'chapter-01', 'chapter-02']) {
  const rel = `book/${chapter}.html`;
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: missing book chapter`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const article = html.match(/<article\b[^>]*\bid="book-content"[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  const template = html.match(/<template\b[^>]*\bid="book-content-zh"[^>]*>([\s\S]*?)<\/template>/i)?.[1];
  const paragraphs = fragment => [...(fragment || '').matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(match => match[1].replace(/<[^>]+>/g, '').trim());
  const visible = paragraphs(article);
  const original = paragraphs(template);
  if (!visible.length || JSON.stringify(visible) !== JSON.stringify(original)) {
    failures.push(`${rel}: prerendered Chinese paragraphs differ from source template`);
  }
  if (!html.includes('data-runlu-language-select')) failures.push(`${rel}: missing language selector`);
  if (!html.includes('book-reader.js')) failures.push(`${rel}: missing multilingual reader script`);
  if (!html.includes('rel="canonical"')) failures.push(`${rel}: missing canonical URL`);
}

if (failures.length) {
  console.error(`Four-language check failed (${failures.length} issues):`);
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Four-language check passed for ${pages.length} HTML pages.`);
