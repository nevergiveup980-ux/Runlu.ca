import { queryHistory, errorResponse, AnalyticsError } from "./cloudflare.js";
import cleanWorker from "./index-clean.js";

const DEFAULT_HISTORY_EPOCH = "2026-08-01T00:00:00.000Z";

const LIFETIME_QUERY = `
query RunluPulseLifetime($accountTag: string!, $start: Time!, $end: Time!, $host: string!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      totals: rumPageloadEventsAdaptiveGroups(
        limit: 1
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } }
      pages: rumPageloadEventsAdaptiveGroups(
        limit: 500
        orderBy: [count_DESC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } dimensions { requestPath } }
      firstSeen: rumPageloadEventsAdaptiveGroups(
        limit: 1
        orderBy: [date_ASC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { dimensions { date } }
    }
  }
}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/lifetime") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
      try {
        const data = await fetchLifetime(env);
        return json(data, 200, { "Cache-Control": "private, max-age=60" });
      } catch (error) {
        return errorResponse(error);
      }
    }

    const response = await cleanWorker.fetch(request, env);
    if (request.method !== "GET") return response;

    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();
    const transformed = injectLifetimePanel(html);
    const headers = new Headers(response.headers);
    headers.set("Content-Length", String(new TextEncoder().encode(transformed).length));
    return new Response(transformed, { status: response.status, statusText: response.statusText, headers });
  }
};

async function fetchLifetime(env) {
  const host = env.RUNLU_HOST || "runlu.ca";
  const start = new Date(env.RUNLU_HISTORY_EPOCH || DEFAULT_HISTORY_EPOCH);
  const end = new Date();
  if (Number.isNaN(start.getTime()) || start > end) throw new AnalyticsError("CONFIGURATION_ERROR", "RUNLU_HISTORY_EPOCH must be a valid date in the past.", 503);

  const {account, coverage} = await queryHistory(env, LIFETIME_QUERY, start, end);

  const totalRow = account.totals?.[0] || {};
  const rawPageViews = number(totalRow.count);
  const visits = number(totalRow.sum?.visits);
  const internalPageViews = (account.pages || [])
    .filter((row) => isInternalOrEmbeddedPath(row.dimensions?.requestPath))
    .reduce((sum, row) => sum + number(row.count), 0);
  const pageViews = Math.max(0, rawPageViews - internalPageViews);
  const firstSeen = account.firstSeen?.[0]?.dimensions?.date || null;

  return {
    meta: {
      host,
      coverage,
      empty: rawPageViews === 0,
      historyEpoch: start.toISOString(),
      firstSeen,
      generatedAt: new Date().toISOString(),
      source: "Cloudflare Web Analytics / RUM",
      readOnly: true
    },
    summary: {
      pageViews,
      rawPageViews,
      internalPageViews,
      visits,
      pagesPerVisit: visits > 0 ? round(pageViews / visits, 2) : 0
    },
    note: "Lifetime public-facing page views exclude known /flooring internal or embedded system loads. Lifetime visits remain Cloudflare host-level visits, so they may still include internal system sessions."
  };
}

function injectLifetimePanel(html) {
  if (html.includes('id="lifetimeBlock"')) return html;

  const block = `
    <div id="lifetimeBlock" style="margin:2px 0 12px">
      <div class="eyebrow" style="margin:0 0 10px">Lifetime · all available history</div>
      <section class="metrics" aria-label="Lifetime RUNLU traffic totals">
        <div class="metric"><div class="label">Total page views</div><div class="value" id="lifeViews">—</div><div class="sub">Public-facing · Flooring internal loads excluded</div></div>
        <div class="metric"><div class="label">Total visits</div><div class="value" id="lifeVisits">—</div><div class="sub">Cloudflare host-level visit metric</div></div>
        <div class="metric"><div class="label">Lifetime pages / visit</div><div class="value" id="lifePpv">—</div><div class="sub">Public-facing page views ÷ visits</div></div>
        <div class="metric"><div class="label">Tracking since</div><div class="value" id="lifeSince">—</div><div class="sub" id="lifeSinceSub">First available Cloudflare record</div></div>
      </section>
      <div class="panel-note" id="lifeNote" style="margin:0 2px 16px"></div>
    </div>`;

  const script = `
<script>
(function(){
  function fmt(v){return new Intl.NumberFormat().format(Number(v||0))}
  function setText(id,value){var el=document.getElementById(id);if(el)el.textContent=value}
  function dateParts(value){
    if(!value)return {main:'—',sub:'No history yet'};
    var d=new Date(value+'T00:00:00Z');
    return {
      main:d.toLocaleDateString(undefined,{month:'short',day:'numeric',timeZone:'UTC'}),
      sub:d.toLocaleDateString(undefined,{year:'numeric',timeZone:'UTC'})+' · first available Cloudflare record'
    };
  }
  async function loadLifetime(){
    try{
      var res=await fetch('/api/lifetime',{headers:{'Accept':'application/json'}});
      var data=await res.json();
      if(!res.ok)throw new Error(data.message||data.error||'Request failed');
      setText('lifeViews',fmt(data.summary.pageViews));
      setText('lifeVisits',fmt(data.summary.visits));
      setText('lifePpv',Number(data.summary.pagesPerVisit||0).toFixed(2));
      var p=dateParts(data.meta.firstSeen);
      setText('lifeSince',p.main);
      setText('lifeSinceSub',p.sub);
      setText('lifeNote',(data.meta.empty?'No analytics data in available history. ': '')+(data.meta.coverage.retentionLimited?'History begins '+data.meta.coverage.start+' due to Cloudflare retention. ': '')+(data.note||''));
    }catch(err){
      setText('lifeViews','—');setText('lifeVisits','—');setText('lifePpv','—');setText('lifeSince','—');
      setText('lifeNote',err.message);
    }
  }
  window.addEventListener('load',loadLifetime);
  document.addEventListener('click',function(e){if(e.target&&e.target.id==='refresh')setTimeout(loadLifetime,80)});
})();
</script>`;

  let out = html.replace('<div id="app">', block + '\n    <div id="app">');
  out = out.replace('</body>', script + '\n</body>');
  return out;
}

function isInternalOrEmbeddedPath(path) {
  const value = String(path || "");
  return value === "/flooring" || value.startsWith("/flooring/");
}

function number(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow,noarchive",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}
