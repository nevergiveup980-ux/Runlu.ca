const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
const ALLOWED_RANGES = new Set([1, 7, 30]);

const ANALYTICS_QUERY = `
query RunluPulse($accountTag: string!, $start: Time!, $end: Time!, $host: string!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      totals: rumPageloadEventsAdaptiveGroups(
        limit: 1
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestHost: $host
          bot: 0
        }
      ) {
        count
        sum { visits }
      }
      trend: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [date_ASC]
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestHost: $host
          bot: 0
        }
      ) {
        count
        sum { visits }
        dimensions { date }
      }
      pages: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestHost: $host
          bot: 0
        }
      ) {
        count
        sum { visits }
        dimensions { requestPath }
      }
      countries: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestHost: $host
          bot: 0
        }
      ) {
        count
        sum { visits }
        dimensions { countryName }
      }
      browsers: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestHost: $host
          bot: 0
        }
      ) {
        count
        sum { visits }
        dimensions { userAgentBrowser }
      }
      devices: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestHost: $host
          bot: 0
        }
      ) {
        count
        sum { visits }
        dimensions { deviceType }
      }
      referrers: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: {
          datetime_geq: $start
          datetime_leq: $end
          requestHost: $host
          bot: 0
        }
      ) {
        count
        sum { visits }
        dimensions { refererHost }
      }
    }
  }
}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "RUNLU Pulse", readOnly: true });
    }

    if (url.pathname === "/api/analytics") {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const requestedDays = Number.parseInt(url.searchParams.get("days") || "7", 10);
      const days = ALLOWED_RANGES.has(requestedDays) ? requestedDays : 7;

      try {
        const data = await fetchAnalytics(env, days);
        return json(data, 200, { "Cache-Control": "private, max-age=60" });
      } catch (error) {
        console.error("RUNLU Pulse analytics error", error);
        return json(
          {
            error: "Analytics query failed"
          },
          502,
          { "Cache-Control": "no-store" }
        );
      }
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    return new Response(DASHBOARD_HTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }
};

async function fetchAnalytics(env, days) {
  if (!env.CF_ANALYTICS_TOKEN) throw new Error("Missing CF_ANALYTICS_TOKEN secret");
  if (!env.CF_ACCOUNT_ID) throw new Error("Missing CF_ACCOUNT_ID secret");

  const host = env.RUNLU_HOST || "runlu.ca";
  const homeCountry = env.RUNLU_HOME_COUNTRY || "CA";
  const end = new Date();
  const start = new Date(
    Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate() - (days - 1),
      0,
      0,
      0,
      0
    )
  );

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      query: ANALYTICS_QUERY,
      variables: {
        accountTag: env.CF_ACCOUNT_ID,
        start: start.toISOString(),
        end: end.toISOString(),
        host
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(`Cloudflare GraphQL returned HTTP ${response.status}`);
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((item) => item.message).join("; "));
  }

  const account = payload?.data?.viewer?.accounts?.[0];
  if (!account) throw new Error("No Cloudflare analytics account data returned");

  const totalRow = account.totals?.[0] || {};
  const pageViews = number(totalRow.count);
  const visits = number(totalRow.sum?.visits);
  const pages = combinePages(account.pages || []);
  const countries = normalizeGroups(account.countries, "countryName", "Unknown");
  const browsers = normalizeGroups(account.browsers, "userAgentBrowser", "Unknown");
  const devices = normalizeGroups(account.devices, "deviceType", "Unknown");
  const referrers = normalizeGroups(account.referrers, "refererHost", "Direct / no referrer");
  const trend = (account.trend || []).map((row) => ({
    date: row.dimensions?.date || "",
    views: number(row.count),
    visits: number(row.sum?.visits)
  }));

  const possibleExternal = countries
    .filter((item) => item.name && item.name !== homeCountry && item.name !== "Unknown")
    .reduce(
      (acc, item) => {
        acc.views += item.views;
        acc.visits += item.visits;
        return acc;
      },
      { views: 0, visits: 0 }
    );

  const direct = referrers.find((item) => item.name === "Direct / no referrer") || { views: 0, visits: 0 };
  const externalReferrals = referrers
    .filter((item) => item.name !== "Direct / no referrer" && item.name !== host)
    .reduce((sum, item) => sum + item.views, 0);

  return {
    meta: {
      host,
      days,
      start: start.toISOString(),
      end: end.toISOString(),
      generatedAt: new Date().toISOString(),
      source: "Cloudflare Web Analytics / RUM",
      botsExcluded: true,
      readOnly: true
    },
    summary: {
      pageViews,
      visits,
      pagesPerVisit: visits > 0 ? round(pageViews / visits, 2) : 0,
      possibleExternalViews: possibleExternal.views,
      possibleExternalVisits: possibleExternal.visits,
      directViews: direct.views,
      externalReferralViews: externalReferrals
    },
    trend,
    pages,
    countries,
    browsers,
    devices,
    referrers,
    note: "Possible external traffic is a heuristic based on countries outside the configured home country. Cloudflare Web Analytics is privacy-focused and does not expose visitor identity or IP addresses here."
  };
}

function combinePages(rows) {
  const map = new Map();
  for (const row of rows) {
    const raw = row.dimensions?.requestPath || "/";
    const name = raw === "/" || raw === "/index.html" ? "Homepage" : raw;
    const current = map.get(name) || { name, views: 0, visits: 0 };
    current.views += number(row.count);
    current.visits += number(row.sum?.visits);
    map.set(name, current);
  }
  return [...map.values()].sort((a, b) => b.views - a.views);
}

function normalizeGroups(rows = [], dimension, emptyLabel) {
  return rows
    .map((row) => ({
      name: row.dimensions?.[dimension] || emptyLabel,
      views: number(row.count),
      visits: number(row.sum?.visits)
    }))
    .sort((a, b) => b.views - a.views);
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
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

const DASHBOARD_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>RUNLU Pulse</title>
  <style>
    :root{--bg:#f4f1e9;--panel:#faf8f2;--ink:#1c1c19;--muted:#77746d;--line:#d9d5ca;--soft:#ebe7dd;--accent:#244638;--danger:#7d4d42}
    *{box-sizing:border-box}html{background:var(--bg);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{margin:0;min-height:100vh;background:linear-gradient(180deg,#f7f4ed 0%,#f0ede5 100%)}
    .shell{width:min(1180px,calc(100% - 36px));margin:0 auto;padding:34px 0 70px}.topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:56px}.brand{font-size:14px;letter-spacing:.18em;font-weight:650}.back{color:var(--muted);text-decoration:none;font-size:13px}.back:hover{color:var(--ink)}
    .hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:34px;align-items:end;margin-bottom:30px}.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 14px}.hero h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(52px,8vw,96px);font-weight:400;letter-spacing:-.055em;line-height:.9;margin:0}.hero-copy{font-size:15px;line-height:1.65;color:#57544e;padding-bottom:6px}.status{display:inline-flex;align-items:center;gap:8px;margin-top:14px;font-size:12px;color:var(--accent)}.dot{width:7px;height:7px;border-radius:50%;background:var(--accent)}
    .controls{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:15px 0 22px;border-top:1px solid var(--line)}.ranges{display:flex;gap:6px}.range,.refresh{appearance:none;border:1px solid var(--line);background:rgba(255,255,255,.38);color:var(--ink);border-radius:999px;padding:8px 13px;font:inherit;font-size:12px;cursor:pointer}.range.active{background:var(--ink);border-color:var(--ink);color:#fff}.refresh:hover,.range:hover{border-color:#aaa69b}.updated{font-size:12px;color:var(--muted)}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}.metric,.panel{background:rgba(250,248,242,.72);border:1px solid var(--line);border-radius:18px}.metric{padding:22px}.metric .label{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:17px}.metric .value{font-family:Georgia,"Times New Roman",serif;font-size:42px;letter-spacing:-.04em}.metric .sub{font-size:12px;color:var(--muted);margin-top:8px}
    .grid{display:grid;grid-template-columns:1.35fr .65fr;gap:12px}.panel{padding:24px;min-width:0}.panel h2{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:25px;margin:0 0 6px}.panel-note{font-size:12px;color:var(--muted);margin-bottom:22px}.wide{grid-column:1/-1}.chart{height:220px;display:flex;align-items:flex-end;gap:8px;padding-top:14px;border-bottom:1px solid var(--line)}.bar-wrap{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:8px}.bar{width:min(38px,80%);min-height:2px;background:var(--ink);border-radius:5px 5px 0 0}.bar-label{font-size:10px;color:var(--muted);white-space:nowrap}.bar-value{font-size:10px;color:var(--ink)}
    table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:var(--muted);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.07em;padding:0 8px 11px 0;border-bottom:1px solid var(--line)}td{padding:11px 8px 11px 0;border-bottom:1px solid var(--soft);vertical-align:top}th.num,td.num{text-align:right;padding-right:0}.name{max-width:360px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.share{color:var(--muted)}
    .signal{display:grid;grid-template-columns:1fr 1fr;gap:10px}.signal-card{border:1px solid var(--line);border-radius:14px;padding:16px}.signal-card strong{font-family:Georgia,"Times New Roman",serif;font-size:28px;font-weight:400}.signal-card span{display:block;font-size:11px;color:var(--muted);margin-top:6px}.caveat{margin-top:18px;padding-top:18px;border-top:1px solid var(--line);font-size:12px;line-height:1.6;color:var(--muted)}
    .loading,.error{padding:50px 24px;text-align:center;color:var(--muted)}.error{color:var(--danger)}.footer{display:flex;justify-content:space-between;gap:18px;margin-top:24px;padding-top:18px;border-top:1px solid var(--line);font-size:11px;color:var(--muted)}
    @media(max-width:820px){.hero,.grid{grid-template-columns:1fr}.hero{gap:18px}.metrics{grid-template-columns:repeat(2,1fr)}.wide{grid-column:auto}.hero-copy{max-width:620px}.topbar{margin-bottom:42px}}
    @media(max-width:520px){.shell{width:min(100% - 24px,1180px);padding-top:22px}.metrics{grid-template-columns:1fr 1fr;gap:8px}.metric{padding:17px}.metric .value{font-size:34px}.panel{padding:18px}.controls{align-items:flex-start;flex-direction:column}.updated{order:-1}.signal{grid-template-columns:1fr}.footer{flex-direction:column}}
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar"><div class="brand">RUNLU · PULSE</div><a class="back" href="https://runlu.ca/">Return to RUNLU ↗</a></header>
    <section class="hero">
      <div><p class="eyebrow">Quiet signals from the outside world</p><h1>RUNLU<br>Pulse</h1></div>
      <div class="hero-copy">A private, read-only view of RUNLU traffic. Built on Cloudflare Web Analytics, with bots excluded and no visitor identity exposed.<div class="status"><span class="dot"></span><span>Analytics read only</span></div></div>
    </section>
    <div class="controls">
      <div class="ranges"><button class="range" data-days="1">Today</button><button class="range active" data-days="7">7 days</button><button class="range" data-days="30">30 days</button></div>
      <div class="updated" id="updated">Loading…</div>
      <button class="refresh" id="refresh">Refresh</button>
    </div>
    <div id="app"><div class="loading">Reading Cloudflare Web Analytics…</div></div>
    <footer class="footer"><span>RUNLU Pulse V0.1</span><span>No write operations · no public visitor profiles</span></footer>
  </main>
<script>
(function(){
  var currentDays=7;
  var app=document.getElementById('app');
  var updated=document.getElementById('updated');
  var buttons=[].slice.call(document.querySelectorAll('.range'));
  document.getElementById('refresh').addEventListener('click',function(){load(currentDays)});
  buttons.forEach(function(button){button.addEventListener('click',function(){currentDays=Number(button.getAttribute('data-days'));buttons.forEach(function(b){b.classList.toggle('active',b===button)});load(currentDays)})});

  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
  function pct(value,total){return total>0?Math.round(value/total*1000)/10:0}
  function fmt(value){return new Intl.NumberFormat().format(Number(value||0))}
  function shortDate(value){var d=new Date(value+'T00:00:00Z');return d.toLocaleDateString(undefined,{month:'short',day:'numeric',timeZone:'UTC'})}

  async function load(days){
    app.innerHTML='<div class="loading">Reading Cloudflare Web Analytics…</div>';
    updated.textContent='Refreshing…';
    try{
      var res=await fetch('/api/analytics?days='+days,{headers:{'Accept':'application/json'}});
      var data=await res.json();
      if(!res.ok)throw new Error(data.message||data.error||'Request failed');
      render(data);
      updated.textContent='Updated '+new Date(data.meta.generatedAt).toLocaleString();
    }catch(err){
      app.innerHTML='<div class="error">Pulse could not read analytics.<br><small>'+esc(err.message)+'</small></div>';
      updated.textContent='Update failed';
    }
  }

  function metric(label,value,sub){return '<div class="metric"><div class="label">'+esc(label)+'</div><div class="value">'+fmt(value)+'</div><div class="sub">'+esc(sub)+'</div></div>'}
  function table(title,note,rows,total){
    var body=rows.slice(0,10).map(function(row){return '<tr><td class="name">'+esc(row.name)+'</td><td class="num">'+fmt(row.views)+'</td><td class="num share">'+pct(row.views,total)+'%</td></tr>'}).join('');
    return '<section class="panel"><h2>'+esc(title)+'</h2><div class="panel-note">'+esc(note)+'</div><table><thead><tr><th>Name</th><th class="num">Views</th><th class="num">Share</th></tr></thead><tbody>'+body+'</tbody></table></section>';
  }
  function trend(data){
    var max=Math.max.apply(null,data.map(function(x){return x.views}).concat([1]));
    var bars=data.map(function(row){var h=Math.max(2,Math.round(row.views/max*170));return '<div class="bar-wrap"><div class="bar-value">'+fmt(row.views)+'</div><div class="bar" style="height:'+h+'px"></div><div class="bar-label">'+esc(shortDate(row.date))+'</div></div>'}).join('');
    return '<section class="panel wide"><h2>Daily rhythm</h2><div class="panel-note">Page views by day</div><div class="chart">'+bars+'</div></section>';
  }
  function render(data){
    var s=data.summary;
    var possible=s.possibleExternalVisits;
    var html='<section class="metrics">'+
      metric('Page views',s.pageViews,data.meta.days+' day window')+
      metric('Visits',s.visits,'Cloudflare privacy-preserving visit metric')+
      metric('Pages / visit',s.pagesPerVisit,'Simple engagement signal')+
      metric('Possible external',possible,'Heuristic, not identified people')+
      '</section>';
    html+='<section class="grid">';
    html+=trend(data.trend);
    html+=table('Top pages','Homepage combines / and /index.html',data.pages,s.pageViews);
    html+='<section class="panel"><h2>Outside signal</h2><div class="panel-note">A cautious heuristic, not visitor identification</div><div class="signal"><div class="signal-card"><strong>'+fmt(s.possibleExternalVisits)+'</strong><span>visits outside home country</span></div><div class="signal-card"><strong>'+fmt(s.externalReferralViews)+'</strong><span>views with external referrer</span></div></div><div class="caveat">'+esc(data.note)+'</div></section>';
    html+=table('Countries','Where page views originated',data.countries,s.pageViews);
    html+=table('Browsers','Browser families reported by RUM',data.browsers,s.pageViews);
    html+=table('Devices','Desktop, mobile and other device types',data.devices,s.pageViews);
    html+=table('Referrers','Direct, internal and external referral hosts',data.referrers,s.pageViews);
    html+='</section>';
    app.innerHTML=html;
  }
  load(currentDays);
})();
</script>
</body>
</html>`;