import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./RK-0005.html", import.meta.url), "utf8");

test("editorial preview is explicitly excluded from indexing", () => {
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /NOT REVIEWED OR PUBLISHED/);
});

test("all four language choices and localized content are present", () => {
  for (const lang of ["en", "zh", "fr", "es"]) {
    assert.match(html, new RegExp('<option value="' + lang + '">'));
    assert.match(html, new RegExp('(?:^|[,\\{])' + lang + ':\\{'));
  }
});

test("preview includes the six-point decision framework and four cases", () => {
  assert.match(html, /id="checkpoints"/);
  assert.match(html, /id="cases"/);
  for (const lang of ["en", "zh", "fr", "es"]) {
    const key = '"' + lang + '":';
    assert.ok(html.includes(key) || html.includes(lang + ":{"), "missing localized scenario data: " + lang);
  }
});

test("language switch updates visible content and shareable URL", () => {
  assert.match(html, /languageSelect\.addEventListener\("change"/);
  assert.match(html, /url\.searchParams\.set\("lang",languageSelect\.value\)/);
  assert.match(html, /document\.title=copy\[lang\]\.title/);
});

test("review packet and manuscript are linked without publication promotion", () => {
  assert.match(html, /knowledge\/editorial\/RK-0005-INVENTORY-FULFILLMENT\.md/);
  assert.match(html, /knowledge\/reviews\/RK-0005-REVIEW-PACKET\.md/);
  assert.doesNotMatch(html, /fetch\([^)]*published\.json/);
});
