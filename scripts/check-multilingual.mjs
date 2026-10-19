import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// Product builds, diagnostics, redirects, archived prototypes, and standalone
// legal/privacy policies are applications/support pages rather than editorial
// site pages. They own their localization and must not be made to load the
// public website's language switcher.
// Isolated application/fixture routes use product-specific navigation and localization.
const excludedPrefixes = ['flooring/','flooring-u2-lab/','flooring-u3-preview/','invest/'];
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
  // RUNLU INVEST is a standalone product page with its own language runtime.
  'runlu-invest.html'
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

// Editorial articles published as four separate files are not shared-runtime
// pages. Verify that their language links really resolve before exempting them.
function checkLinkedEditions(rel, html) {
  if (!/class=["'][^"']*\bedition-switch\b/i.test(html)) return false;
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]);
  const attr = (tag, key) =>
    tag.match(new RegExp(key + '="([^"]+)"', 'i'))?.[1] ||
    tag.match(new RegExp(key + "='([^']+)'", 'i'))?.[1] || '';
  for (const language of ['zh-Hans', 'en', 'fr', 'es']) {
    const tag = tags.find(t => attr(t, 'rel').toLowerCase() === 'alternate' && attr(t, 'hreflang') === language);
    const href = tag && attr(tag, 'href');
    if (!href || !/^https:\/\/runlu\.ca\/[^?#]+\.html$/.test(href)) {
      failures.push(`${rel}: edition missing valid ${language} hreflang target`);
      continue;
    }
    const target = href.slice('https://runlu.ca/'.length);
    if (!fs.existsSync(path.join(root, target))) {
      failures.push(`${rel}: ${language} edition target missing: ${target}`);
    }
    const relative = path.posix.relative(path.posix.dirname(rel), target);
    if (!html.includes('href="' + relative + '"') && !html.includes("href='" + relative + "'")) {
      failures.push(`${rel}: edition switch missing ${language} link: ${relative}`);
    }
  }
  return true;
}

// Some four-language Chronicle essays use a page-local navigation router.
// Require an actual selector, change handler, and four existing local targets.
function hasVerifiedScopedRouter(rel, html) {
  const match = html.match(/const paths=\{zh:'([^']+)',en:'([^']+)',fr:'([^']+)',es:'([^']+)'\}/);
  if (!match || !html.includes("addEventListener('change'") ||
      !html.includes('location.href=paths[s.value]')) return false;
  return match.slice(1).every(target =>
    /^[a-zA-Z0-9._-]+\.html$/.test(target) &&
    !target.includes('..') &&
    fs.existsSync(path.join(root, path.dirname(rel), target)));
}

let sharedPages = 0;
let linkedEditionPages = 0;
for (const file of pages) {
  const rel = path.relative(root, file);
  if (excluded.has(rel) || excludedPrefixes.some(prefix => rel.startsWith(prefix))) continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<[^!][^>]*>/g)) {
    const names=[...match[0].matchAll(/\s(data-(?:en|zh|fr|es))=/gi)].map(item=>item[1].toLowerCase());
    const duplicate=names.find((name,index)=>names.indexOf(name)!==index);
    if(duplicate) failures.push(`${rel}: duplicate ${duplicate} attribute`);
  }
  if (checkLinkedEditions(rel, html)) { linkedEditionPages++; continue; }
  sharedPages++;
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
  if (!html.includes('runlu-language.js') && !hasVerifiedScopedRouter(rel, html)) {
    failures.push(`${rel}: shared language script or verified page-local router is not loaded`);
  }
}

if (failures.length) {
  console.error(`Four-language check failed (${failures.length} issues):`);
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Four-language check passed: ${sharedPages} shared/runtime pages and ${linkedEditionPages} linked-edition pages (${pages.length} HTML files discovered).`);
