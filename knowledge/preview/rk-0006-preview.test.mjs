import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./RK-0006.html", import.meta.url), "utf8");
const script = html.split("<script>")[1]?.split("</script>")[0];
const raw = script?.split("const copy=")[1]?.split(";\nconst select=")[0];
const copy = raw ? JSON.parse(raw) : null;

test("RK-0006 is clearly a HOLD editorial preview, excluded from indexing", () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /EDITORIAL DRAFT — HOLD — NOT PUBLISHED/);
  assert.doesNotMatch(html, /fetch\([^)]*published\.json/);
});

test("four complete language bodies are embedded with distinct titles", () => {
  assert.ok(copy, "localized content missing or invalid JSON");
  const titles = new Set();
  for (const lang of ["en", "zh", "fr", "es"]) {
    assert.match(html, new RegExp('<option value="' + lang + '">'));
    assert.ok(copy[lang]?.title?.trim(), "missing title: " + lang);
    const minimumLength = lang === "zh" ? 650 : 1200;
    assert.ok(copy[lang]?.body?.length > minimumLength, "body unexpectedly short: " + lang);
    assert.ok(copy[lang]?.notice && copy[lang]?.footer, "missing review notice: " + lang);
    assert.match(copy[lang].body, /100/);
    assert.match(copy[lang].body, /65/);
    assert.match(copy[lang].body, /35/);
    assert.match(copy[lang].body, /80/);
    assert.match(copy[lang].body, /30/);
    assert.match(copy[lang].body, /20/);
    titles.add(copy[lang].title);
  }
  assert.equal(titles.size, 4);
});

test("language control updates visible content, document language and URL", () => {
  assert.match(html, /data-runlu-language-select/);
  assert.match(html, /document\.documentElement\.lang=lang/);
  assert.match(html, /document\.title=c\.title/);
  assert.match(html, /document\.getElementById\("content"\)\.lang=lang/);
  assert.match(html, /select\.addEventListener\("change"/);
  assert.match(html, /searchParams\.set\("lang",select\.value\)/);
  for (const id of ["title", "notice", "content", "footer"]) assert.ok(html.includes('id="' + id + '"'));
});

test("editorial references are linked and mobile layout is present", () => {
  assert.match(html, /RK-0006-RESEARCH-BRIEF\.md/);
  assert.match(html, /RK-0006-INDEPENDENT-REVIEW-PACKET\.md/);
  assert.match(html, /@media\(max-width:480px\)/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /aria-live="polite"/);
});

test("all four languages distinguish future receipts from today's physical stock", () => {
  assert.ok(copy, "localized content missing");
  const warnings = {
    en: /future expected delivery[^<]*does not mean[^<]*physically present today/i,
    zh: /预计未来到货[^<]*不能当作今天已经入库的现货/,
    fr: /Une réception prévue ne constitue pas du stock physiquement reçu aujourd’hui/,
    es: /Una recepción prevista no equivale a existencias físicamente recibidas hoy/
  };
  for (const [lang, warning] of Object.entries(warnings)) {
    assert.match(copy[lang].body.replace(/<[^>]+>/g, ""), warning, "missing future-receipts warning: " + lang);
  }
});

test("four-language scenario safeguards stay attached to their calculations", () => {
  assert.equal(100 - 65, 35);
  assert.ok(35 < 50, "scenario A must not promise 50 LF");
  assert.equal(80 - 30 - 20, 30);
  const safeguards = {
    en: [/new order asking for 50 linear feet cannot be confirmed/i, /assuming these categories do not overlap/i, /must not release a hold/i],
    zh: [/新订单要求 50 LF[^。]*不能/, /数量互不重叠/, /必须由有权限的人员核实并批准/],
    fr: [/demande de 50 pieds linéaires ne peut donc pas être confirmée/i, /groupes ne se chevauchent pas/i, /sans autorisation/i],
    es: [/nuevo pedido de 50 pies lineales/i, /categorías no se superponen/i, /sin la autorización correspondiente/i]
  };
  for (const [lang, checks] of Object.entries(safeguards)) {
    const body = copy[lang].body.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ");
    for (const check of checks) assert.match(body, check, lang + " scenario safety condition missing");
    assert.match(body, /RK-0005/, lang + " must retain cut-geometry cross-reference");
  }
});
