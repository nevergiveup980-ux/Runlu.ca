const ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';
const SETTINGS = `query PulseLimits($accountTag: string!) {
  viewer { accounts(filter: {accountTag: $accountTag}) {
    settings { rumPageloadEventsAdaptiveGroups { enabled maxDuration notOlderThan maxPageSize } }
  } }
}`;

export class AnalyticsError extends Error {
  constructor(code, message, status = 502, details = {}) {
    super(message); this.code = code; this.status = status; this.details = details;
  }
}
export function validateConfig(env) {
  for (const key of ['CF_ANALYTICS_TOKEN', 'CF_ACCOUNT_ID']) {
    if (!env[key]?.trim() || env[key].startsWith('replace_with_')) {
      throw new AnalyticsError('CONFIGURATION_ERROR', `Configure Worker secret ${key}.`, 503);
    }
  }
}
export function errorResponse(error) {
  const known = error instanceof AnalyticsError;
  return new Response(JSON.stringify({
    error: known ? error.code : 'API_ERROR',
    message: known ? error.message : 'Analytics request failed. Check Worker configuration and Cloudflare availability.',
    ...(known ? error.details : {})
  }), {status: known ? error.status : 502, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow, noarchive'
  }});
}
async function graphql(env, query, variables) {
  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST', signal: AbortSignal.timeout(20000),
      headers: {Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({query, variables})
    });
  } catch {
    throw new AnalyticsError('API_UNAVAILABLE', 'Cloudflare could not be reached or timed out. Retry later.');
  }
  const details = {upstreamStatus: response.status, stage: query.includes('PulseLimits') ? 'settings' : 'analytics'};
  const ray = response.headers.get('cf-ray');
  if (ray && /^[a-zA-Z0-9-]{1,80}$/.test(ray)) details.cloudflareRay = ray;
  // Do not return/log upstream messages: they may contain configuration values.
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  const messages = (payload?.errors || []).map(e => String(e.message || '')).join(' ');
  if ([401, 403].includes(response.status) || /unauthori[sz]ed|forbidden|permission|authentication|invalid.*token|not authorized/i.test(messages)) {
    throw new AnalyticsError('PERMISSION_ERROR', 'Verify CF_ANALYTICS_TOKEN has Account Analytics Read for the account in CF_ACCOUNT_ID.', 403, details);
  }
  if (response.status === 429 || /rate limit|quota/i.test(messages)) {
    throw new AnalyticsError('RATE_LIMITED', 'Cloudflare query quota reached. Wait before refreshing.', 503, details);
  }
  if (/time range|too old|notolderthan|maxduration|date.*range|cannot request data older/i.test(messages)) {
    throw new AnalyticsError('TIME_RANGE_ERROR', 'Cloudflare rejected the requested history. Check dataset retention and duration limits.', 502, details);
  }
  if (!response.ok || !payload || payload.errors?.length) {
    throw new AnalyticsError('API_ERROR', 'Cloudflare GraphQL request failed. Check dataset schema and account availability.', 502, details);
  }
  const account = payload.data?.viewer?.accounts?.[0];
  if (!account) throw new AnalyticsError('ACCOUNT_UNAVAILABLE', 'Cloudflare returned no accessible account. Verify account ID and token scope.', 403, details);
  return account;
}

// Group queries have row limits, not a cursor. Split saturated intervals rather
// than silently summing truncated top-N rows. Bound work per Worker request.
export async function queryHistory(env, query, requestedStart, end) {
  validateConfig(env);
  const account = await graphql(env, SETTINGS, {accountTag: env.CF_ACCOUNT_ID});
  const limits = account.settings?.rumPageloadEventsAdaptiveGroups;
  if (!limits?.enabled) throw new AnalyticsError('PERMISSION_ERROR', 'RUM dataset is unavailable. Verify Account Analytics Read and dataset access.', 403);
  const {maxDuration, notOlderThan, maxPageSize} = limits;
  if (![maxDuration, notOlderThan, maxPageSize].every(v => Number.isFinite(v) && v > 0)) {
    throw new AnalyticsError('API_ERROR', 'Cloudflare returned invalid dataset limits.');
  }
  // Leave a minute for clock skew and elapsed query time at the retention edge.
  const start = new Date(Math.max(+requestedStart, +end - notOlderThan * 1000 + 60000));
  const result = {};
  let requests = 0;
  const pageSize = Math.min(maxPageSize, 10000);
  const boundedQuery = query.replace(/limit:\s*(?:100|200|500|5000)\b/g, `limit: ${pageSize}`).replaceAll('datetime_leq: $end', 'datetime_lt: $end');
  async function read(from, to) {
    if (++requests > 160) throw new AnalyticsError('QUERY_LIMIT', 'History needs too many queries. Narrow the range or use a shorter history epoch.', 503);
    const data = await graphql(env, boundedQuery, {accountTag: env.CF_ACCOUNT_ID, start: new Date(from).toISOString(), end: new Date(to).toISOString(), host: env.RUNLU_HOST || 'runlu.ca'});
    const aliases = [...query.matchAll(/(\w+):\s*rumPageloadEventsAdaptiveGroups/g)].map(match => match[1]);
    if (aliases.some(key => !Array.isArray(data[key]))) throw new AnalyticsError('API_ERROR', 'Cloudflare returned incomplete analytics groups.');
    for (const [key, rows] of Object.entries(data)) {
      if (!Array.isArray(rows)) throw new AnalyticsError('API_ERROR', 'Cloudflare returned malformed analytics groups.');
      if (!['totals', 'firstSeen'].includes(key) && rows.length >= pageSize) {
        if (to - from <= 1000) throw new AnalyticsError('RESULT_LIMIT', 'Cloudflare group limit reached even at a one-second interval.');
        const mid = Math.floor((from + to) / 2);
        await read(from, mid); await read(mid, to); return;
      }
    }
    for (const [key, rows] of Object.entries(data)) {
      const groups = result[key] ||= new Map();
      for (const row of rows) {
        if (!row || (key !== 'firstSeen' && (!Number.isFinite(row.count) || !Number.isFinite(row.sum?.visits)))) {
          throw new AnalyticsError('API_ERROR', 'Cloudflare returned malformed analytics metrics.');
        }
        const id = JSON.stringify(row.dimensions || {});
        const prev = groups.get(id) || {count: 0, sum: {visits: 0}, ...(row.dimensions ? {dimensions: row.dimensions} : {})};
        prev.count += row.count || 0; prev.sum.visits += row.sum?.visits || 0;
        groups.set(id, prev);
      }
    }
  }
  // One-day windows stay bounded even when the account permits longer spans.
  const step = Math.min(maxDuration * 1000, 86400000);
  for (let cursor = +start; cursor < +end; cursor += step) await read(cursor, Math.min(cursor + step, +end));
  const merged = Object.fromEntries(Object.entries(result).map(([key, value]) => [key, [...value.values()]]));
  merged.firstSeen?.sort((a, b) => a.dimensions.date.localeCompare(b.dimensions.date));
  for (const key of ['totals', 'pages', 'trend', 'countries', 'browsers', 'devices', 'referrers', 'firstSeen']) merged[key] ||= [];
  return {account: merged, coverage: {requestedStart: requestedStart.toISOString(), start: start.toISOString(), end: end.toISOString(), retentionLimited: +start > +requestedStart, retentionSeconds: notOlderThan, maxDurationSeconds: maxDuration, queries: requests}};
}
