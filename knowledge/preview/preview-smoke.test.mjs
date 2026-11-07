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
  const script = html.split("<script>")[1]?.split("</script>")[0];
  assert.ok(script, "missing preview script");
  const scenarioText = script.split("const scenarios=")[1]?.split(";const checkpoints=")[0];
  const checkpointText = script.split(";const checkpoints=")[1]?.split(";function render()")[0];
  assert.ok(scenarioText && checkpointText, "missing localized structured data");
  const scenarios = JSON.parse(scenarioText);
  const checkpoints = JSON.parse(checkpointText);
  for (const lang of ["en", "zh", "fr", "es"]) {
    assert.equal(checkpoints[lang].items.length, 6, "checkpoints: " + lang);
    assert.equal(scenarios[lang].items.length, 4, "scenarios: " + lang);
    for (const [heading, detail, decision] of scenarios[lang].items) {
      assert.ok(heading.trim() && detail.trim() && decision.trim(), "incomplete case: " + lang);
    }
  }
});

test("practitioner account stays distinct and qualified in every language", () => {
  const script = html.split("<script>")[1]?.split("</script>")[0];
  const practiceText = script?.split("const practice=")[1]?.split(";function render()")[0];
  assert.ok(practiceText, "missing practitioner account translations");
  const practice = JSON.parse(practiceText);
  for (const lang of ["en", "zh", "fr", "es"]) {
    assert.ok(practice[lang].heading.trim());
    assert.ok(practice[lang].story.trim());
    assert.ok(practice[lang].boundary.trim());
  }
  for (const id of ["practiceHeading", "practiceStory", "practiceBoundary"]) {
    assert.ok(html.includes('id="' + id + '"'), "missing preview element " + id);
    assert.ok(html.includes('getElementById("' + id + '").textContent=practice[lang].'), "missing render binding " + id);
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
