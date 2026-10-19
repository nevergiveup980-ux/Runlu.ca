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
    if (!key || !item.name || !url || !url.startsWith('https://runlu.ca/')) {
      conflicts.push({ item, reason: 'missing key/name or untrusted public URL' });
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    if (keys.has(key) || urls.has(url)) continue;
    candidates.push({ asset_key: key, name: item.name, url: item.url, source: item.source || 'public catalog', status: 'needs-review' });
  }
  return { candidates, conflicts, existingCount: existing.length, discoveredCount: discovered.length };
}
