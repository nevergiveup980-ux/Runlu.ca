// Focused, read-only checks for public-facing RUNLU maintenance contracts.
// This does not verify external URLs, App Store status, or live service behavior.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = Object.fromEntries(
  ['privacy.html', 'support.html', 'forum.html', 'runlu-products.html', '404.html']
    .map(file => [file, read(file)])
);
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const [file, html] of Object.entries(pages)) {
  check(/<title>[^<]+<\/title>/i.test(html), file + ': missing title');
  if (file !== '404.html') {
    check(/<meta\s+name="description"\s+content="[^"]+"/i.test(html), file + ': missing description');
    check(html.includes('rel="canonical" href="https://runlu.ca/' + file + '"'), file + ': missing canonical');
  }
}
check(/name="robots"\s+content="noindex,follow"/i.test(pages['404.html']), '404 must remain noindex,follow');

for (const lang of ['en', 'zh', 'fr', 'es']) {
  for (const [file, expected] of [
    ['privacy.html', ['runlu-list-privacy.html', 'invoice-privacy.html']],
    ['support.html', ['runlu-list-support.html', 'invoice-support.html']]
  ]) {
    const html = pages[file];
    const marker = '<div class="copy-' + lang + '">';
    const start = html.indexOf(marker);
    const end = html.indexOf('<div class="copy-', start + marker.length);
    const block = start < 0 ? '' : html.slice(start, end < 0 ? undefined : end);
    check(start >= 0, file + ': missing ' + lang + ' language section');
    for (const target of expected) {
      check(block.includes('href="' + target + '"'), file + ': missing ' + target + ' in ' + lang);
    }
  }
}

const forum = pages['forum.html'];
check(forum.includes('<b>0</b> <span data-en="verified live members"'), 'Forum verified-member count changed: verify real data source');
check(forum.includes('<b>0</b> <span data-en="verified live discussions"'), 'Forum verified-discussion count changed: verify real data source');
check(forum.includes('saves this discussion only in this browser'), 'Forum local-only publishing disclosure missing');

const robots = read('robots.txt');
for (const sitemap of ['sitemap.xml', 'sitemap-ai.xml']) {
  check(robots.includes('Sitemap: https://runlu.ca/' + sitemap), 'robots.txt missing ' + sitemap);
  const xml = read(sitemap);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  check(urls.length > 0, sitemap + ': empty sitemap');
  check(urls.length === new Set(urls).size, sitemap + ': duplicate URLs');
  for (const address of urls) {
    let url;
    try { url = new URL(address); } catch { failures.push(sitemap + ': invalid URL ' + address); continue; }
    if (url.origin !== 'https://runlu.ca') {
      failures.push(sitemap + ': unexpected origin ' + address);
      continue;
    }
    const pathname = decodeURIComponent(url.pathname);
    check(!/\/(control-center|asset-ledger|master-vault|guanshi-vault|apple-dashboard)\.html$/.test(pathname), sitemap + ': private page indexed ' + pathname);
    const relative = pathname.replace(/^\//, '');
    const target = path.join(root, relative || 'index.html');
    check(fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html')), sitemap + ': missing local target ' + pathname);
  }
}
for (const privatePage of ['control-center.html', 'asset-ledger.html', 'master-vault.html', 'guanshi-vault.html']) {
  check(robots.includes('Disallow: /' + privatePage), 'robots.txt missing private exclusion: ' + privatePage);
}

// Focused local-link sample; existing CI separately checks all top-level HTML pages.
for (const [file, html] of Object.entries(pages)) {
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let url;
    try { url = new URL(href, 'https://runlu.ca/' + file); } catch { failures.push(file + ': invalid URL ' + href); continue; }
    if (url.origin !== 'https://runlu.ca') continue;
    const relative = decodeURIComponent(url.pathname).replace(/^\//, '');
    const target = path.join(root, relative || 'index.html');
    check(fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html')), file + ': broken local reference ' + href);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Public maintenance contracts passed: metadata, four-language legal links, Forum disclosures, robots, both sitemaps, 404 and focused links.');
}
