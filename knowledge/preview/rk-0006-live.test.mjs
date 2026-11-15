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
