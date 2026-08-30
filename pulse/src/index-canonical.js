import lifetimeWorker from "./index-lifetime.js";

const FRIENDLY_DIRECTORY_NAMES = new Map([
  ["/book/", "Book"],
  ["/last-one-to-leave/", "Last One to Leave"]
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await lifetimeWorker.fetch(request, env);

    if (request.method !== "GET") return response;

    const contentType = response.headers.get("Content-Type") || "";

    if (url.pathname === "/api/analytics" && contentType.includes("application/json") && response.ok) {
      const data = await response.json();
      if (Array.isArray(data.pages)) {
        data.pages = canonicalizePages(data.pages);
      }
      data.meta = {
        ...(data.meta || {}),
        pageCanonicalization: "Directory index aliases such as /book/ and /book/index.html are combined."
      };
      return jsonResponse(data, response);
    }

    if (contentType.includes("text/html")) {
      const html = await response.text();
      const transformed = html.replace(
        "Homepage combines / and /index.html",
        "Directory index aliases are combined"
      );
      const headers = new Headers(response.headers);
      headers.set("Content-Length", String(new TextEncoder().encode(transformed).length));
      return new Response(transformed, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  }
};

function canonicalizePages(rows) {
  const map = new Map();

  for (const row of rows) {
    const name = canonicalPageName(row?.name);
    const current = map.get(name) || { name, views: 0, visits: 0 };
    current.views += number(row?.views);
    current.visits += number(row?.visits);
    map.set(name, current);
  }

  return [...map.values()].sort((a, b) => b.views - a.views);
}

function canonicalPageName(input) {
  let path = String(input || "/").trim() || "/";

  if (path === "Homepage") return "Homepage";

  path = path.replace(/\/{2,}/g, "/");

  if (path === "/index.html" || path === "/index.htm") {
    path = "/";
  } else if (/\/index\.html?$/i.test(path)) {
    path = path.replace(/index\.html?$/i, "");
  }

  if (path === "/") return "Homepage";

  return FRIENDLY_DIRECTORY_NAMES.get(path) || path;
}

function number(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function jsonResponse(body, original) {
  const headers = new Headers(original.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.delete("Content-Length");
  return new Response(JSON.stringify(body), {
    status: original.status,
    statusText: original.statusText,
    headers
  });
}
