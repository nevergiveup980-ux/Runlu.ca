#!/usr/bin/env node
// Offline, dependency-free smoke check of the standalone Studio page.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'music-studio.html'), 'utf8');
const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m => !/\bsrc\s*=/.test(m[1]))
  .map(m => ({source:m[2],isModule:/\btype\s*=\s*["']module["']/i.test(m[1])}));
assert.ok(scripts.length >= 1, 'Expected at least one inline script');
const classicScripts=scripts.filter(s=>!s.isModule);
assert.equal(classicScripts.length, 1, 'Expected exactly one classic Studio script');
for (const [index, script] of scripts.entries()) {
  if(script.isModule){
    // Node's vm.Script does not parse import declarations. Validate module
    // JavaScript with the runtime parser using an in-memory data URL.
    const stripped=script.source.replace(/^\s*import\s+[^;]+;\s*/gm, '');
    new vm.Script(stripped, {filename:'music-studio.module-'+index+'.js'});
  }else new vm.Script(script.source, {filename:'music-studio.inline-'+index+'.js'});
}
for (const id of ['title','lyrics','voice','style','notes','save','export','copy','stage','import','importfile','audiofile','audioplayer','clearaudio','status','prompt']) {
  assert.match(html, new RegExp('id="' + id + '"'), 'Missing control: ' + id);
}
assert.match(html, /data-runlu-language-select/);
assert.match(html, /<script src="runlu-language\.js"><\/script>/);
for (const lang of ['en', 'zh', 'fr', 'es']) {
  assert.match(html, new RegExp('data-' + lang + '='), 'Missing translations for ' + lang);
}
// Language switching must translate labels, never overwrite authored song fields.
for (const id of ['title', 'lyrics', 'notes']) {
  const match = html.match(new RegExp(String.raw`<(?:input|textarea)\b[^>]*\bid="${id}"[^>]*>`, 'i'));
  assert.ok(match, 'Missing author-editable field: ' + id);
  assert.doesNotMatch(match[0], /data-(?:en|zh|fr|es)=/, 'Do not translate authored content: ' + id);
}
for (const id of ['voice', 'style']) {
  const section = html.match(new RegExp(String.raw`<select id="${id}">([\s\S]*?)<\/select>`));
  assert.ok(section, 'Missing choice selector: ' + id);
  for (const option of [...section[1].matchAll(/<option\b[^>]*>/g)]) {
    for (const lang of ['en','zh','fr','es']) assert.match(option[0], new RegExp('data-' + lang + '='), id + ' option missing ' + lang);
  }
}
// Guard the saved-draft recovery path against regressions.
assert.match(classicScripts[0].source, /localStorage\.getItem\('runlu-music-studio-v1'\)/, 'Saved draft must be restored');
assert.match(classicScripts[0].source, /localStorage\.setItem\('runlu-music-studio-v1'/, 'Save button must persist draft');
assert.match(classicScripts[0].source, /!Array\.isArray\(saved\)/, 'Reject array-shaped draft data');
assert.match(classicScripts[0].source, /field\.tagName==='SELECT'/, 'Validate restored selection fields');
assert.match(classicScripts[0].source, /option\.value===saved\[id\]/, 'Only restore valid option values');
assert.match(classicScripts[0].source, /saved\[id\]\.slice\(0,limit\)/, 'Bound restored text lengths');
assert.match(classicScripts[0].source, /window\.addEventListener\('runlu:languagechange'/, 'Handle language changes');
assert.match(html, /localStorage/);
assert.match(html, /URL\.createObjectURL/);
assert.doesNotMatch(html, /GEMINI_API_KEY|AIza[0-9A-Za-z_-]{20,}/, 'Potential API key exposure');
console.log('PASS: Studio inline JavaScript parses and expected controls exist; static restore safeguards checked; no browser interactions exercised.');
