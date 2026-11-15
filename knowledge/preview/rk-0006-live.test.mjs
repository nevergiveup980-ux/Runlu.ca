import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./RK-0006.html", import.meta.url), "utf8");
const extract = (start, end) => {
  const value = html.split(start)[1]?.split(end)[0];
  assert.ok(value, "missing embedded data: " + start);
  return value;
};
const copy = JSON.parse(extract("const copy=", ";\nconst ui="));
// UI labels are JavaScript literals, checked as text below.

test("public review preview is excluded from indexing and not represented as approved", () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /PUBLIC REVIEW PREVIEW/);
  assert.match(html, /knowledge\/reviews\/RK-0006-RESEARCH-BRIEF\.md/);
  assert.match(html, /knowledge\/reviews\/RK-0006-INDEPENDENT-REVIEW-PACKET\.md/);
});

test("all four languages have full article and visible review notices", () => {
  for (const lang of ["en", "zh", "fr", "es"]) {
    assert.ok(copy[lang]?.title?.length > 10, lang + " title");
    assert.ok(copy[lang]?.notice?.length > 20, lang + " notice");
    assert.ok(copy[lang]?.body?.length > 600, lang + " body");
    assert.match(html, new RegExp('<option value="' + lang + '">'));
  }
});

test("live preview localizes status, language label, links and HOLD footer", () => {
  for (const id of ["status", "langLabel", "researchLink", "reviewLink", "footer"]) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  for (const word of ["公开审核预览", "APERÇU PUBLIC POUR RÉVISION", "VISTA PREVIA PÚBLICA", "暂缓发布", "EN ATTENTE", "EN ESPERA"]) {
    assert.ok(html.includes(word), "missing translated review label: " + word);
  }
  assert.match(html, /document\.getElementById\("footer"\)\.textContent=/);
  assert.match(html, /document\.documentElement\.lang=lang/);
  assert.match(html, /searchParams\.set\("lang",select\.value\)/);
});

test("live four-language examples preserve arithmetic and operational safeguards", () => {
  assert.equal(100 - 65, 35);
  assert.equal(80 - 30 - 20, 30);
  const patterns = {
    en: [/100 linear feet/i, /65 linear feet/i, /35 linear feet/i, /50 linear feet/i, /80 linear feet/i, /30 linear feet/i, /20 linear feet/i, /categories do not overlap/i, /must not release a hold/i],
    zh: [/100 线性英尺/, /65 LF/, /35 LF/, /50 LF/, /80 LF/, /30 LF/, /20 LF/, /互不重叠/, /有权限的人员/],
    fr: [/100 pieds linéaires/, /65 déjà engagés/, /35 pieds linéaires/, /50 pieds linéaires/, /80 pieds linéaires/, /30 sont exclus/, /20 autres pieds linéaires/, /ne se chevauchent pas/, /sans autorisation/],
    es: [/100 pies lineales/, /65 pies lineales/, /35 pies lineales/, /50 pies lineales/, /80 pies lineales/, /30 pies lineales/, /20 pies lineales/, /no se superponen/, /sin la autorización correspondiente/]
  };
  for (const [lang, checks] of Object.entries(patterns)) {
    const body = copy[lang].body.replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ");
    for (const pattern of checks) assert.match(body, pattern, lang + " scenario condition");
    assert.match(body, /RK-0005/, lang + " must distinguish cut geometry");
  }
});


test("language deep link survives refresh and unsupported codes fall back to English", () => {
  // Source-level contract: render() uses the query parameter on every page load.
  assert.match(html, /const params=new URLSearchParams\(location\.search\)/);
  assert.match(html, /render\(copy\[params\.get\("lang"\)\]\?params\.get\("lang"\):"en"\)/);
  assert.match(html, /document\.documentElement\.lang=lang/);
  assert.match(html, /select\.value=lang/);
  assert.match(html, /history\.replaceState\(null,"",u\)/);
  assert.match(html, /searchParams\.set\("lang",select\.value\)/);
});


test("language selector accessible name follows its translated visible label", () => {
  assert.match(html, /<label id="langLabel" for="lang">/);
  assert.match(html, /<select id="lang" data-runlu-language-select>/);
  assert.doesNotMatch(html, /<select id="lang"[^>]*aria-label=/);
  assert.match(html, /document\.getElementById\("langLabel"\)\.textContent=labels\.language/);
  assert.match(html, /select:focus-visible,a:focus-visible/);
});
