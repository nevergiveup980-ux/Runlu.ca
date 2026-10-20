// RUNLU Asset Ledger V2 — pure, read-only reconciliation helpers.
// This module never contacts Supabase or modifies stored assets.
export function reconcileAssets(existing, discovered) {
  const normalize = value => String(value ?? '').trim().toLowerCase();
  const keys = new Set(existing.map(item => normalize(item.asset_key)).filter(Boolean));
  const urls = new Set(existing.map(item => normalize(item.url).replace(/\/$/, '')).filter(Boolean));
  const seen = new Set();
  const candidates = [];
  const conflicts = [];
  for (const item of discovered) {
    const key = normalize(item.asset_key);
    const url = normalize(item.url).replace(/\/$/, '');
    if (!key || !item.name || !url || !(url === 'https://runlu.ca' || url.startsWith('https://runlu.ca/'))) {
      conflicts.push({ item, reason: 'missing key/name or untrusted public URL' });
      continue;
    }
    if (keys.has(key) && urls.has(url)) continue;
    if (seen.has(key)) {
      conflicts.push({ item, reason: 'duplicate discovery key' });
      continue;
    }
    seen.add(key);
    if (keys.has(key) && !urls.has(url)) {
      conflicts.push({ item, reason: 'existing asset key has a different URL; manual review required' });
      continue;
    }
    if (keys.has(key) || urls.has(url)) continue;
    candidates.push({ asset_key: key, name: item.name, url: item.url, source: item.source || 'public catalog', status: 'needs-review' });
  }
  return { candidates, conflicts, existingCount: existing.length, discoveredCount: discovered.length };
}

// Explicitly curated public-site entries; not a complete inventory or publication proof.
export const PUBLIC_CATALOG_CANDIDATES = Object.freeze([
  {asset_key:'runlu-asset-map',name:'RUNLU Digital Asset Map',url:'https://runlu.ca/asset-map.html',source:'public asset map'},
  {asset_key:'runlu-control-center',name:'RUNLU Control Center',url:'https://runlu.ca/control-center.html',source:'public site route (private access)'},
  {asset_key:'runlu-asset-ledger',name:'RUNLU Private Asset Ledger',url:'https://runlu.ca/asset-ledger.html',source:'public site route (private access)'}
]);
