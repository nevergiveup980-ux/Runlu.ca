import baseWorker from "./index.js";

const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
const ALLOWED_RANGES = new Set([1, 7, 30]);
const DEFAULT_TIME_ZONE = "America/Edmonton";

const ANALYTICS_QUERY = `
query RunluPulse($accountTag: string!, $start: Time!, $end: Time!, $host: string!) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      totals: rumPageloadEventsAdaptiveGroups(
        limit: 1
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } }
      trend: rumPageloadEventsAdaptiveGroups(
        limit: 1000
        orderBy: [datetimeHour_ASC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } dimensions { datetimeHour } }
      pages: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } dimensions { requestPath } }
      countries: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } dimensions { countryName } }
      browsers: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } dimensions { userAgentBrowser } }
      devices: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } dimensions { deviceType } }
      referrers: rumPageloadEventsAdaptiveGroups(
        limit: 100
        orderBy: [count_DESC]
        filter: { datetime_geq: $start, datetime_leq: $end, requestHost: $host, bot: 0 }
      ) { count sum { visits } dimensions { refererHost } }
    }
  }
}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/analytics") {
      return baseWorker.fetch(request, env);
    }

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
      return json({ error: "Analytics query failed" }, 502, { "Cache-Control": "no-store" });
    }
  }
};

async function fetchAnalytics(env, days) {
  if (!env.CF_ANALYTICS_TOKEN) throw new Error("Missing CF_ANALYTICS_TOKEN secret");
  if (!env.CF_ACCOUNT_ID) throw new Error("Missing CF_ACCOUNT_ID secret");

  const host = env.RUNLU_HOST || "runlu.ca";
  const homeCountry = env.RUNLU_HOME_COUNTRY || "CA";
  const timeZone = env.RUNLU_TIME_ZONE || DEFAULT_TIME_ZONE;
  assertTimeZone(timeZone);

  const end = new Date();
  const start = startOfLocalDay(end, timeZone, days - 1);

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
  if (payload.errors?.length) throw new Error(payload.errors.map((item) => item.message).join("; "));

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
  const trend = aggregateHourlyTrend(account.trend || [], end, timeZone, days);

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
      timeZone,
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

function aggregateHourlyTrend(rows, end, timeZone, days) {
  const dayKeys = localDayKeys(end, timeZone, days);
  const map = new Map(dayKeys.map((date) => [date, { date, views: 0, visits: 0 }]));

  for (const row of rows) {
    const hour = row.dimensions?.datetimeHour;
    if (!hour) continue;
    const date = localDateKey(new Date(hour), timeZone);
    const current = map.get(date);
    if (!current) continue;
    current.views += number(row.count);
    current.visits += number(row.sum?.visits);
  }

  return dayKeys.map((date) => map.get(date));
}

function localDayKeys(end, timeZone, days) {
  const current = localDateParts(end, timeZone);
  const result = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(Date.UTC(current.year, current.month - 1, current.day - offset));
    result.push(dateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()));
  }
  return result;
}

function startOfLocalDay(end, timeZone, daysBack) {
  const current = localDateParts(end, timeZone);
  const target = new Date(Date.UTC(current.year, current.month - 1, current.day - daysBack));
  return zonedTimeToUtc(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    target.getUTCDate(),
    0,
    0,
    0,
    timeZone
  );
}

function zonedTimeToUtc(year, month, day, hour, minute, second, timeZone) {
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = new Date(desired);

  for (let i = 0; i < 4; i += 1) {
    const parts = localDateTimeParts(guess, timeZone);
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const correction = desired - represented;
    if (correction === 0) break;
    guess = new Date(guess.getTime() + correction);
  }

  return guess;
}

function localDateKey(date, timeZone) {
  const parts = localDateParts(date, timeZone);
  return dateKey(parts.year, parts.month, parts.day);
}

function dateKey(year, month, day) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function localDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  return partsObject(parts);
}

function localDateTimeParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  return partsObject(parts);
}

function partsObject(parts) {
  const values = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return values;
}

function assertTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format(new Date());
  } catch {
    throw new Error(`Invalid RUNLU_TIME_ZONE: ${timeZone}`);
  }
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
