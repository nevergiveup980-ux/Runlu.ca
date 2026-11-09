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
  assert.match(html, /select\.addEventListener\("change"/);
  assert.match(html, /searchParams\.set\("lang",select\.value\)/);
  for (const id of ["title", "notice", "content", "footer"]) assert.ok(html.includes('id="' + id + '"'));
});

test("editorial references are linked and mobile layout is present", () => {
  assert.match(html, /RK-0006-RESEARCH-BRIEF\.md/);
  assert.match(html, /RK-0006-INDEPENDENT-REVIEW-PACKET\.md/);
  assert.match(html, /@media\(max-width:480px\)/);
});
