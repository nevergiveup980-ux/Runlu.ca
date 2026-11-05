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
    assert.match(html, new RegExp('\\b' + lang + ':\\{'));
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


test("each language has six decision checks and four worked scenarios", () => {
  const script = html.match(/<script>([\\s\\S]*?)<\\/script>/)?.[1];
  assert.ok(script, "missing preview script");
  const vm = requirePreviewData(script);
  for (const lang of ["en", "zh", "fr", "es"]) {
    assert.equal(vm.checkpoints[lang].items.length, 6, "checkpoints: " + lang);
    assert.equal(vm.scenarios[lang].items.length, 4, "scenarios: " + lang);
    for (const [heading, detail, decision] of vm.scenarios[lang].items) {
      assert.ok(heading.trim() && detail.trim() && decision.trim(), "incomplete case: " + lang);
    }
  }
});

function requirePreviewData(script) {
  const vm = { checkpoints: {}, scenarios: {} };
  const scenarios = script.match(/const scenarios=(\\{[\\s\\S]*?\\});const checkpoints=/)?.[1];
  const checkpoints = script.match(/const checkpoints=(\\{[\\s\\S]*?\\});function render\\(/)?.[1];
  assert.ok(scenarios && checkpoints, "missing localized structured data");
  vm.scenarios = JSON.parse(scenarios);
  vm.checkpoints = JSON.parse(checkpoints);
  return vm;
}

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
