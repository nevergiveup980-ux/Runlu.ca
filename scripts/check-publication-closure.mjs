import fs from 'node:fs';

const LIVE = process.argv.includes('--live');
const BASE = 'https://runlu.ca/';
const fail = (m) => { throw new Error(m); };
const read = (p) => fs.readFileSync(p, 'utf8');
const requireText = (body, token, label) => { if (!body.includes(token)) fail(`${label}: missing ${token}`); };

function viewEntries(source) {
  const out = [];
  const re = /\{n:'(\d{3})',href:'([^']+)'[^}]*en:'([^']*)'[^}]*zh:'([^']*)'[^}]*fr:'([^']*)'[^}]*es:'([^']*)'\}/g;
  for (const m of source.matchAll(re)) out.push({ n:m[1], href:m[2], en:m[3], zh:m[4], fr:m[5], es:m[6] });
  return out;
}

function repoChecks() {
  const catalog = read('view-catalog.js');
  const entries = viewEntries(catalog);
  if (entries.length < 24) fail(`VIEW catalog unexpectedly short: ${entries.length}`);
  entries.forEach((e, i) => {
    const expected = String(i + 1).padStart(3, '0');
    if (e.n !== expected) fail(`VIEW catalog order/gap: expected ${expected}, got ${e.n}`);
    for (const lang of ['en','zh','fr','es']) if (!e[lang]?.trim()) fail(`VIEW ${e.n}: missing ${lang} catalog title`);
  });

  const sitemap = read('sitemap.xml');
  const frontiers = read('frontiers.html');
  requireText(frontiers, 'id="viewCatalog"', 'frontiers.html');
  requireText(frontiers, 'id="viewLatest"', 'frontiers.html');
  requireText(frontiers, 'view-catalog.js?v=', 'frontiers.html cache-busted catalog');
  requireText(frontiers, '@media(max-width:640px)', 'frontiers.html mobile guard');

  for (const e of entries.filter(x => Number(x.n) >= 11)) {
    const clean = e.href.split('#')[0];
    if (!fs.existsSync(clean)) fail(`VIEW ${e.n}: article file missing: ${clean}`);
    const page = read(clean);
    const canonical = BASE + clean;
    requireText(page, `rel="canonical" href="${canonical}"`, `VIEW ${e.n}`);
    requireText(page, `property="og:url" content="${canonical}"`, `VIEW ${e.n}`);
    requireText(page, 'property="og:title"', `VIEW ${e.n}`);
    requireText(page, 'property="og:description"', `VIEW ${e.n}`);
    requireText(page, 'name="viewport"', `VIEW ${e.n} mobile viewport`);
    for (const lang of ['en','zh','fr','es']) requireText(page, `data-lang="${lang}"`, `VIEW ${e.n}`);
    if (Number(e.n) >= 23) {
      requireText(page, 'evidence', `VIEW ${e.n} evidence/limits block`);
      requireText(page, 'sources', `VIEW ${e.n} sources block`);
    }
    requireText(sitemap, `<loc>${canonical}</loc>`, `VIEW ${e.n} sitemap`);
  }

  const latest = entries.at(-1);
  const latestFile = latest.href.split('#')[0];
  const latestPage = read(latestFile);
  requireText(latestPage, `>${latest.n}<`, `Latest VIEW ${latest.n} visible article index`);

  const health = read('health.html');
  const healthPages = [...sitemap.matchAll(/<loc>https:\/\/runlu\.ca\/(health-view-(\d{3})-[^<]+\.html)<\/loc>/g)]
    .map(m => ({ href:m[1], n:m[2] }))
    .sort((a,b) => a.n.localeCompare(b.n));
  for (const h of healthPages) {
    if (!fs.existsSync(h.href)) fail(`HEALTH VIEW ${h.n}: sitemap target missing: ${h.href}`);
    requireText(health, `href="${h.href}"`, `HEALTH VIEW ${h.n} landing navigation`);
    const page = read(h.href);
    const canonical = BASE + h.href;
    requireText(page, `rel="canonical" href="${canonical}"`, `HEALTH VIEW ${h.n}`);
    requireText(page, `property="og:url" content="${canonical}"`, `HEALTH VIEW ${h.n}`);
    requireText(page, 'property="og:title"', `HEALTH VIEW ${h.n}`);
    requireText(page, 'property="og:description"', `HEALTH VIEW ${h.n}`);
    requireText(page, 'name="viewport"', `HEALTH VIEW ${h.n} mobile viewport`);
    for (const lang of ['en','zh','fr','es']) requireText(page, `data-lang="${lang}"`, `HEALTH VIEW ${h.n}`);
  }

  console.log(`Repository publication closure passed: VIEW 001-${latest.n}; ${healthPages.length} independent HEALTH VIEW pages.`);
  return { latest, latestFile, healthPages };
}

async function fetchText(url) {
  let last;
  for (let i=0;i<3;i++) {
    try {
      const r = await fetch(url, { headers:{'user-agent':'RUNLU-Publication-QA/1.1'}, redirect:'follow', signal:AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return await r.text();
    } catch (e) { last=e; await new Promise(r=>setTimeout(r,1500*(i+1))); }
  }
  fail(`Live fetch failed ${url}: ${last}`);
}

async function liveChecks(latest, latestFile, healthPages) {
  const latestHealth = healthPages.at(-1);
  const urls = [
    BASE + 'view-catalog.js?qa=' + Date.now(),
    BASE + latestFile + '?qa=' + Date.now(),
    BASE + 'sitemap.xml?qa=' + Date.now(),
    BASE + 'frontiers.html?qa=' + Date.now(),
    BASE + 'health.html?qa=' + Date.now()
  ];
  if (latestHealth) urls.push(BASE + latestHealth.href + '?qa=' + Date.now());
  const [catalog, article, sitemap, frontiers, health, healthArticle] = await Promise.all(urls.map(fetchText));

  requireText(catalog, `n:'${latest.n}'`, `LIVE VIEW catalog ${latest.n}`);
  requireText(catalog, `href:'${latest.href}'`, `LIVE VIEW catalog href ${latest.n}`);
  requireText(article, `>${latest.n}<`, `LIVE VIEW article ${latest.n}`);
  requireText(article, `rel="canonical" href="${BASE + latestFile}"`, `LIVE canonical ${latest.n}`);
  for (const lang of ['en','zh','fr','es']) requireText(article, `data-lang="${lang}"`, `LIVE VIEW ${latest.n} ${lang}`);
  requireText(sitemap, `<loc>${BASE + latestFile}</loc>`, `LIVE sitemap ${latest.n}`);
  requireText(frontiers, 'view-catalog.js?v=', 'LIVE frontiers catalog loader');

  if (latestHealth) {
    requireText(health, `href="${latestHealth.href}"`, `LIVE HEALTH VIEW ${latestHealth.n} landing navigation`);
    requireText(healthArticle, `rel="canonical" href="${BASE + latestHealth.href}"`, `LIVE HEALTH VIEW ${latestHealth.n} canonical`);
    requireText(sitemap, `<loc>${BASE + latestHealth.href}</loc>`, `LIVE HEALTH VIEW ${latestHealth.n} sitemap`);
    for (const lang of ['en','zh','fr','es']) requireText(healthArticle, `data-lang="${lang}"`, `LIVE HEALTH VIEW ${latestHealth.n} ${lang}`);
  }

  console.log(`Public publication closure passed for latest VIEW ${latest.n}${latestHealth ? ` and HEALTH VIEW ${latestHealth.n}` : ''}.`);
}

const {latest, latestFile, healthPages} = repoChecks();
if (LIVE) await liveChecks(latest, latestFile, healthPages);
